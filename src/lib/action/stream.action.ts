"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { CreateStreamType, StreamTypeApi } from "@/types";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";
import { CreateStreamUrl } from "../zod";
import {
  messageForSongLimit,
  messageForUserLimit,
  SONG_LIMIT,
  USER_LIMIT_SONG_LIST,
} from "../constants";
import {
  getStreamType,
  getStreamTypeReturn,
  totalNumberOfStreams,
  userStreamCount,
} from "../utils";
import { getVideoInfo } from "./youtube";
import { StreamType } from "@prisma/client";
import { getAlbum, getPlaylist, getTrack } from "./spotify";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get current user"
    );
  }
}

export async function updateStream({
  spaceId,
  stream,
}: {
  spaceId: string;
  stream: CreateStreamType;
}) {
  try {
    const newStream = await fetch(`${baseUrl}/api/space/more/${spaceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream: stream,
      }),
    });
    const res = await newStream.json();

    if (!newStream.ok) {
      throw new Error(res?.message ?? "Failed to update stream");
    }
    revalidatePath(`/dashboard/space/${spaceId}`);
    return res;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update stream"
    );
  }
}

export async function deleteStream({
  streamId,
  spaceId,
}: {
  streamId: string;
  spaceId: string;
}) {
  if (!streamId) {
    throw new Error("No stream id provided");
  }

  try {
    const res = await fetch(`${baseUrl}/api/stream/${streamId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete stream");
    }
    revalidatePath(`/dashboard/space/${spaceId}`);
    return await res.json();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : String(error) ?? "Failed to delete stream"
    );
  }
}

export async function toggleUpVote({
  streamId,
  isUpVoted,
}: {
  streamId: string;
  isUpVoted: boolean;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/sign-in");
  }
  try {
    const res = await fetch(`${baseUrl}/api/upvote/${streamId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: currentUser, isUpVoted }),
    });
    if (!res.ok) {
      throw new Error("Failed to upvote stream");
    }
    return await res.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to upvote stream"
    );
  }
}

export async function getCurrentStream({ spaceId }: { spaceId: string }) {
  try {
    const res = await fetch(`${baseUrl}/api/current-stream/${spaceId}`, {
      method: "GET",
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData?.message ?? "Failed to get current stream");
    }
    return resData;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went when getting the current stream"
    );
  }
}

export async function addCurrentStream({
  spaceId,
  streamId,
  currentStreamId,
}: {
  spaceId: string;
  streamId: string;
  currentStreamId: string;
}) {
  try {
    const res = await fetch(`${baseUrl}/api/current-stream/${spaceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ streamId, currentStreamId }),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData?.message ?? "Failed to add current stream");
    }
    revalidatePath(`/dashboard/space/${spaceId}`);
    return resData;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to add current stream"
    );
  }
}

export async function playAgainStream({
  spaceId,
  allPlayed,
}: {
  spaceId: string;
  allPlayed: boolean;
}) {
  try {
    const res = await fetch(`${baseUrl}/api/current-stream/${spaceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allPlayed }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to play again stream: ${res.status} ${res.statusText}`
      );
    }

    revalidatePath(`/dashboard/space/${spaceId}`);
    return await res.json();
  } catch (error) {
    // Instead of throwing an error, return an error response
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}

export async function CreateStream({
  spaceId,
  streamUrl,
  stream,
}: {
  streamUrl: string;
  stream: StreamTypeApi[] | CreateStreamType[];
  spaceId?: string;
}) {
  // Check if the user is signed in
  const data = await getCurrentUser();
  if (!data) {
    throw new Error("You need to sign in to add stream");
  }

  // Check the URL
  const typeChecking = CreateStreamUrl.safeParse(streamUrl);
  if (!typeChecking.success) {
    throw new Error(typeChecking.error.errors[0].message ?? "Invalid URL");
  }

  // Calculate the number of songs
  const totalSongs = totalNumberOfStreams(stream);

  if (totalSongs >= SONG_LIMIT) {
    throw new Error(messageForUserLimit);
  }

  // Get the stream type and the ID
  const type: getStreamTypeReturn = getStreamType(streamUrl);
  let streamData: CreateStreamType = {} as CreateStreamType;

  const checkAlreadyExist = stream.some((s) => s.extractedId === type.id);

  if (checkAlreadyExist) {
    throw new Error("This stream is already added");
  }

  // Check the number of users
  const userCounts = userStreamCount(stream, data?.id);

  if (userCounts >= USER_LIMIT_SONG_LIST) {
    throw new Error(messageForUserLimit);
  }

  // Get the stream data based on the type
  // --> Youtube
  if (type.platform === "youtube") {
    if (data?.provider !== "google") {
      throw new Error("You need to connect with Google to add Youtube stream");
    }

    if (!type.id) {
      throw new Error("Invalid Youtube URL");
    }

    if (totalSongs + 1 > SONG_LIMIT) {
      throw new Error(messageForSongLimit);
    }

    try {
      const youtubeData = await getVideoInfo(
        type.id,
        data?.accessToken as string
      );
      if (!youtubeData || youtubeData?.error) {
        throw new Error(
          youtubeData?.error.errors[0].message ?? "Failed to add stream"
        );
      }
      const dataSnippet = youtubeData?.items[0]?.snippet;
      streamData = {
        itemType: "track",
        title: dataSnippet?.title,
        type: type.platform as StreamType,
        extractedId: type.id,
        smallImg: dataSnippet?.thumbnails?.medium.url,
        bigImg: dataSnippet?.thumbnails?.high.url,
        createdAt: new Date(),
        url: streamUrl,
        userId: data?.id,
        spaceId,
      };
    } catch (error) {
      throw new Error(`Failed to add Youtube stream: ${error}`);
    }
  } else if (type.platform === "spotify") {
    // --> Spotify
    if (data?.provider !== "spotify") {
      throw new Error("You need to connect with Spotify to add Spotify stream");
    }

    if (!type.id) {
      throw new Error("Invalid Spotify URL");
    }

    try {
      if (type.type === "track") {
        const spotifyData = await getTrack(type.id);

        if (!spotifyData) {
          throw new Error("Failed to add stream");
        }

        if (totalSongs + 1 > SONG_LIMIT) {
          throw new Error(messageForSongLimit);
        }

        streamData = {
          itemType: "track",
          title: spotifyData?.name,
          type: type.platform as StreamType,
          extractedId: type.id,
          smallImg: spotifyData?.album?.images[2]?.url,
          bigImg: spotifyData?.album?.images[0]?.url,
          createdAt: new Date(),
          url: streamUrl,
          popularity: spotifyData?.popularity,
          userId: data?.id,
          artists: spotifyData?.artists.map((artist) => artist.name).join(", "),
          spaceId,
        };
      } else if (type.type === "album" || type.type === "playlist") {
        let albumData;

        if (type.type === "album") {
          albumData = await getAlbum(type.id);
        } else if (type.type === "playlist") {
          albumData = await getPlaylist(type.id);
        }

        if (!albumData?.tracks?.items) {
          throw new Error("Failed to add stream");
        }

        if (!albumData) {
          throw new Error("Failed to add stream");
        }
        const listSongs = (await Promise.all(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          albumData?.tracks?.items.map(async (item: any) => {
            const ID = type.type === "album" ? item?.id : item.track.id;
            const trackData = await getTrack(ID);
            return {
              title: trackData?.name,
              type: "spotify" as StreamType,
              extractedId: ID,
              smallImg: trackData?.album?.images[2]?.url,
              bigImg: trackData?.album?.images[0]?.url,
              createdAt: new Date(),
              url: streamUrl,
              popularity: trackData?.popularity,
              userId: data?.id,
              artists: trackData?.artists
                .map((artist) => artist.name)
                .join(", "),
              spaceId,
            } as CreateStreamType;
          })
        )) as CreateStreamType[];

        streamData = {
          itemType: "album",
          title: albumData?.name,
          type: type.type as StreamType,
          extractedId: type.id,
          smallImg: albumData?.images[2]?.url ?? albumData?.images[1]?.url,
          bigImg: albumData?.images[1]?.url ?? albumData?.images[0]?.url,
          createdAt: new Date(),
          url: streamUrl,
          popularity: (albumData as { popularity?: number })?.popularity,
          userId: data?.id,
          listSongs: listSongs as CreateStreamType[],
        };
      } else {
        throw new Error("Invalid Spotify URL");
      }
    } catch (error) {
      throw new Error(`Failed to add Spotify stream: ${error}`);
    }
  } else {
    throw new Error("Invalid URL");
  }

  return streamData;
}
