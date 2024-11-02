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
import { Loader2, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { CurrentStream } from "@/types";
import { checkPremiumStatus } from "@/lib/action/spotify";

function MusicPlayer({
  currentStream,
  token,
  spaceId,
  role,
}: {
  currentStream: CurrentStream;
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
    artists: "",
  });
  const [isActive, setActive] = useState(false);
  const [isError, setIsError] = useState(false);
  const currentStreamId = useRef(currentStream.id);
  const streamId = useRef(currentStream.stream.id);
  const deviceId = useRef("");
  const toggleBtn = useRef<HTMLButtonElement | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      const isPremium = await checkPremiumStatus({ token });

      if (!isPremium) {
        toast({
          title: "Error",
          description: "You need to have a premium account to play music",
          variant: "destructive",
        });
        return;
      }

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
          setIsError(true);
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
                artists: currentStream.stream.artists,
              });
            }
            setActive(true);
            deviceId.current = device_id;
          }
        );

        player.on("authentication_error", ({ message }) => {
          toast({
            title: "Authentication Error",
            description: message,
            variant: "destructive",
          });
        });

        player.addListener("not_ready", () => {
          deviceId.current = "";
        });

        let done = false;
        player.addListener(
          "player_state_changed",
          async (state: Spotify.PlaybackState) => {
            if (!state) {
              return;
            }

            setIsPaused(state.paused);
            const trackInPrevious = state.track_window.previous_tracks.find(
              (x) => x.id === state.track_window.current_track.id
            );
            if (trackInPrevious && state.paused && !state.loading && !done) {
              await handleNextTrack();
              done = true;
            }
          }
        );

        if (toggleBtn.current) {
          let isPlaying = false;

          toggleBtn.current.addEventListener("click", () => {
            if (role !== "OWNER") return;
            if (!isPlaying) {
              playTrack(currentStream.stream.extractedId)
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
            setTrack({
              id: data.stream.id,
              title: data.stream.title,
              coverImg: data.stream.smallImg,
              popularity: data.stream.popularity,
              artists: data.stream.artists,
            });

            streamId.current = data.stream.id;
            currentStreamId.current = data.id;
            await playTrack(data.stream.extractedId);
          }
        };

        const playTrack = async (trackId: string) => {
          try {
            const playResponse = await fetch(
              `https://api.spotify.com/v1/me/player/play?device_id=${deviceId.current}`,
              {
                method: "PUT",
                body: JSON.stringify({
                  uris: [`spotify:track:${trackId}`],
                }),
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );
            if (!playResponse.ok) {
              const resData = await playResponse.json();
              console.error(resData);
              toast({
                title: "Error",
                description: resData?.error.message ?? "Failed to play track",
                variant: "destructive",
              });
            }
          } catch (error) {
            toast({
              title: "Error",
              description:
                error instanceof Error ? error.message : "Failed to play track",
              variant: "destructive",
            });
          }
        };

        player.connect();
      };
    })();
  }, [currentStream, spaceId, toast, token]);

  if (isError) {
    return (
      <div className="xl:px-16 py-4 flex justify-between items-center right-1/2 translate-x-1/2 translate-y-0 h-fit w-full bg-gray-800">
        <p className="text-red-500 mx-auto">Error in playing music</p>
      </div>
    );
  }

  return (
    <div className="music_player px-4 sm:flex-row md:px-8">
      {!isActive ? (
        <p className="text-white">
          <Loader2 size={24} className="animate-spin text-gray-400" />
        </p>
      ) : (
        <div className="flex gap-4 items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="relative group rounded-md aspect-square w-[50px] h-[50px] overflow-hidden">
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
              <p className="text-lg font-semibold text-balance">
                {track.title}
              </p>
            </div>
            <p className="text-sm font-thin">{track?.artists}</p>
          </div>
        </div>
      )}
      {role === "OWNER" && (
        <div className="flex-1 flex flex-col items-center justify-between">
          <Button disabled={!isActive || role !== "OWNER"} ref={toggleBtn}>
            {!isPaused ? (
              <Pause size={24} className="text-white" />
            ) : !isActive ? (
              <Loader2 size={24} className="animate-spin text-gray-400" />
            ) : (
              <Play size={24} className="text-white" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default MusicPlayer;
