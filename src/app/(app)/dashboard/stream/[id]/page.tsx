import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import AudioProvider from "@/app/provider/AudioProvider";
import InsideSpace from "@/components/Space/InsideSpace";
import { getSpaceById } from "@/lib/action/space.action";
import { StreamTypeApi } from "@/types";
import { getServerSession } from "next-auth";
import React from "react";

async function page({ params }: { params: { id: string } }) {
  const { id } = params;
  const listStream = await getSpaceById({ id });
  const isAllStreamPlayed = listStream.Stream?.every(
    (stream: StreamTypeApi) => stream.played
  );
  const currentUser = await getServerSession(authOptions);

  console.log(currentUser);

  return (
    <AudioProvider
      token="BQDrBtsS4qLy1OINM-mC5yPXinDrep9efKTMe6SC2qaBeejGxD7ZQ593sRUWbZCHTHtkRDX3DVB3WyI0Tb7ZEF1-e0qNfaXmb-ssF11zecWh85H7CnTTawB8dnmFrR5APQZAQUpLyBJvlcpnXXdKiP5EP9PTyLbyIC6v6poxnTTtFzzrRvm7xm9taWxEbihPK-cUAx3eWdskwt6MPb10CpV5AB9zTt_DW_qTlPFU"
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
