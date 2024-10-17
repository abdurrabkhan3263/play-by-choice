import prismaClient from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: { space_id: string } }
) {
  const { space_id } = params;
  try {
    const result = await prismaClient.$transaction(async (prisma) => {
      const currentStream = await prisma.currentStream.findFirst({
        where: { spaceId: space_id },
        include: {
          stream: {
            select: {
              id: true,
              title: true,
              smallImg: true,
              popularity: true,
              url: true,
            },
          },
        },
      });

      if (!currentStream) {
        const newStream = await prisma.stream.findFirst({
          where: {
            spaceId: space_id,
            played: false,
          },
          orderBy: { Upvote: { _count: "desc" } },
        });

        if (newStream) {
          const newCurrentStream = await prisma.currentStream.create({
            data: { streamId: newStream.id, spaceId: space_id },
            select: {
              stream: {
                select: {
                  id: true,
                  title: true,
                  smallImg: true,
                  popularity: true,
                  url: true,
                },
              },
            },
          });

          await prisma.stream.update({
            where: { id: newStream.id, spaceId: space_id },
            data: { active: true },
          });

          return {
            status: "Success",
            message: "Current stream found",
            data: newCurrentStream,
          };
        }

        return { status: "Success", message: "No more streams available" };
      }

      return {
        status: "Success",
        message: "Current stream found",
        data: currentStream,
      };
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message:
          error instanceof Error
            ? error
            : "Something went when getting the current stream",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { space_id: string } }
) {
  const { space_id } = params;
  const { streamId, currentStream_id } = await req.json();

  if (!space_id || !streamId) {
    return NextResponse.json(
      {
        status: "Error",
        message: "Stream id and Space id is required",
      },
      { status: 400 }
    );
  }

  try {
    // Use a transaction to ensure data consistency --> it is use to ensure that all the queries are executed successfully
    const result = await prismaClient.$transaction(async (prisma) => {
      await prisma.currentStream.deleteMany({
        where: {
          id: currentStream_id,
          spaceId: space_id,
        },
      });

      await prisma.stream.update({
        where: { id: streamId, spaceId: space_id },
        data: { played: true, active: false },
      });

      const nextStream = await prisma.stream.findFirst({
        where: { spaceId: space_id, played: false },
        orderBy: { Upvote: { _count: "desc" } },
      });

      if (!nextStream) {
        return { status: "Success", message: "No more streams available" };
      }

      const newCurrentStream = await prisma.currentStream.create({
        data: { streamId: nextStream.id, spaceId: space_id },
        include: {
          stream: {
            select: {
              id: true,
              title: true,
              smallImg: true,
              popularity: true,
              url: true,
            },
          },
        },
      });

      await prisma.stream.update({
        where: { id: nextStream.id, spaceId: space_id },
        data: { active: true },
      });

      return {
        status: "Success",
        message: "Current stream updated",
        data: newCurrentStream,
      };
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Error in stream management:", error);
    return NextResponse.json(
      {
        status: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { space_id: string } }
) {
  console.log("Params", params);
  const { space_id } = params;
  try {
    const result = await prismaClient.$transaction(async (prisma) => {
      await prisma.stream.updateMany({
        where: { spaceId: space_id },
        data: { played: false },
      });

      const findStream = await prisma.stream.findFirst({
        where: { spaceId: space_id, played: false },
        orderBy: { Upvote: { _count: "desc" } },
      });

      if (!findStream) {
        return { status: "Success", message: "No more streams available" };
      }
      const newCurrentStream = await prisma.currentStream.create({
        data: { streamId: findStream.id, spaceId: space_id },
        include: {
          stream: {
            select: {
              id: true,
              title: true,
              smallImg: true,
              popularity: true,
              url: true,
            },
          },
        },
      });

      await prisma.stream.update({
        where: { id: findStream.id, spaceId: space_id },
        data: { active: true },
      });

      return {
        status: "Success",
        message: "Current stream updated",
        data: newCurrentStream,
      };
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        status: "Error",
        message:
          error instanceof Error
            ? error
            : "Something went when getting the current stream",
      },
      { status: 500 }
    );
  }
}
