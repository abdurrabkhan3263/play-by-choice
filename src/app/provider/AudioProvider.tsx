import MusicPlayer from "@/components/MusicPlayer";
import PlayAgain from "@/components/PlayAgain";
import { getCurrentStream } from "@/lib/action/stream.action";

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
  const currentStream = await getCurrentStream({ spaceId });

  // TODO : CHECK ALSO IF ANY STREAM IS NOT THERE

  return (
    <>
      {children}
      {!isAllStreamPlayed ? (
        <MusicPlayer
          currentStream={currentStream}
          token={token}
          spaceId={spaceId}
        />
      ) : (
        <PlayAgain spaceId={spaceId} />
      )}
    </>
  );
}

export default AudioProvider;
