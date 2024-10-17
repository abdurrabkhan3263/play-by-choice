import AudioProvider from "@/app/provider/AudioProvider";
import InsideSpace from "@/components/Space/InsideSpace";
import { getSpaceById } from "@/lib/action/space.action";
import { StreamTypeApi } from "@/types";
import React from "react";

async function page({ params }: { params: { id: string } }) {
  const { id } = params;
  const listStream = await getSpaceById({ id });
  const isAllStreamPlayed = listStream.Stream?.every(
    (stream: StreamTypeApi) => stream.played
  );

  return (
    <AudioProvider
      token="BQD9oMlIAWTPjXnDJx4cS3aIpPkybTmcD1RqsAf_6n4xoJn9W3C96uMfy29CUpsNeX3Psz6kkgthdkzQEyAJEqNDtW74Fn8vX9A2yXlisalD1wZHDaM3WieoXShpwBTFR2EL0xGV2HhCNd-5xZZyMhiW6rxiCT4Q1nu-Miy5eNvYh_BoTczaQutScd9mmPxwCf4ylGdlrydO-xOukVrh0PbwtBXdv-l6zgSyhtAL"
      spaceId={params.id}
      isAllStreamPlayed={isAllStreamPlayed}
    >
      <div
        className="grid w-full px-6 lg:px-8 text-white xl:px-16 mt-6 gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        style={{ height: "calc(100vh - 128px)" }}
      >
        <InsideSpace streamList={listStream} spaceId={listStream.id} />
      </div>
    </AudioProvider>
  );
}

export default page;
