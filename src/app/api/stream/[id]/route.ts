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
        message: "Stream Id is invalid",
      },
      { status: 404 }
    );
  }

  try {
    const res = await prismaClient.stream.delete({
      where: {
        id,
      },
    });

    if (!res) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Something went wrong while deleting stream",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "Stream is deleted successfully",
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
