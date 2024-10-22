import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import AudioProvider from "@/app/provider/AudioProvider";
import InsideSpace from "@/components/Space/InsideSpace";
import { getSpaceById } from "@/lib/action/space.action";
import { getCurrentStream } from "@/lib/action/stream.action";
import { StreamTypeApi } from "@/types";
import { getServerSession } from "next-auth";
import React from "react";

async function page({
  params,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id } = params;
  const listStream = await getSpaceById({ id });
  const isAllStreamPlayed = listStream.Stream?.every(
    (stream: StreamTypeApi) => stream.played
  );
  const currentUser = await getServerSession(authOptions);

  if (!currentUser?.user.accessToken) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h1 className="text-2xl text-white">Please login to continue</h1>
      </div>
    );
  }
  const currentStream = await getCurrentStream({ spaceId: params.id });

  return (
    <AudioProvider
      token={currentUser?.user.accessToken as string}
      spaceId={params.id}
      isAllStreamPlayed={isAllStreamPlayed}
      type={listStream.type}
      currentStream={currentStream}
    >
      <div
        className="grid w-full px-4 lg:px-8 text-white xl:px-16 mt-6 gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        style={{ height: "calc(100vh - 128px)" }}
      >
        <InsideSpace
          streamList={listStream}
          spaceId={listStream.id}
          spaceType={listStream.type}
          currentStream={currentStream}
        />
      </div>
    </AudioProvider>
  );
}

export default page;
