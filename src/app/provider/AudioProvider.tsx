import MusicPlayer from "@/components/MusicPlayer";
import PlayAgain from "@/components/PlayAgain";
import { getCurrentStream } from "@/lib/action/stream.action";
import { authOptions } from "../api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

async function AudioProvider({
  children,
  token,
  spaceId,
  isAllStreamPlayed,
}: {
  children: React.ReactNode;
  token: string;
  spaceId: string;
  isAllStreamPlayed: boolean;
}) {
  const currentSession = await getServerSession(authOptions);
  const currentStream = await getCurrentStream({ spaceId });

  console.log("Current Stream is:- ", currentStream);

  // TODO : CHECK ALSO IF ANY STREAM IS NOT THERE

  return (
    <>
      {children}
      {!isAllStreamPlayed ? (
        <MusicPlayer
          currentStream={currentStream}
          token={token}
          spaceId={spaceId}
          role={
            currentStream.space.createdBy.id === currentSession?.user?.id
              ? "OWNER"
              : "MEMBER"
          }
        />
      ) : (
        <PlayAgain spaceId={spaceId} />
      )}
    </>
  );
}

export default AudioProvider;
