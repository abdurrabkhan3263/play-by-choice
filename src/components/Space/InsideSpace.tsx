"use client";

import React, { useEffect } from "react";
import {
  CreateStreamType,
  CurrentStream,
  InsideSpaceProps,
  SpaceStreamList,
  StreamTypeApi,
} from "@/types";
import StreamCard from "../Stream/SpaceCard";
import { Input } from "../ui/input";
import AddStreamBtn from "../AddStreamBtn";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { updateStream } from "@/lib/action/stream.action";
import SpaceHeader from "./SpaceHeader";
import YoutubePlayer from "../YoutubePlayer";
import { ScrollArea } from "../ui/scroll-area";
import { ChevronDown, ChevronUp, Music2, Play, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { timeAgo } from "@/lib/utils";
import Image from "next/image";

const InsideSpace: React.FC<InsideSpaceProps> = ({
  streamList,
  spaceId,
  spaceType,
  currentStream,
}) => {
  const [listStream, setListStream] = React.useState<StreamTypeApi[]>(
    streamList.Stream
  );
  const [addedStream, setAddedStream] = React.useState<CreateStreamType[]>([]);
  const [streamUrl, setStreamUrl] = React.useState<string>("");
  const { toast } = useToast();
  const { data, status } = useSession();
  const [isListSong, setIsListSong] = React.useState({
    final: false,
    isList: false,
    check: false,
  });
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);

  useEffect(() => {
    const addStream = async () => {
      if (addedStream[0].itemType === "track" && !isListSong?.check) {
        setIsListSong({
          final: true,
          isList: false,
          check: true,
        });
      } else if (
        (addedStream[0].itemType === "playlist" ||
          addedStream[0].itemType === "album") &&
        !isListSong.check
      ) {
        setIsListSong({
          final: false,
          isList: true,
          check: true,
        });
      }

      if (isListSong.final) {
        try {
          const newStream = await updateStream({
            spaceId,
            stream: addedStream as CreateStreamType[],
          });
          if (newStream) {
            setListStream((prev) => [...prev, ...newStream.data]);
            toast({
              title: "Success",
              description: "Stream added successfully",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description:
              error instanceof Error ? error.message : "Something went wrong",
            variant: "destructive",
          });
        } finally {
          setAddedStream([]);
          setIsListSong({
            final: false,
            isList: false,
            check: false,
          });
        }
      }
    };
    if (addedStream.length > 0) {
      addStream();
    }
  }, [addedStream, isListSong, toast]);

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
      <div className="col-span-1 h-fit flex flex-col justify-between md:h-full md:mb-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4">
        <div>
          <h1 className="text-2xl font-semibold hidden md:block">
            Add New Stream
          </h1>
          <div className="mt-3 flex flex-row  md:flex-col gap-4">
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
              stream={listStream as StreamTypeApi[]}
              streamUrl={streamUrl}
            />
          </div>
        </div>
        {isListSong.isList && addedStream[0]?.listSongs && (
          <div className="fixed flex justify-center items-center z-50 bg-[#3a3b3a98] backdrop-blur-sm filter h-screen w-screen right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className="h-fit w-full mx-4 md:w-1/2 lg:w-1/3">
              <Card
                className="w-full mx-auto flex-shrink-0 overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl"
                style={{
                  background:
                    "linear-gradient(135deg, #5A5B5A 0%, #6B6D6B 100%)",
                }}
              >
                <CardContent className="p-3.5">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
                      <Image
                        src={addedStream[0]?.bigImg}
                        layout="fill"
                        objectFit="cover"
                        alt={addedStream[0]?.title}
                        className="transition-transform duration-300 ease-in-out hover:scale-110"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-[#E0E0E0] mb-1">
                        {addedStream[0]?.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-[#A9C4D7]">
                        <span>{addedStream[0]?.listSongs?.length} songs</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setAddedStream([])}
                      className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
                      aria-label={
                        isExpanded ? "Collapse playlist" : "Expand playlist"
                      }
                    >
                      <Trash2 size={20} className="text-[#A9C4D7]" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsExpanded((prev) => !prev)}
                      className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
                      aria-label={
                        isExpanded ? "Collapse playlist" : "Expand playlist"
                      }
                    >
                      {isExpanded ? (
                        <ChevronUp size={20} className="text-[#A9C4D7]" />
                      ) : (
                        <ChevronDown size={20} className="text-[#A9C4D7]" />
                      )}
                    </Button>
                  </div>
                  {isExpanded && (
                    <ScrollArea className="h-64 mt-4 pr-4">
                      {addedStream[0]?.listSongs.map((song) => (
                        <div
                          key={song.extractedId}
                          className="flex items-center justify-between py-2 text-[#E0E0E0]"
                        >
                          <div className="flex items-center space-x-2">
                            <Music2 size={16} className="text-[#A9C4D7]" />
                            <div>
                              <p className="font-medium">{song.title}</p>
                              <p className="text-sm text-[#A9C4D7]">
                                {song.artists}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            type="button"
                            onClick={() =>
                              setAddedStream((prev: CreateStreamType[]) => {
                                return [
                                  {
                                    ...prev[0],
                                    listSongs: prev[0].listSongs?.filter(
                                      (i) => i.extractedId !== song.extractedId
                                    ),
                                  },
                                ];
                              })
                            }
                            className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
                          >
                            <Trash2 size={20} className="text-[#A9C4D7]" />
                          </Button>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                  <Button
                    size={"full"}
                    type="button"
                    onClick={() =>
                      setIsListSong({ final: true, isList: true, check: true })
                    }
                  >
                    Submit
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {spaceType === "Youtube" && currentStream?.data && (
          <YoutubePlayer currentStream={currentStream.data} />
        )}
      </div>
    </>
  );
};

export default InsideSpace;
