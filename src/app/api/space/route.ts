import { NextRequest, NextResponse } from "next/server";
import { CreateStreamType } from "@/types";
import prismaClient from "@/lib/db";

export async function POST(req: NextRequest) {
  const { spaceName, streams, email, type } = await req.json();

  const checkUserExits = await prismaClient.user.findUnique({
    where: {
      email,
    },
  });

  if (!checkUserExits) {
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
        userId: checkUserExits.id,
        type,
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
      const insertedStreamWithSpaceId = streams.flatMap((item) => {
        if (item?.itemType === "album" || item?.itemType === "playlist") {
          return (item.listSongs ?? []).map((song: CreateStreamType) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { itemType, ...rest } = song;
            return {
              ...rest,
              spaceId: createSpace.id,
              userId: checkUserExits.id,
            };
          });
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { itemType, ...rest } = item;
        return [
          {
            ...rest,
            spaceId: createSpace.id,
            userId: checkUserExits.id,
          },
        ];
      });

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
