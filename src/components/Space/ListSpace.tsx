import React from "react";
import { getAllSpace } from "@/lib/action/space.action";
import SpaceCard from "./SpaceCard";
import { SpaceType } from "@/types";
import { Music, Plus, PlusCircle } from "lucide-react";
import { Button } from "../ui/button";
import CreateSpaceButton from "./CreateSpaceButton";

async function ListSpace() {
  const res = await getAllSpace();

  if (!res || res.status >= 400) {
    return (
      <div className="h-full flex justify-center mt-40">
        <div className="text-center">
          <div className="mb-8 flex justify-center">
            <Music className="h-32 w-32 text-[#E1FF4B] animate-pulse" />
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-wider text-[#E1FF4B]">
            SPACE NOT FOUND
          </h1>
          <p className="mb-8 text-xl text-gray-400">
            This space does not exist yet.
          </p>
          <CreateSpaceButton>
            <Button variant={"addBtn"}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create This Space
            </Button>
          </CreateSpaceButton>
        </div>
      </div>
    );
  }

  const data = await res.json();

  return (
    <>
      <div className="h-fit mb-4 lg:mb-8">
        <h1 className="text-3xl font-semibold">Dashboard</h1>
        <div className="flex justify-end">
          <CreateSpaceButton>
            {
              <Button
                variant={"addBtn"}
                className="cursor-pointer"
                type="button"
              >
                <Plus className="mr-2 h-4 w-4" /> Create Space
              </Button>
            }
          </CreateSpaceButton>
        </div>
      </div>
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
    </>
  );
}

export default ListSpace;
