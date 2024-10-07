import { prismaClient } from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "../auth/[...nextauth]/options";
import { redirect } from "next/navigation";
import { fetchSpotifyWebApi, getStreamType } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const { space_Id } = await req.params();

  if (!space_Id) {
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
        id: space_Id,
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

export async function POST(req: NextRequest) {
  const { spaceName, streamUrl } = await req.json();
  const user = await getServerSession(authOptions);

  if (!user || !user?.user?.email) {
    redirect("/sign-in");
  }

  try {
    const createSpace = await prismaClient.space.create({
      data: {
        name: spaceName && spaceName,
        userId: user?.user?.email,
      },
    });

    if (!createSpace) {
      return NextResponse.json({
        status: "Error",
        message: `Try Again`,
      });
    }

    if (Array.isArray(streamUrl) && streamUrl.length > 0) {
      const insertedIdStream = await Promise.all(
        streamUrl.map(async (url) => {
          const streamType = getStreamType(url);
          const url = new URL(url);
          const extractedData = {};

          if (streamType === "Youtube") {
          } else if (streamType === "Spotify") {
            const trackId = url.pathName().split("/")[2];
            // if (!trackId) {
            //   return NextResponse.json({
            //     status: "Error",
            //     message: `Invalid Spotify URL`,
            //   });
            // }
            const spotifyData = await fetchSpotifyWebApi({
              endpoint: `v1/tracks/${trackId}`,
              method: "GET",
            });
          }
          //  else {
          //   return NextResponse.json({
          //     status: "Error",
          //     message: `Invalid Stream URL`,
          //   });
          // }
        })
      );
    }
  } catch (error) {
    return NextResponse.json({
      status: "Error",
      message: `Something went wrong while. Creating space ${error}`,
    });
  }
}
