// eslint-disable-next-line @typescript-eslint/no-explicit-any
import prismaClient from "@/lib/db";
import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getRedisClient } from "@/lib/redis-client";

// Get Currently Playing Stream or active stream
export async function GET(
  req: NextRequest,
  { params }: { params: { space_id: string } }
) {
  const { space_id } = params;
  const client = await getRedisClient();
  const cachedData = await client.get(`currentStream:${space_id}`);
  if (cachedData !== null) {
    return NextResponse.json(
      {
        status: "Success",
        message: "Current stream found",
        data: JSON.parse(cachedData),
        isStreamAvailable: true,
      },
      { status: 200 }
    );
  }

  try {
    // Use a transaction to ensure data consistency --> it is use to ensure that all the queries are executed successfully
    const result = await prismaClient.$transaction(
      async (tx: Prisma.TransactionClient) => {
        const currentStream = await tx.currentStream.findFirst({
          where: { spaceId: space_id },
          include: {
            stream: {
              select: {
                id: true,
                title: true,
                smallImg: true,
                popularity: true,
                url: true,
                artists: true,
                extractedId: true,
              },
            },
            space: {
              select: {
                createdBy: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        });
        const findAllStream = await tx.stream.findMany({
          where: { spaceId: space_id },
        });

        if (!currentStream) {
          return {
            status: "Not Found",
            message: "No current stream found",
            statusCode: 404,
            isStreamAvailable: findAllStream.length > 0,
          };
        }

        await client.set(
          `currentStream:${space_id}`,
          JSON.stringify(currentStream),
          {
            EX: 5 * 60, // 15 minutes
            NX: true,
          }
        );

        return {
          status: "Success",
          message: "Current stream found",
          data: currentStream,
          isStreamAvailable: true,
        };
      }
    );
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

// Update the current stream to the next stream
export async function POST(
  req: NextRequest,
  { params }: { params: { space_id: string } }
) {
  const client = await getRedisClient();
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

    await client.del(`currentStream:${space_id}`);

    const result = await prismaClient.$transaction(
      async (tx: Prisma.TransactionClient) => {
        await tx.currentStream.deleteMany({
          where: {
            id: currentStream_id,
            spaceId: space_id,
          },
        });

        await tx.stream.update({
          where: { id: streamId, spaceId: space_id },
          data: { played: true, active: false },
        });

        const nextStream = await tx.stream.findFirst({
          where: { spaceId: space_id, played: false },
          orderBy: { Upvote: { _count: "desc" } },
        });

        if (!nextStream) {
          return {
            status: "Success",
            message: "No more streams available",
            statusCode: 404,
            isStreamAvailable: false,
          };
        }

        const newCurrentStream = await tx.currentStream.create({
          data: { streamId: nextStream.id, spaceId: space_id },
          include: {
            stream: {
              select: {
                id: true,
                title: true,
                smallImg: true,
                popularity: true,
                url: true,
                artists: true,
                extractedId: true,
              },
            },
            space: {
              select: {
                createdBy: true,
              },
            },
          },
        });

        await tx.stream.update({
          where: { id: nextStream.id, spaceId: space_id },
          data: { active: true },
        });

        await client.set(
          `currentStream:${space_id}`,
          JSON.stringify(newCurrentStream),
          {
            NX: true,
            EX: 5 * 60, // 15 minutes
          }
        );

        return {
          status: "Success",
          message: "Current stream updated",
          data: newCurrentStream,
          isStreamAvailable: true,
        };
      }
    );

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("Hello2 from error", error);
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

// Play again the stream
export async function PATCH(
  req: NextRequest,
  { params }: { params: { space_id: string } }
) {
  const client = await getRedisClient();
  const { space_id } = params;
  const { allPlayed } = await req.json();
  try {
    const result = await prismaClient.$transaction(
      async (tx: Prisma.TransactionClient) => {
        if (allPlayed) {
          await tx.stream.updateMany({
            where: { spaceId: space_id },
            data: { played: false },
          });
        }

        const findStream = await tx.stream.findFirst({
          where: { spaceId: space_id, played: false },
          orderBy: { Upvote: { _count: "desc" } },
        });

        if (!findStream) {
          return {
            status: "Success",
            message: "No more streams available",
            isStreamAvailable: false,
          };
        }
        const newCurrentStream = await tx.currentStream.create({
          data: { streamId: findStream.id, spaceId: space_id },
          include: {
            stream: {
              select: {
                id: true,
                title: true,
                smallImg: true,
                popularity: true,
                url: true,
                artists: true,
                extractedId: true,
              },
            },
            space: {
              select: {
                createdBy: true,
              },
            },
          },
        });

        await tx.stream.update({
          where: { id: findStream.id, spaceId: space_id },
          data: { active: true },
        });

        await client.set(
          `currentStream:${space_id}`,
          JSON.stringify(newCurrentStream),
          {
            NX: true,
            EX: 5 * 60, // 15 minutes
          }
        );

        return {
          status: "Success",
          message: "Current stream updated",
          data: newCurrentStream,
          isStreamAvailable: true,
        };
      }
    );
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log("Hello from error", error);
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
