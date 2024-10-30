"use client";

import Image from "next/image";
import React, { useEffect } from "react";
import { Button } from "../ui/button";
import {
  CurrentStream,
  handleDelete,
  StreamTypeApi,
  toggleUpvote,
} from "@/types";
import { timeAgo } from "@/lib/utils";
import {
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  Loader2,
  Music,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

interface Props {
  stream: StreamTypeApi;
  currentStream: CurrentStream;
  role: "Owner" | "Member" | "Creator";
  userId: string;
  handleDelete: ({
    streamId,
    spaceId,
    setIsDeleting,
    setIsOpen,
  }: handleDelete) => void;

  toggleUpvote: ({
    stream,
    streamId,
    isUpVoted,
    setIsUpVoted,
    setUpvoting,
  }: toggleUpvote) => void;
}

function SpaceCard({
  stream,
  currentStream,
  role,
  userId,
  handleDelete,
  toggleUpvote,
}: Props) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [upVoting, setUpvoting] = React.useState(false);
  const [isUpVoted, setIsUpVoted] = React.useState(
    stream.Upvote.some((upvote) => upvote.userId === userId)
  );

  const imageHostName = new URL(stream.bigImg)?.hostname;

  return (
    <div className="relative w-full h-fit p-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 group">
      <div className="flex flex-col xl:flex-row gap-4 lg:gap-6">
        <div
          className={`relative ${
            imageHostName === "i.ytimg.com" ? "aspect-video" : "aspect-square"
          } w-full xl:w-28 overflow-hidden rounded-lg bg-gray-700 shadow-inner group-hover:shadow-lg transition-all duration-300`}
        >
          <Image
            src={stream.bigImg || "/No_Image_Available.jpg"}
            layout="fill"
            objectFit="cover"
            alt={stream.title}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col justify-between flex-grow">
          <div>
            <h2 className="text-xl text-balance overflow-hidden font-bold text-white mb-2 flex items-center gap-2">
              {stream.title.length >= 50
                ? stream.title.slice(0, 50) + "..... "
                : stream.title}
              {currentStream &&
                stream.id === currentStream.streamId &&
                !stream.played && (
                  <Music className="text-blue-400 animate-pulse" size={24} />
                )}
              {stream.played && !stream.active && (
                <CheckCircleIcon className="text-green-400" size={24} />
              )}
            </h2>
            <p className="text-sm text-gray-400">
              {timeAgo(stream.createdAt)}{" "}
              <span className="text-gray-500">by</span>{" "}
              <span className="font-medium text-gray-300">
                {stream.user.name}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Button
              variant="outline"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105"
              onClick={() => {
                setIsUpVoted((prev) => !prev);
                toggleUpvote({
                  stream,
                  streamId: stream.id,
                  isUpVoted: !isUpVoted,
                  setIsUpVoted,
                  setUpvoting,
                });
              }}
              disabled={upVoting}
            >
              {upVoting ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <>
                  {isUpVoted ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronUpIcon className="h-5 w-5" />
                  )}
                </>
              )}
              {stream.Upvote.length > 0 && (
                <span className="ml-2 font-semibold">
                  {stream.Upvote.length}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
      {currentStream && currentStream.streamId === stream.id ? (
        <></>
      ) : (
        (role === "Owner" || role === "Creator") && (
          <div className="absolute top-2 right-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-red-600/20 rounded-full transition-colors duration-300"
                >
                  <span className="sr-only">Delete Stream</span>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100 border-gray-700">
                <DialogHeader>
                  <DialogTitle className="text-xl font-semibold">
                    Delete Space
                  </DialogTitle>
                  <DialogDescription className="text-gray-400">
                    Are you sure you want to delete this space? This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>
                <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                  <h3 className="font-medium text-gray-200">{stream.title}</h3>
                  <p className="text-sm text-gray-400">
                    Created by {stream.user.name}
                  </p>
                </div>
                <DialogFooter className="sm:justify-between">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() =>
                      handleDelete({
                        setIsDeleting,
                        setIsOpen,
                        streamId: stream.id,
                        spaceId: stream.spaceId,
                      })
                    }
                    className="bg-red-600 hover:bg-red-700 text-white transition-colors duration-300"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Delete"
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-300 border-gray-600 hover:bg-gray-700 transition-colors duration-300"
                  >
                    Cancel
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        )
      )}
    </div>
  );
}

export default SpaceCard;
