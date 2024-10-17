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
      token="BQAOceh1lUvAg3gzG9P009LB2RXyWi8buvKyk43pX9D1N3-KMOIEwCEOIR0ydZIQIn_qWxl7yuKr2RrrnDaJQVMluA98GnIEXwyawS8p5r3JThodnFL3-NvyCchG6pwIFx7hNQZT5h-vgIhjuz89z0pNC3J4CV6ggfp3hJn3-8XXaumaXopGAk2fqRSB-EwOxLoOMhdhnvhrgc0rhmQs1MYasqsRctTi6O0yZGKZ"
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
