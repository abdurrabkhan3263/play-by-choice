import prismaClient from "@/lib/db";
import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(
  req: NextRequest,
  { params }: { params: { email: string } }
) {
  const currentUser = params.email;

  if (!currentUser) {
    redirect("/sign-in");
  }

  if (!currentUser) {
    return NextResponse.json(
      {
        status: "Unauthorized",
        message: "User is not authorized",
      },
      { status: 401 }
    );
  }

  const user = await prismaClient.user.findUnique({
    where: {
      email: currentUser as string,
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        status: "Not Found",
        message: "User not found",
      },
      { status: 404 }
    );
  }

  const allStreams = await prismaClient.stream.findMany({
    where: {
      userId: user.id,
    },
  });

  const filterIds = allStreams.map((s) => s.spaceId);

  const allSpaces = await prismaClient.space.findMany({
    where: {
      OR: [
        {
          userId: user.id,
        },
        {
          id: {
            in: filterIds,
          },
        },
      ],
    },
    select: {
      id: true,
      name: true,
      createdAt: true,
      createdBy: {
        select: {
          name: true,
          image: true,
          email: true,
        },
      },
      Stream: {
        take: 1,
        select: {
          id: true,
          bigImg: true,
          type: true,
        },
      },
    },
  });

  if (allSpaces.length === 0) {
    return NextResponse.json(
      {
        status: "Not Found",
        message: "No Space found",
      },
      { status: 404 }
    );
  }

  return NextResponse.json(
    {
      status: "Success",
      message: "All spaces found successfully",
      data: allSpaces,
    },
    { status: 200 }
  );
}
