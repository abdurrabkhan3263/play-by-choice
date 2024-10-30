import prismaClient from "@/lib/db";
import { sortStream } from "@/lib/utils";
import { CreateStreamType, CurrentStream, StreamTypeApi } from "@/types";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Space Id is invalid",
      },
      { status: 404 }
    );
  }

  try {
    const res = await prismaClient.space.delete({
      where: {
        id,
      },
    });

    if (!res) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Something went wrong while deleting space",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "Space is deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message: `Something went wrong ${error}`,
      },
      { status: 401 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { stream = {} } = await req.json();

  if (!stream) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Data is invalid",
      },
      { status: 401 }
    );
  }

  const { id } = params;

  if (!id) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Space Id is invalid",
      },
      { status: 404 }
    );
  }

  const spaceExits = await prismaClient.space.findFirst({
    where: {
      id,
    },
  });

  if (!spaceExits) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Space is not found",
      },
      { status: 404 }
    );
  }

  try {
    const streamData = stream.flatMap((item: CreateStreamType) => {
      if (item?.itemType === "album" || item?.itemType === "playlist") {
        return (item.listSongs ?? []).map((song: CreateStreamType) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { itemType, ...rest } = song;
          return {
            ...rest,
            spaceId: params.id,
          };
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { itemType, ...rest } = item;
      return [
        {
          ...rest,
          spaceId: params.id,
        },
      ];
    });
    const addStream = await prismaClient.stream.createManyAndReturn({
      data: streamData,
      skipDuplicates: true,
    });

    if (addStream.length === 0) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Something went wrong while adding stream",
        },
        { status: 500 }
      );
    }

    const getAddedStream = await prismaClient.stream.findMany({
      where: {
        id: {
          in: addStream.map((item: { id: string }) => item.id),
        },
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        Upvote: true,
      },
    });

    if (!getAddedStream) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Something went wrong while fetching added stream",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Stream is added successfully",
        data: getAddedStream,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message: `Something went wrong ${error}`,
      },
      { status: 404 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { spaceName = "" } = await req.json();
  const { id } = params;

  if (!id || !spaceName) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Space Id or Space Name is invalid",
      },
      { status: 404 }
    );
  }

  try {
    const updatedSpace = await prismaClient.space.update({
      where: {
        id,
      },
      data: {
        name: spaceName,
      },
    });

    if (!updatedSpace) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Something went wrong while updating space",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Space is updated successfully",
        data: updatedSpace,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message: `Something went wrong ${error}`,
      },
      { status: 404 }
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Extracting the space id from the params
  const { id } = params;

  if (!id) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Space Id is invalid",
      },
      { status: 404 }
    );
  }

  try {
    // Fetching the space details from the database
    const space = await prismaClient.space.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        Stream: {
          include: {
            user: {
              select: {
                name: true,
                email: true,
                image: true,
              },
            },
            Upvote: true,
          },
          orderBy: {
            active: "desc",
          },
        },
      },
    });

    // If space is not found, return an error response
    if (!space) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Space not found",
        },
        { status: 404 }
      );
    }

    let sortedStream = [];

    if (space?.Stream) {
      sortedStream = sortStream(space.Stream);
    }

    // Returning the space details
    return NextResponse.json(
      {
        status: "Success",
        data: {
          ...space,
          Stream: sortedStream,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message: `Something went wrong ${error}`,
      },
      { status: 500 }
    );
  }
}
