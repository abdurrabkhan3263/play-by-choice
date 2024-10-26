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
      <div
        className={`grid w-full px-4 lg:px-8 grid-rows-[1fr,auto,auto] md:grid-rows-[1fr,auto] text-white xl:px-16 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5`}
        style={{ height: "calc(100vh - 6rem)" }}
      >
        {children}
        {currentStream.data && type === "Spotify" && (
          <MusicPlayer
            currentStream={currentStreamData}
            token={token}
            spaceId={spaceId}
            role={
              currentStreamData?.space?.createdBy.id ===
              currentSession?.user?.id
                ? "OWNER"
                : "MEMBER"
            }
          />
        )}
        {!currentStreamData && currentStream.isStreamAvailable && (
          <PlayAgain playAgain={isAllStreamPlayed} spaceId={spaceId} />
        )}
      </div>
    </>
  );
}

export default AudioProvider;
