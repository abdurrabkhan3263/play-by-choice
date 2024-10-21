import MusicPlayer from "@/components/MusicPlayer";
import PlayAgain from "@/components/PlayAgain";
import { getCurrentStream } from "@/lib/action/stream.action";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";
import { StreamType } from "@prisma/client";
import YoutubePlayer from "@/components/YoutubePlayer";

async function AudioProvider({
  children,
  token,
  spaceId,
  isAllStreamPlayed,
  type,
}: {
  children: React.ReactNode;
  token: string;
  spaceId: string;
  isAllStreamPlayed: boolean;
  type: StreamType;
}) {
  const currentSession = await getServerSession(authOptions);
  const currentStream = await getCurrentStream({ spaceId });

  return (
    <>
      {children}
      {!isAllStreamPlayed && currentStream ? (
        <>
          {type === "Spotify" && (
            <MusicPlayer
              currentStream={currentStream}
              token={token}
              spaceId={spaceId}
              role={
                currentStream?.space?.createdBy.id === currentSession?.user?.id
                  ? "OWNER"
                  : "MEMBER"
              }
            />
          )}
          {type === "Youtube" && <YoutubePlayer />}
        </>
      ) : (
        <PlayAgain spaceId={spaceId} playAgain={isAllStreamPlayed} />
      )}
    </>
  );
}

export default AudioProvider;
