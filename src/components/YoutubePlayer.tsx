"use client";

import { addCurrentStream } from "@/lib/action/stream.action";
import { CurrentStream, FetchCurrentStream, StreamTypeApi } from "@/types";
import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { Music2Icon } from "lucide-react";

function YoutubePlayer({
  currentStream,
  role,
  stream,
}: {
  currentStream: CurrentStream;
  role: "OWNER" | "MEMBER";
  stream?: StreamTypeApi;
}) {
  const playerRef = useRef<YT.Player | null>(null);
  const videoId = useRef<string>(currentStream?.stream?.extractedId);
  const currentStreamRef = useRef<CurrentStream>(currentStream);

  useEffect(() => {
    // Load the YouTube IFrame API script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    if (firstScriptTag.parentNode) {
      firstScriptTag?.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      if (role !== "OWNER") return;
      initializePlayer();
    };

    // Function to initialize the player
    function initializePlayer() {
      playerRef.current = new window.YT.Player("player", {
        height: "100%",
        width: "100%",
        videoId: videoId.current,
        playerVars: {
          playsinline: 1,
          autoplay: 1,
          controls: 0,
        },
        events: {
          // onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    async function onPlayerStateChange(event: YT.OnStateChangeEvent) {
      if (event.data == window.YT.PlayerState.ENDED) {
        const newVideo: FetchCurrentStream = await addCurrentStream({
          currentStreamId: currentStreamRef.current?.id,
          streamId: currentStreamRef.current.stream?.id,
          spaceId: currentStreamRef.current?.spaceId,
        });
        if (newVideo?.data) {
          videoId.current = newVideo.data?.stream?.extractedId;
          if (playerRef.current) {
            playerRef.current.loadVideoById(videoId.current);
          }
          currentStreamRef.current = newVideo?.data;
        } else {
          stopVideo();
        }
      }
    }

    function stopVideo() {
      if (playerRef.current) {
        playerRef.current.stopVideo();
      }
    }
  }, []);
  return (
    <>
      <div className="aspect-video mt-4 rounded-md overflow-hidden">
        {role === "OWNER" ? (
          <div id="player"></div>
        ) : (
          stream && (
            <div className="h-full w-full relative">
              <Image
                src={stream?.bigImg || "./No_Image_Available.jpg"}
                layout="fill"
                objectFit="cover"
                alt={stream?.title}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                <Music2Icon size={48} className="animate-pulse" />
              </div>
            </div>
          )
        )}
      </div>
    </>
  );
}

export default YoutubePlayer;
