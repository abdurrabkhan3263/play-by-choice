"use client";

import { useToast } from "@/hooks/use-toast";
import { getStreamType } from "@/lib/utils";
import { CreateStreamType } from "@/types";
import React from "react";
import { Button } from "./ui/button";
import { CreateStreamUrl } from "@/lib/zod";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { StreamType as PrismaStreamType, StreamType } from "@prisma/client";
import { getAlbum, getPlaylist, getTrack } from "@/lib/action/spotify";
import { getVideoInfo } from "@/lib/action/youtube";
const SONG_LIMIT = 100;

function AddStreamBtn({
  streamUrl,
  setStreamUrl,
  setStream,
  stream,
}: {
  streamUrl: string;
  setStreamUrl: React.Dispatch<React.SetStateAction<string>>;
  setStream: React.Dispatch<React.SetStateAction<CreateStreamType[]>>;
  stream: CreateStreamType[];
}) {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);
  const { data, status } = useSession();

  async function CreateStream() {
    const typeChecking = CreateStreamUrl.safeParse(streamUrl);

    // Check if the URL is valid using Zod
    if (!typeChecking.success) {
      toast({
        title: "Error",
        description: typeChecking.error.errors[0].message ?? "Invalid URL",
        variant: "destructive",
      });
      return;
    }

    const checkAlreadyExist = stream.some((s) => s.url === streamUrl);

    if (checkAlreadyExist) {
      toast({
        title: "Error",
        description: "Stream already exist",
        variant: "destructive",
      });
      setStreamUrl("");
      return;
    }

    // Calculate the number of songs
    const totalSongs = stream.reduce((acc, s) => {
      if (s.itemType !== "track" && s.listSongs) {
        return acc + s.listSongs.length;
      }
      return acc + 1;
    }, 0);

    if (totalSongs >= SONG_LIMIT) {
      toast({
        title: "Error",
        description: `You can only add ${SONG_LIMIT} songs in a space`,
        variant: "destructive",
      });
      return;
    }

    const url = new URL(streamUrl);
    const type = getStreamType(streamUrl);

    if (type === "Youtube") {
      if (data?.user?.provider !== "google") {
        toast({
          title: "Error",
          description: "You need to connect with Google to add Youtube stream",
          variant: "destructive",
        });
        return;
      }

      const ID = url.searchParams.get("v");

      if (!ID) {
        toast({
          title: "Error",
          description: "Invalid Youtube URL",
          variant: "destructive",
        });
        setStreamUrl("");
        return;
      }

      if (totalSongs + 1 > SONG_LIMIT) {
        toast({
          title: "Error",
          description: `You can only add ${SONG_LIMIT} songs in a space`,
          variant: "destructive",
        });
        return;
      }
      try {
        setLoading(true);
        const youtubeData = await getVideoInfo(
          ID,
          data?.user?.accessToken as string
        );
        if (!youtubeData) {
          toast({
            title: "Error",
            description: "Failed to add stream",
            variant: "destructive",
          });
          return;
        }

        const dataSnippet = youtubeData?.items[0]?.snippet;

        setStream((prev) => [
          ...prev,
          {
            itemType: "track",
            title: dataSnippet?.title,
            type: type,
            extractedId: ID,
            smallImg: dataSnippet?.thumbnails?.medium.url,
            bigImg: dataSnippet?.thumbnails?.high.url,
            createdAt: new Date(),
            url: streamUrl,
            userId: data?.user?.id,
          },
        ]);
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to add Youtube stream: ${error}`,
          variant: "destructive",
        });
        return;
      } finally {
        setStreamUrl("");
        setLoading(false);
      }
    } else if (type === "Spotify") {
      if (data?.user?.provider !== "spotify") {
        toast({
          title: "Error",
          description: "You need to connect with Spotify to add Spotify stream",
          variant: "destructive",
        });
      }
      const pathNameVar = url.pathname.split("/");
      const itemId = pathNameVar[2];
      const itemType = pathNameVar[1];

      if (!itemId) {
        toast({
          title: "Error",
          description: "Invalid Spotify URL",
          variant: "destructive",
        });
        setStreamUrl("");
        return;
      }

      try {
        setLoading(true);

        if (itemType === "track") {
          const spotifyData = await getTrack(itemId);

          if (!spotifyData) {
            toast({
              title: "Error",
              description: "Failed to add stream",
              variant: "destructive",
            });
            return;
          }

          if (totalSongs + 1 > SONG_LIMIT) {
            toast({
              title: "Error",
              description: `You can only add ${SONG_LIMIT} songs in a space`,
              variant: "destructive",
            });
            return;
          }

          setStream((prev) => [
            ...prev,
            {
              itemType: "track",
              title: spotifyData?.name,
              type: type as PrismaStreamType,
              extractedId: itemId,
              smallImg: spotifyData?.album?.images[2]?.url,
              bigImg: spotifyData?.album?.images[0]?.url,
              createdAt: new Date(),
              url: streamUrl,
              popularity: spotifyData?.popularity,
              userId: data?.user?.id,
              artist: spotifyData?.artists
                .map((artist) => artist.name)
                .join(", "),
            },
          ]);
        } else if (itemType === "album" || itemType === "playlist") {
          let albumData;
          if (itemType === "album") {
            albumData = await getAlbum(itemId);
          } else if (itemType === "playlist") {
            albumData = await getPlaylist(itemId);
          }

          if (totalSongs + albumData?.tracks?.items.length > SONG_LIMIT) {
            toast({
              title: "Error",
              description: `You can only add ${SONG_LIMIT} songs in a space`,
              variant: "destructive",
            });
            return;
          }

          if (!albumData) {
            toast({
              title: "Error",
              description: "Failed to add stream",
              variant: "destructive",
            });
            return;
          }

          const listSongs = (await Promise.all(
            albumData?.tracks?.items.map(async (item) => {
              const ID = itemType === "album" ? item?.id : item.track.id;
              const trackData = await getTrack(ID);
              return {
                itemType: "track",
                title: trackData?.name,
                type: "Spotify" as StreamType,
                extractedId: ID,
                smallImg: trackData?.album?.images[2]?.url,
                bigImg: trackData?.album?.images[0]?.url,
                createdAt: new Date(),
                url: streamUrl,
                popularity: trackData?.popularity,
                userId: data?.user?.id,
                artist: trackData?.artists
                  .map((artist) => artist.name)
                  .join(", "),
              } as CreateStreamType;
            })
          )) as CreateStreamType[];

          setStream((prev) => [
            ...prev,
            {
              itemType: "album",
              title: albumData?.name,
              type: type as PrismaStreamType,
              extractedId: itemId,
              smallImg: albumData?.images[2]?.url ?? albumData?.images[1]?.url,
              bigImg: albumData?.images[1]?.url ?? albumData?.images[0]?.url,
              createdAt: new Date(),
              url: streamUrl,
              popularity: (albumData as any)?.popularity,
              userId: data?.user?.id,
              listSongs: listSongs as CreateStreamType[],
            },
          ]);
        } else {
          toast({
            title: "Error",
            description: "Invalid Spotify URL",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: `Failed to add Spotify stream: ${error}`,
          variant: "destructive",
        });
        return;
      } finally {
        setStreamUrl("");
        setLoading(false);
      }
    } else {
      toast({
        title: "Error",
        description: "Invalid Stream URL",
        variant: "destructive",
      });
      return;
    }
  }

  return (
    <Button
      onClick={CreateStream}
      type="button"
      className="flex gap-2"
      disabled={loading || status === "loading"}
    >
      Add Stream
      {loading && (
        <Image
          src="/logo/loader.svg"
          height={20}
          width={20}
          alt="loading"
          className="animate-spin"
        />
      )}
    </Button>
  );
}

export default AddStreamBtn;
