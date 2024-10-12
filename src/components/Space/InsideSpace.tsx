"use client";

import React, { useEffect } from "react";
import { CreateStreamType, SpaceStreamList, StreamTypeApi } from "@/types";
import StreamCard from "../Stream/SpaceCard";
import { Input } from "../ui/input";
import Image from "next/image";
import { Button } from "../ui/button";
import AddStreamBtn from "../AddStreamBtn";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { updateStream } from "@/lib/action/stream.action";

function InsideSpace({
  streamList,
  spaceId,
}: {
  streamList: SpaceStreamList;
  spaceId: string;
}) {
  const [spaceName, setSpaceName] = React.useState<string>(streamList.name);
  const [listStream, setListStream] = React.useState<StreamTypeApi[]>(
    streamList.Stream
  );
  const [addedStream, setAddedStream] = React.useState<CreateStreamType[]>([]);
  const [streamUrl, setStreamUrl] = React.useState<string>("");
  const { toast } = useToast();
  const { data, status } = useSession();

  useEffect(() => {
    const addStream = async () => {
      try {
        addedStream[0].spaceId = spaceId;
        const newStream = await updateStream({
          spaceId,
          stream: addedStream[0],
        });
        if (newStream) {
          setListStream((prev) => [...prev, newStream]);
          toast({
            title: "Success",
            description: "Stream added successfully",
          });
        }
      } catch (error) {
        console.log("Error happened", error);
        toast({
          title: "Error",
          description:
            error instanceof Error ? error.message : "Something went wrong",
          variant: "destructive",
        });
      } finally {
        setAddedStream([]);
      }
    };

    if (addedStream.length > 0) {
      addStream();
    }
  }, [addedStream]);

  return (
    <>
      <div className="col-span-1 bg-gradient-to-br flex flex-col overflow-hidden gap-4 from-gray-800 to-gray-900 md:col-span-2 lg:col-span-3 xl:col-span-4 rounded-xl p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <input
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="bg-transparent text-2xl py-0.5 px-2 min-w-[150px] rounded-md outline-none font-semibold border"
              disabled
            />
            <button>
              <Image src={"/logo/edit.svg"} height={24} width={24} alt="edit" />
            </button>
          </div>
          {status !== "loading" &&
            streamList.createdBy.email === data?.user.email && (
              <Button className="gap-2">
                Delete Space{"  "}
                <Image
                  src={"/logo/delete.svg"}
                  height={20}
                  width={20}
                  alt="delete"
                />
              </Button>
            )}
        </div>
        <div className="flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-6 flex-1 overflow-y-auto custom_scroll">
          {Array.isArray(listStream) && listStream.length > 0 ? (
            listStream.map((stream: StreamTypeApi) => (
              <StreamCard
                key={stream.id}
                stream={stream}
                currentStream={streamList.CurrentStream[0]}
                role={
                  streamList.createdBy.email === data?.user.email
                    ? "Owner"
                    : stream.user.email === data?.user.email
                    ? "Creator"
                    : "Member"
                }
              />
            ))
          ) : (
            <p>No Stream Available</p>
          )}
        </div>
      </div>
      <div className="col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4">
        <h1 className="text-2xl font-semibold">Add New Stream</h1>
        <div className="mt-3 flex flex-col gap-4">
          <Input
            placeholder="Enter stream URL"
            value={streamUrl}
            onChange={(e) => {
              setStreamUrl(e.target.value);
            }}
          />
          <AddStreamBtn
            setStream={setAddedStream}
            setStreamUrl={setStreamUrl}
            stream={listStream as CreateStreamType[]}
            streamUrl={streamUrl}
          />
        </div>
      </div>
    </>
  );
}

export default InsideSpace;
