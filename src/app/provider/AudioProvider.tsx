"use client";

import MusicPlayer from "@/components/MusicPlayer";
import PlayAgain from "@/components/PlayAgain";
import { AudioProviderProps, CurrentStream } from "@/types";

async function AudioProvider({
  children,
  token,
  spaceId,
  isAllStreamPlayed,
  type,
  currentStream,
  role,
}: AudioProviderProps) {
  const currentStreamData = currentStream?.data as CurrentStream;

  return (
    <>
      <div
        className={`grid w-full px-4 lg:px-8 grid-rows-[1fr,auto,auto] md:grid-rows-[1fr,auto] text-white xl:px-16 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
        style={{ height: "calc(100vh - 6rem)" }}
      >
        {children}
        {currentStream.data && type === "spotify" && (
          <MusicPlayer
            currentStream={currentStreamData}
            token={token}
            spaceId={spaceId}
            role={role}
          />
        )}
        {!currentStreamData && currentStream.isStreamAvailable && (
          <PlayAgain
            playAgain={isAllStreamPlayed}
            spaceId={spaceId}
            role={role}
          />
        )}
      </div>
    </>
  );
}

export default AudioProvider;
