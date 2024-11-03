"use client";

import React, { useCallback } from "react";
import {
  CreateStreamType,
  CurrentStream,
  InsideSpaceProps,
  StreamTypeApi,
  toggleUpvote,
} from "@/types";
import StreamCard from "../Stream/SpaceCard";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  deleteStream,
  toggleUpVote,
  updateStream,
} from "@/lib/action/stream.action";
import SpaceHeader from "./SpaceHeader";
import YoutubePlayer from "../YoutubePlayer";
import { ScrollArea } from "../ui/scroll-area";
import { ChevronDown, ChevronUp, Disc3, Music2, Trash2 } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import Image from "next/image";
import Loader from "../Loader/Loader";
import {
  messageForSongLimit,
  messageForUserLimit,
  SONG_LIMIT,
  USER_LIMIT_SONG_LIST,
} from "@/lib/constants";
import { sortStream, userStreamCount } from "@/lib/utils";
import { debounce, set } from "lodash";
import { useSession } from "next-auth/react";

const InsideSpace: React.FC<InsideSpaceProps> = ({
  streamList,
  spaceId,
  spaceType,
  currentStream,
  role,
  currentUserId,
}) => {
  const [listStream, setListStream] = React.useState<StreamTypeApi[]>(
    streamList.Stream
  );
  const { data, status } = useSession();
  const { toast } = useToast();

  const stream = listStream.find(
    (stream) => stream.id === currentStream.data?.streamId
  );

  // All function and state for upvote and downvote and delete stream
  const handleDelete = async ({
    streamId,
    spaceId,
    setIsDeleting,
    setIsOpen,
  }: {
    streamId: string;
    spaceId: string;
    setIsDeleting: React.Dispatch<React.SetStateAction<boolean>>;
    setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  }) => {
    setIsDeleting(true);
    try {
      const res = await deleteStream({
        streamId,
        spaceId,
      });
      if (res.status === "Success") {
        setListStream((prev) => prev.filter((item) => item.id !== streamId));
        setIsDeleting(false);
        setIsOpen(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleUpVoteDebounce = useCallback(
    debounce(
      async ({
        stream,
        streamId,
        isUpVoted,
        setIsUpVoted,
        setUpvoting,
      }: toggleUpvote) => {
        try {
          setUpvoting(true);
          const res = await toggleUpVote({ streamId, isUpVoted });
          if (res.status === "Success") {
            if (!isUpVoted) {
              setIsUpVoted(true);
              stream.Upvote = stream.Upvote.filter(
                (upvote) => upvote.userId !== data?.user.id
              );
            } else {
              stream.Upvote.push(res?.data);
            }

            toast({
              title: "Success",
              description: res?.message ?? "Upvoted stream successfully",
            });
            setListStream(sortStream(listStream));
          }
        } catch (error) {
          toast({
            title: "Error",
            description:
              error instanceof Error
                ? error.message
                : "Failed to upvote stream",
            variant: "destructive",
          });
        } finally {
          setUpvoting(false);
        }
      },
      300
    ),
    [data, listStream, toast]
  );

  return (
    <>
      {listStream.length <= 0 ? (
        <div className="col-span-5 bg-gradient-to-br flex flex-col overflow-hidden gap-4 from-gray-800 to-gray-900 rounded-xl p-4">
          <SpaceHeader streamList={streamList} />
          <div className="flex-1 flex justify-center mt-24">
            <div>
              <div className="text-center">
                <div className="mb-8 flex justify-center">
                  <Disc3 className="h-32 w-32 text-[#E1FF4B] animate-spin" />
                </div>
                <h1 className="mb-6 text-4xl font-bold tracking-wider text-[#E1FF4B]">
                  STREAM NOT FOUND
                </h1>
                <p className="mb-8 text-xl text-gray-400">
                  Add a new stream to get started
                </p>
              </div>
              <div>
                <AddStream
                  listStream={listStream}
                  setListStream={setListStream}
                  currentUserId={currentUserId}
                  spaceId={spaceId}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="col-span-5 bg-gradient-to-br flex flex-col overflow-hidden gap-4 from-gray-800 to-gray-900 md:col-span-2 lg:col-span-3 xl:col-span-4 rounded-xl p-4">
            <div className="flex flex-col gap-6 relative overflow-y-auto h-full custom_scroll">
              <SpaceHeader streamList={streamList} />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-4 custom_scroll">
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
                        currentStream={currentStream.data as CurrentStream}
                        role={role}
                        userId={data?.user.id}
                        handleDelete={handleDelete}
                        toggleUpvote={handleUpVoteDebounce}
                      />
                    );
                  })
                ) : (
                  <div className="flex justify-center items-center flex-1">
                    {status === "loading" ? (
                      <div className="absolute right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2">
                        <Loader />
                      </div>
                    ) : (
                      "No Stream Available"
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={`col-span-5 md:col-span-1 h-fit flex flex-col justify-between md:h-full md:mb-12 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4`}
          >
            <div>
              <h1 className="text-2xl font-semibold hidden md:block">
                Add New Stream
              </h1>
              <div className="mt-3 flex flex-row  md:flex-col gap-4">
                <AddStream
                  listStream={listStream}
                  setListStream={setListStream}
                  currentUserId={currentUserId}
                  spaceId={spaceId}
                />
              </div>
            </div>
            {currentStream?.data && spaceType === "youtube" && (
              <YoutubePlayer
                currentStream={currentStream.data}
                role={role}
                stream={stream}
              />
            )}
          </div>
        </>
      )}
    </>
  );
};

export default InsideSpace;

function AddStream({
  listStream,
  setListStream,
  currentUserId,
  spaceId,
}: {
  listStream: StreamTypeApi[];
  setListStream: React.Dispatch<React.SetStateAction<StreamTypeApi[]>>;
  currentUserId: string;
  spaceId: string;
}) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [streamUrl, setStreamUrl] = React.useState<string>("");
  const [listOfSongs, setListOfSongs] = React.useState<CreateStreamType | null>(
    null
  );
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = React.useState<boolean>(false);

  // Function to add into the database
  async function AddStreamToDB({
    streamData,
  }: {
    streamData: CreateStreamType | CreateStreamType[];
  }) {
    try {
      setIsSubmitting(true);

      if (Array.isArray(streamData)) {
        const totalNumberofStreams = listStream.length + streamData.length;
        const userLimit = userStreamCount(listStream, currentUserId);
        const isStreamAlreadyExist = streamData.some((stream) =>
          listStream.some((item) => item.extractedId === stream.extractedId)
        );

        if (totalNumberofStreams > SONG_LIMIT) {
          toast({
            title: "Error",
            description: messageForSongLimit,
            variant: "destructive",
          });
          return;
        } else if (userLimit + streamData.length > USER_LIMIT_SONG_LIST) {
          toast({
            title: "Error",
            description: messageForUserLimit,
            variant: "destructive",
          });
          return;
        } else if (isStreamAlreadyExist) {
          toast({
            title: "Error",
            description: "Stream already exist",
            variant: "destructive",
          });
          return;
        }
      }

      const newStream = await updateStream({
        spaceId,
        stream: streamData as CreateStreamType,
      });

      if (newStream && newStream?.data) {
        if (Array.isArray(newStream.data)) {
          setListStream((prev) => [...prev, ...newStream.data]);
          setListOfSongs(null);
        } else {
          setListStream((prev) => [...prev, newStream.data]);
        }
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
      setIsSubmitting(false);
    }
  }

  // Function to handle the submit of the form
  const handleOnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoading(true);

      const data = await fetch("/api/create-stream", {
        method: "POST",
        body: JSON.stringify({ streamUrl, stream: listStream, spaceId }),
      });

      const response = await data.json();

      if (!data?.ok) {
        throw new Error(response?.message ?? "Something went wrong");
      }

      if (response?.data?.itemType === "track") {
        delete response?.data.itemType;
        await AddStreamToDB({ streamData: response?.data as CreateStreamType });
      } else {
        setListOfSongs(response?.data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setStreamUrl("");
      setIsLoading(false);
    }
  };

  return (
    <>
      <form onSubmit={handleOnSubmit} className="flex gap-2 w-full">
        <Input
          placeholder="Enter stream URL"
          value={streamUrl}
          onChange={(e) => {
            setStreamUrl(e.target.value);
          }}
        />
        <Button
          variant={"addBtn"}
          type="submit"
          className="flex gap-2"
          disabled={isLoading}
        >
          {isLoading ? (
            <Image
              src="/logo/loader.svg"
              height={20}
              width={20}
              alt="loading"
              className="animate-spin"
            />
          ) : (
            "Add Stream"
          )}
        </Button>
      </form>
      {listOfSongs &&
        listOfSongs?.listSongs &&
        listOfSongs?.listSongs?.length > 0 && (
          <div className="fixed flex justify-center items-center z-50 bg-[#3a3b3a98] backdrop-blur-sm filter h-screen w-screen right-1/2 translate-x-1/2 top-1/2 -translate-y-1/2">
            <div className="h-fit w-full mx-4 md:w-1/2 lg:w-1/3 rounded-2xl">
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
                        src={listOfSongs?.bigImg}
                        layout="fill"
                        objectFit="cover"
                        alt={listOfSongs?.title}
                        className="transition-transform duration-300 ease-in-out hover:scale-110"
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg md:text-xl font-bold text-[#E0E0E0] mb-1">
                        {listOfSongs?.title}
                      </h3>
                      <div className="flex items-center space-x-2 text-sm text-[#A9C4D7]">
                        <span>{listOfSongs?.listSongs?.length} songs</span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      type="button"
                      onClick={() => setListOfSongs(null)}
                      className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
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
                      {listOfSongs?.listSongs.map((song) => (
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
                              setListOfSongs((prev) => {
                                if (!prev) return prev;
                                return {
                                  ...prev,
                                  listSongs: prev.listSongs?.filter(
                                    (i) => i.extractedId !== song.extractedId
                                  ),
                                };
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
                    disabled={isSubmitting}
                    onClick={async () =>
                      await AddStreamToDB({
                        streamData:
                          listOfSongs?.listSongs as CreateStreamType[],
                      })
                    }
                  >
                    {isSubmitting ? (
                      <Image
                        src="/logo/loader.svg"
                        height={20}
                        width={20}
                        alt="loading"
                        className="animate-spin"
                      />
                    ) : (
                      "Add Playlist"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
    </>
  );
}
