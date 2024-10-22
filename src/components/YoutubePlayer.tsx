"use client";

import { addCurrentStream } from "@/lib/action/stream.action";
import { CurrentStream, FetchCurrentStream } from "@/types";
import React, { useEffect, useRef } from "react";

function YoutubePlayer({ currentStream }: { currentStream: CurrentStream }) {
  const playerRef = useRef<YT.Player | null>(null);
  const videoId = useRef<string>(currentStream?.stream?.extractedId);
  const currentStreamRef = useRef<CurrentStream>(currentStream);

  useEffect(() => {
    // Load the YouTube IFrame API script
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName("script")[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = () => {
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
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
        },
      });
    }

    // Player event handlers
    function onPlayerReady(event: any) {
      // Function To get the currentStream
    }

    let done = false;
    async function onPlayerStateChange(event: any) {
      if (event.data == window.YT.PlayerState.ENDED && !done) {
        // Load a new video
        const newVideo: FetchCurrentStream = await addCurrentStream({
          currentStreamId: currentStreamRef.current?.id,
          streamId: currentStreamRef.current.stream?.id,
          spaceId: currentStreamRef.current?.spaceId,
        });
        console.log("New Video ", newVideo);
        if (newVideo?.data) {
          videoId.current = newVideo.data?.stream?.extractedId;
          playerRef.current.loadVideoById(videoId.current);
          currentStreamRef.current = newVideo?.data;
        } else {
          stopVideo();
        }
        done = true;
      }
    }

    function stopVideo() {
      playerRef.current.stopVideo();
    }

    // Cleanup function
    return () => {
      delete window.onYouTubeIframeAPIReady;
    };
  }, []);
  return (
    <>
      <div className="aspect-video mt-4 bg-gradient-to-br to-gray-800 from-gray-900 rounded-md overflow-hidden">
        <div id="player"></div>
      </div>
    </>
  );
}

export default YoutubePlayer;
