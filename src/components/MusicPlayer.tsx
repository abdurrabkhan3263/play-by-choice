"use client";

import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";
import { addCurrentStream } from "@/lib/action/stream.action";
import { Pause, Play } from "lucide-react";

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}

function MusicPlayer({
  currentStream,
  token,
  spaceId,
  role,
}: {
  currentStream: any;
  token: string;
  spaceId: string;
  role: "OWNER" | "MEMBER";
}) {
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [track, setTrack] = useState({
    id: "",
    title: "",
    coverImg: "",
    popularity: 0,
  });
  const [isActive, setActive] = useState(false);
  const [isError, setIsError] = useState(false);
  const currentStreamId = useRef(currentStream.id);
  const streamId = useRef(currentStream.stream.id);
  const deviceId = useRef("");
  const toggleBtn = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://sdk.scdn.co/spotify-player.js";
    script.async = true;

    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const player = new window.Spotify.Player({
        name: "Web Playback SDK",
        getOAuthToken: (cb: (token: string) => void) => {
          cb(token);
        },
        volume: 1,
      });

      if (!player) {
        console.log("Player is not ready");
        return;
      }

      player.addListener(
        "ready",
        async ({ device_id }: { device_id: string }) => {
          if (currentStream && currentStream.stream) {
            setTrack({
              id: currentStream.stream.id,
              title: currentStream.stream.title,
              coverImg: currentStream.stream.smallImg,
              popularity: currentStream.stream.popularity,
            });
          }
          setActive(true);
          deviceId.current = device_id;
        }
      );

      player.addListener(
        "not_ready",
        ({ device_id }: { device_id: string }) => {
          console.log("Device ID has gone offline", device_id);
          deviceId.current = "";
        }
      );

      player.addListener("player_state_changed", (state: any) => {
        if (!state) {
          return;
        }
        setIsPaused(state.paused);
        if (
          state.track_window.previous_tracks.find(
            (x) => x.id === state.track_window.current_track.id
          )
        ) {
          handleNextTrack();
        }
      });

      if (toggleBtn.current) {
        let isPlaying = false;

        toggleBtn.current.addEventListener("click", () => {
          if (!isPlaying) {
            playTrack(currentStream.stream.url)
              .then(() => {
                isPlaying = true;
              })
              .catch(() => {
                setIsError(true);
              });
          } else {
            player.togglePlay();
          }
        });
      }

      const handleNextTrack = async () => {
        const { data } = await addCurrentStream({
          spaceId,
          streamId: streamId.current as string,
          currentStreamId: currentStreamId.current,
        });

        if (data && data.stream) {
          fetch(`
https://api.spotify.com/v1/me/player/queue?uri=${data.stream.url}&device_id=${deviceId.current}`)
            .then((data) => {
              console.log("Track is queued:- ", data);
            })
            .catch((error) => {
              console.error("Error queuing track", error);
            });

          setTrack({
            id: data.stream.id,
            title: data.stream.title,
            coverImg: data.stream.smallImg,
            popularity: data.stream.popularity,
          });
          streamId.current = data.stream.id;
          currentStreamId.current = data.id;
          await playTrack(data.stream.url);
        } else {
          console.log("No more tracks to play");
        }
      };

      const playTrack = async (track: string) => {
        try {
          fetch(
            `https://api.spotify.com/v1/me/player/play?device_id=${deviceId.current}`,
            {
              method: "PUT",
              body: JSON.stringify({
                uris: [track],
              }),
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          ).then((res) => {
            if (res.status === 204) {
              console.log("Track is playing");
            } else {
              console.log("Error playing track", res);
            }
          });
        } catch (error) {
          console.log("Error changing track", error);
        }
      };

      player.connect();
    };
  }, [token]);

  return (
    <div className="fixed bottom-0 xl:px-16 py-4 flex justify-between items-center right-1/2 translate-x-1/2 translate-y-0 h-fit w-full bg-gray-800">
      <div className="flex gap-4 items-center">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger className="relative group rounded-md aspect-square w-[70px] h-[70px] overflow-hidden">
              <Image
                src={track.coverImg || "/blur.jpg"}
                layout="fill"
                alt={track.title}
                className="group-hover:scale-110 transition-transform duration-200"
                loading="lazy"
                placeholder="blur"
                blurDataURL={
                  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkAAIAAAoAAv/lPAAAAA=="
                }
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>{track.title}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <div>
          <div className="flex items-center gap-4">
            <p className="text-xl font-semibold">{track.title}</p>
            <p className="text-sm">{track.popularity}</p>
          </div>
          <p className="text-sm font-thin">{track.title}</p>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center justify-between">
        <Button disabled={!isActive || role !== "OWNER"} ref={toggleBtn}>
          {!isPaused ? (
            <Pause size={24} className="text-white" />
          ) : (
            <Play size={24} className="text-white" />
          )}
        </Button>
      </div>
    </div>
  );
}

export default MusicPlayer;
