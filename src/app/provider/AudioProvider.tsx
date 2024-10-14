"use client";

import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Image from "next/image";

function AudioProvider({ children }: { children: React.ReactNode }) {
  const [accessToken, setAccessToken] = useState<string>("");
  const [player, setPlayer] = useState<any>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [track, setTrack] = useState({
    name: "",
    artists: "",
    albumCover: "",
  });

  useEffect(() => {
    const token =
      "BQAn_nzyyS2Sra7oWM3uXNvEVuRXAFR9RBfzeye1mG-s4tNSj_0-UPLU0t3VTMhp035lZuVgwRj_x8L3aeQRDmytx6njOjJdAGbTb_c7ALYukNWHphABemrYDK34GVs9426l3Ye2Yp9efLz0ixlpUYqb5y56418wX--xl68ScusQpFaSPnsqPXCEgR52ms_WnArCYvvpMAqhpphsXnMJTea7uGwuLoVgzoKQpAj_";
    if (token) {
      setAccessToken(token);
      loadSpotifySDK(token);
    }
  }, []);

  const initializePlayer = (token: string) => {
    const spotifyPlayer = new window.Spotify.Player({
      name: "My Spotify Web Player",
      getOAuthToken: (cb) => cb(token),
    });

    spotifyPlayer.addListener("ready", ({ device_id }) => {
      console.log("Player is ready with device ID:", device_id);
      setDeviceId(device_id);
    });

    spotifyPlayer.addListener("player_state_changed", (state) => {
      if (state) {
        const currentTrack = state.track_window.current_track;
        setTrack({
          name: currentTrack.name,
          artists: currentTrack.artists.map((artist) => artist.name).join(", "),
          albumCover: currentTrack.album.images[0].url,
        });
        setIsPaused(state.paused);
      }
    });

    spotifyPlayer.connect();
    setPlayer(spotifyPlayer);
  };

  const playTrack = () => {
    if (!deviceId || !accessToken) return;

    fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: "PUT",
      body: JSON.stringify({
        uris: ["spotify:track:YOUR_TRACK_URI"], // Replace with actual track URI
      }),
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    }).then((res) => {
      if (res.status === 204) {
        console.log("Track is playing");
      } else {
        console.log("Error playing track", res);
      }
    });
  };

  const togglePlay = () => {
    if (player) {
      player.togglePlay();
    }
  };

  const loadSpotifySDK = (token: string) => {
    if (!window?.Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;

      script.onload = () => {
        window.onSpotifyWebPlaybackSDKReady = () => {
          initializePlayer(token);
        };
      };

      document.body.appendChild(script);
    } else {
      initializePlayer(token);
    }
  };

  return (
    <>
      {children}
      <div className="fixed bottom-0 px-5 flex justify-between items-center right-1/2 translate-x-1/2 translate-y-0 h-fit w-full bg-gray-800">
        <h1>Spotify Web Playback SDK</h1>
        <div>
          {track.albumCover && (
            <Image
              src={track.albumCover}
              alt="Album cover"
              width={50}
              height={50}
            />
          )}
          <h3>{track.name || "No track playing"}</h3>
          <p>{track.artists || "Unknown artists"}</p>
        </div>
        <button onClick={togglePlay}>{isPaused ? "Play" : "Pause"}</button>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <Button className="bg-[#1db954]" onClick={playTrack}>
                Play Track
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Play a track on Spotify</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </>
  );
}

export default AudioProvider;
