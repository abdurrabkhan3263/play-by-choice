import prismaClient from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { stream_id: string } }
) {
  const { user, isUpVoted } = await req.json();
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

    if (upvoteAlreadyExists && isUpVoted) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Already upvoted stream",
        },
        { status: 200 }
      );
    }

    if (isUpVoted) {
      const res = await prismaClient.upvote.create({
        data: {
          streamId: params.stream_id,
          userId: user.id,
        },
      });

      if (!res) {
        return NextResponse.json({
          status: "Error",
          message: "Failed to upvote stream",
        });
      }

      return NextResponse.json({
        status: "Success",
        message: "Upvoted stream",
        data: res,
      });
    }

    if (!upvoteAlreadyExists && !isUpVoted) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Already downvoted stream",
        },
        { status: 200 }
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
      return NextResponse.json({
        status: "Error",
        message: "Failed to downvote stream",
      });
    }

    return NextResponse.json({
      status: "Success",
      message: "Downvoted stream",
      data: res,
    });
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
