"use client";

import { useToast } from "@/hooks/use-toast";
import { fetchSpotifyWebApi, getStreamType } from "@/lib/utils";
import { CreateStreamType } from "@/types";
import React from "react";
import { Button } from "./ui/button";
import { CreateStreamUrl } from "@/lib/zod";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { StreamType } from "@prisma/client";

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

    const url = new URL(streamUrl);
    const type = getStreamType(streamUrl);

    if (type === "Youtube") {
    } else if (type === "Spotify") {
      const trackId = url.pathname.split("/")[2];

      if (!trackId) {
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
        const spotifyData = await fetchSpotifyWebApi({
          endpoint: `v1/tracks/${trackId}`,
          method: "GET",
        });

        if (spotifyData.error) {
          toast({
            title: "Error",
            description: spotifyData.error.message,
            variant: "destructive",
          });
          return;
        }

        const isUserAlreadyAddedStream = stream.some(
          (s) => s.userId === data?.user?.id
        );

        if (isUserAlreadyAddedStream) {
          toast({
            title: "Warning",
            description: "You can only add one stream",
            variant: "destructive",
          });
          return;
        }

        setStream((prev) => [
          ...prev,
          {
            title: spotifyData?.name,
            type: type as StreamType,
            extractedId: trackId,
            smallImg: spotifyData?.album?.images[2]?.url,
            bigImg: spotifyData?.album?.images[0]?.url,
            createdAt: new Date(),
            url: streamUrl,
            popularity: spotifyData?.popularity,
            userId: data?.user?.id,
          },
        ]);
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
      disabled={loading || status === "authenticated" ? false : true}
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
