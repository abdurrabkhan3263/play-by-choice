import { NextRequest, NextResponse } from "next/server";
import { CreateStreamType } from "@/types";
import prismaClient from "@/lib/db";

export async function POST(req: NextRequest) {
  const { spaceName, streams, email } = await req.json();

  const checkUserExist = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });

  if (!checkUserExist) {
    return NextResponse.json(
      {
        status: "Error",
        message: `User not found`,
      },
      { status: 404 }
    );
  }

  try {
    const createSpace = await prismaClient.space.create({
      data: {
        name: spaceName,
        userId: checkUserExist.id,
      },
    });

    if (!createSpace) {
      return NextResponse.json(
        {
          status: "Error",
          message: `Something went wrong while creating space`,
        },
        { status: 500 }
      );
    }

    if (Array.isArray(streams) && streams.length > 0) {
      const insertedStreamWithSpaceId = streams.map(
        (stream: CreateStreamType) => ({
          ...stream,
          spaceId: createSpace.id,
          userId: checkUserExist.id,
        })
      );

      const insertedStream = await prismaClient.stream.createMany({
        data: insertedStreamWithSpaceId,
      });

      if (!insertedStream) {
        return NextResponse.json(
          {
            status: "Error",
            message: `Something went wrong while inserting stream`,
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        status: "Success",
        message: `Space created successfully`,
        data: createSpace,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message: `Something went wrong while. Creating space ${error}`,
      },
      { status: 500 }
    );
  }
}
