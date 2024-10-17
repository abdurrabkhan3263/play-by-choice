"use client";

import React, { useEffect } from "react";
import { CreateStreamType, SpaceStreamList, StreamTypeApi } from "@/types";
import StreamCard from "../Stream/SpaceCard";
import { Input } from "../ui/input";
import AddStreamBtn from "../AddStreamBtn";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { updateStream } from "@/lib/action/stream.action";
import SpaceHeader from "./SpaceHeader";

function InsideSpace({
  streamList,
  spaceId,
}: {
  streamList: SpaceStreamList;
  spaceId: string;
}) {
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
          setListStream((prev) => [...prev, newStream.data]);
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
        <div className="flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-6 flex-1 overflow-y-auto custom_scroll">
          <SpaceHeader streamList={streamList} />
          {Array.isArray(listStream) &&
          status === "authenticated" &&
          listStream.length > 0 ? (
            listStream.map((stream: StreamTypeApi) => {
              const role =
                streamList.createdBy.email === data?.user.email
                  ? "Owner"
                  : stream.user.email === data?.user.email
                  ? "Creator"
                  : "Member";

              return (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  currentStream={streamList.CurrentStream[0]}
                  role={role}
                  setStream={setListStream}
                  userId={data?.user.id}
                />
              );
            })
          ) : (
            <p>
              {status === "loading" ? "Loading...." : "No Stream Available"}
            </p>
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
