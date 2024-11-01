import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import AudioProvider from "@/app/provider/AudioProvider";
import InsideSpace from "@/components/Space/InsideSpace";
import { getSpaceById } from "@/lib/action/space.action";
import { getCurrentStream } from "@/lib/action/stream.action";
import { StreamTypeApi } from "@/types";
import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import React from "react";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listStream = await getSpaceById({ id });
  return {
    title: `Space: ${listStream?.name || "Space not found"}`,
    description: `
    A detailed view of the space named ${
      listStream?.name || "Nothing"
    }, including all streams and their statuses. This page allows users to listen to the current stream and provides an overview of the space's content.
    `,
  };
}

async function page({
  params,
}: {
  params: { id: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { id } = params;
  const listStream = await getSpaceById({ id });

  if (listStream?.status && listStream?.status === "Error") {
    notFound();
  }

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
  let currentStream = [];
  try {
    currentStream = await getCurrentStream({ spaceId: params.id });
  } catch (error) {
    console.log("Error: ", error);
  }

  if (!currentUser?.user?.id) {
    throw new Error("User not found. Please login again or contact support");
  }

  const role =
    listStream.createdBy.id === currentUser?.user.id ? "OWNER" : "MEMBER";

  return (
    <AudioProvider
      token={currentUser?.user.accessToken as string}
      spaceId={params.id}
      isAllStreamPlayed={isAllStreamPlayed}
      type={listStream.type}
      currentStream={currentStream}
      role={role}
    >
      <InsideSpace
        streamList={listStream}
        spaceId={listStream.id}
        spaceType={listStream.type}
        currentStream={currentStream}
        role={role}
        currentUserId={currentUser?.user?.id}
      />
    </AudioProvider>
  );
}

export default page;
