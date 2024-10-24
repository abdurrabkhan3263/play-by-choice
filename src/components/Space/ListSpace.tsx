import React from "react";
import { getAllSpace } from "@/lib/action/space.action";
import SpaceCard from "./SpaceCard";
import { SpaceType } from "@/types";

async function ListSpace() {
  const res = await getAllSpace();

  if (!res || res.status >= 400) {
    return (
      <div className="flex items-center justify-center h-96">
        <h1 className="text-3xl text-gray-400">No Streams Found</h1>
      </div>
    );
  }

  const data = await res.json();

  console.log("List Space", data);

  return (
    <div className="custom_scroll space_container">
      {Array.isArray(data.data) &&
        data.data.map(
          ({ id, name, createdBy, Stream, createdAt }: SpaceType) => (
            <SpaceCard
              key={id}
              id={id}
              name={name}
              createdBy={createdBy}
              Stream={Stream}
              createdAt={createdAt}
            />
          )
        )}
    </div>
  );
}

export default ListSpace;
