import MusicPlayer from "@/components/MusicPlayer";
import PlayAgain from "@/components/PlayAgain";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { AudioProviderProps, CurrentStream } from "@/types";

async function AudioProvider({
  children,
  token,
  spaceId,
  isAllStreamPlayed,
  type,
  currentStream,
}: AudioProviderProps) {
  const currentSession = await getServerSession(authOptions);
  const currentStreamData = currentStream?.data as CurrentStream;

  return (
    <>
      {children}
      {currentStream.data && type === "Spotify" && (
        <MusicPlayer
          currentStream={currentStreamData}
          token={token}
          spaceId={spaceId}
          role={
            currentStreamData?.space?.createdBy.id === currentSession?.user?.id
              ? "OWNER"
              : "MEMBER"
          }
        />
      )}
      {!currentStreamData && currentStream.isStreamAvailable && (
        <PlayAgain playAgain={isAllStreamPlayed} spaceId={spaceId} />
      )}
    </>
  );
}

export default AudioProvider;
