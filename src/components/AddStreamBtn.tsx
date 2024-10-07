"use client";

import { useToast } from "@/hooks/use-toast";
import { fetchSpotifyWebApi, getStreamType } from "@/lib/utils";
import { CreateStreamType } from "@/types";
import React from "react";
import { Button } from "./ui/button";
import { CreateStreamUrl } from "@/lib/zod";

function AddStreamBtn({
  streamUrl,
  setStream,
  stream,
}: {
  streamUrl: string;
  setStream: React.Dispatch<React.SetStateAction<CreateStreamType[]>>;
  stream: CreateStreamType[];
}) {
  const { toast } = useToast();

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
        return;
      }

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

      setStream((prev) => [
        ...prev,
        {
          title: spotifyData?.name,
          type,
          extractedId: trackId,
          smallImg: spotifyData?.album?.images[2]?.url,
          bigImg: spotifyData?.album?.images[0]?.url,
          createdAt: new Date(),
          url: streamUrl,
          popularity: spotifyData?.popularity,
        },
      ]);
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
    <Button onClick={CreateStream} type="button">
      Add Stream
    </Button>
  );
}

export default AddStreamBtn;
