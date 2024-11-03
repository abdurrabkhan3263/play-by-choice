import { CreateStreamUrl } from "./zod";
import {
  messageForSongLimit,
  messageForUserLimit,
  SONG_LIMIT,
  USER_LIMIT_SONG_LIST,
} from "./constants";
import {
  getStreamType,
  getStreamTypeReturn,
  totalNumberOfStreams,
  userStreamCount,
} from "./utils";
import { getVideoInfo } from "./action/youtube";
import { StreamType } from "@prisma/client";
import { getAlbum, getPlaylist, getTrack } from "./action/spotify";
import { CreateStreamType, StreamTypeApi } from "@/types";
import { getCurrentUser } from "./action/stream.action";

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
