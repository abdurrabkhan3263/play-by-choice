import prismaClient from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  const { email } = params;

  if (!email) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Email is required",
      },
      { status: 404 }
    );
  }

  try {
    const res = await prismaClient.user.delete({
      where: {
        email,
      },
    });

    if (!res) {
      return NextResponse.json(
        {
          status: "Error",
          message: "Something went wrong while deleting user",
        },
        { status: 500 }
      );
    }
    return NextResponse.json(
      {
        status: "Success",
        message: "User is deleted successfully",
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
