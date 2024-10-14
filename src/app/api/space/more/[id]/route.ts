import prismaClient from "@/lib/db";
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

export async function GET(
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
    const spaceData = await prismaClient.space.findFirst({
      where: {
        id: id,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        Stream: {
          include: {
            Upvote: true,
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            Upvote: {
              _count: "desc",
            },
          },
        },
        CurrentStream: true,
      },
    });

    if (!spaceData) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Given space is not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Space is founded successfully",
        data: spaceData,
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
    const addStream = await prismaClient.stream.create({
      data: stream,
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

    if (!addStream) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Something went wrong while adding stream",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        status: "Success",
        message: "Stream is added successfully",
        data: addStream,
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
