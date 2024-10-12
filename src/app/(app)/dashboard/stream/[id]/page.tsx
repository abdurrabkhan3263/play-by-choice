import InsideSpace from "@/components/Space/InsideSpace";
import { getSpaceById } from "@/lib/action/space.action";
import React from "react";

async function page({ params }: { params: { id: string } }) {
  const { id } = params;
  const listStream = await getSpaceById({ id });

  return (
    <div
      className="grid w-full px-6 lg:px-8 text-white xl:px-16 mt-6 gap-4 grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      style={{ height: "calc(100vh - 128px)" }}
    >
      <InsideSpace streamList={listStream} spaceId={listStream.id} />
    </div>
  );
}

export default page;
