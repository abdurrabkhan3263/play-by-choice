"use client";

import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { CurrentStream, StreamTypeApi } from "@/types";
import { timeAgo } from "@/lib/utils";
import {
  CheckCircleIcon,
  Loader2,
  Music,
  ThumbsDown,
  ThumbsUp,
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
import {
  deleteStream as deleteStreamApi,
  deleteUpVoteStream,
  upVoteStream,
} from "@/lib/action/stream.action";
import { useToast } from "@/hooks/use-toast";

function SpaceCard({
  stream,
  currentStream,
  role,
  setStream,
  userId,
}: {
  stream: StreamTypeApi;
  currentStream: CurrentStream;
  role: "Owner" | "Member" | "Creator";
  setStream: React.Dispatch<React.SetStateAction<StreamTypeApi[]>>;
  userId: string;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [upVoting, setUpvoting] = React.useState(false);
  const [isUpVoted, setIsUpVoted] = React.useState(
    stream.Upvote.some((upvote) => upvote.userId === userId)
  );
  const { toast } = useToast();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteStreamApi({
        streamId: stream.id,
        spaceId: stream.spaceId,
        baseUrl,
      });
      if (res.status === "Success") {
        setStream((prev) => prev.filter((item) => item.id !== stream.id));
        setIsDeleting(false);
        setIsOpen(false);
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsDeleting(false);
    }
  };

  const handleUpVote = async () => {
    setUpvoting(true);
    try {
      const res = await upVoteStream({ streamId: stream.id, baseUrl });
      if (res.status === "Success") {
        stream.Upvote.push(res.data);
        setIsUpVoted(true);
        toast({
          title: "Success",
          description: "Upvoted stream",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to upvote stream",
        variant: "destructive",
      });
    } finally {
      setUpvoting(false);
    }
  };

  const removeUpvote = async () => {
    setUpvoting(true);
    try {
      const res = await deleteUpVoteStream({ streamId: stream.id, baseUrl });
      if (res.status === "Success") {
        stream.Upvote = stream.Upvote.filter(
          (upvote) => upvote.userId !== userId
        );
        setIsUpVoted(false);
        toast({
          title: "Success",
          description: "Removed upvote",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to remove upvote",
        variant: "destructive",
      });
    } finally {
      setUpvoting(false);
    }
  };

  const imageHostName = new URL(stream.bigImg)?.hostname;

  return (
    <div className="relative w-full sm:w-[48%] md:w-[40%] lg:w-full p-4 rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 group">
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
        <div
          className={`relative ${
            imageHostName === "i.ytimg.com" ? "aspect-video" : "aspect-square"
          } w-full lg:w-28 overflow-hidden rounded-lg bg-gray-700 shadow-inner group-hover:shadow-lg transition-all duration-300`}
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
            <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
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
            {isUpVoted ? (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={removeUpvote}
                disabled={upVoting}
              >
                {upVoting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ThumbsDown className="mr-2 h-4 w-4" />
                    Upvote
                  </>
                )}
                {stream.Upvote.length > 0 && (
                  <span className="ml-2 font-semibold">
                    {stream.Upvote.length}
                  </span>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white border-none transition-all duration-300 ease-in-out transform hover:scale-105"
                onClick={handleUpVote}
                disabled={upVoting}
              >
                {upVoting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <>
                    <ThumbsUp className="mr-2 h-4 w-4" />
                    Upvote
                  </>
                )}
                {stream.Upvote.length > 0 && (
                  <span className="ml-2 font-semibold">
                    {stream.Upvote.length}
                  </span>
                )}
              </Button>
            )}
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
                    onClick={handleDelete}
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
