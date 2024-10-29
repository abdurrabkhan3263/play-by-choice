import prismaClient from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { stream_id: string } }
) {
  const { user } = await req.json();
  if (!user || !params.stream_id) {
    return NextResponse.json(
      { status: "Error", message: "Invalid user and stream id" },
      { status: 400 }
    );
  }

  try {
    const upvoteAlreadyExists = await prismaClient.upvote.findFirst({
      where: {
        AND: [{ streamId: params.stream_id }, { userId: user.id }],
      },
    });

    if (upvoteAlreadyExists) {
      throw new Error("Upvote already exists");
    }

    const res = await prismaClient.upvote.create({
      data: {
        streamId: params.stream_id,
        userId: user.id,
      },
    });
    if (!res) {
      return NextResponse.json(
        { status: "Error", message: "Failed to upvote stream" },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "Upvoted stream",
        data: res,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message:
          error instanceof Error ? error?.message : "Failed to upvote stream",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { stream_id: string } }
) {
  const { user } = await req.json();
  if (!params.stream_id || !user) {
    return NextResponse.json(
      { status: "Error", message: "Invalid stream id and user" },
      { status: 400 }
    );
  }

  try {
    const upvoteAlreadyExists = await prismaClient.upvote.findFirst({
      where: {
        AND: [{ streamId: params.stream_id }, { userId: user.id }],
      },
    });

    if (!upvoteAlreadyExists) {
      return NextResponse.json(
        { status: "Error", message: "Upvote does not exist" },
        { status: 400 }
      );
    }

    const res = await prismaClient.upvote.delete({
      where: {
        userId_streamId: {
          userId: user.id,
          streamId: params.stream_id,
        },
      },
    });

    if (!res) {
      return NextResponse.json(
        { status: "Error", message: "Failed to remove upvote" },
        { status: 500 }
      );
    }
    return NextResponse.json({ status: "Success", message: "Removed upvote" });
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message: error instanceof Error ? error : "Failed to remove upvote",
      },
      { status: 500 }
    );
  }
}
