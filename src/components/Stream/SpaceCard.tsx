"use client";

import Image from "next/image";
import React from "react";
import { Button } from "../ui/button";
import { CurrentStream, StreamTypeApi } from "@/types";
import { timeAgo } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

function SpaceCard({
  stream,
  currentStream,
  role,
}: {
  stream: StreamTypeApi;
  currentStream: CurrentStream;
  role: "Owner" | "Member" | "Creator";
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  const deleteStream = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/stream/${stream.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setIsDeleting(false);
        setIsOpen(false);
      }
    } catch (error) {
      console.log("Error happened", error);
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="w-full relative h-fit flex flex-col gap-2 lg:gap-8 lg:flex-row ss:w-[46%] flex-shrink-0 lg:w-full p-3 rounded-lg shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl"
      style={{
        background: "linear-gradient(135deg, #5A5B5A 0%, #6B6D6B 100%)",
      }}
    >
      <div className="relative aspect-square lg:w-32 overflow-hidden rounded-lg bg-gray-700 shadow-inner">
        <Image
          src={stream.bigImg || "/No_Image_Available.jpg"}
          layout="fill"
          lazyBoundary="100px"
          objectFit="cover"
          alt="music_name"
        />
      </div>
      <div className="flex flex-col justify-between">
        <div className="flex flex-col">
          <h2 className="text-2xl font-semibold flex gap-2">
            {stream.title}
            {currentStream && stream.id === currentStream.streamId && (
              <Image
                src={"/logo/music_wave.svg"}
                height={24}
                width={24}
                alt="play"
              />
            )}
          </h2>
          <span className="text-sm">
            {timeAgo(stream.createdAt)}{" "}
            <span className="text-gray-400">by</span>{" "}
            <span className="font-semibold">{stream.user.name}</span>
          </span>
        </div>
        <div className="flex gap-3 mt-4 items-center">
          <Button className="flex gap-2">
            UpVote
            <Image src={"/logo/up.svg"} height={24} width={24} alt="vote" />
          </Button>
          {stream.Upvote.length > 0 && (
            <span className="font-semibold">{stream.Upvote.length}</span>
          )}
        </div>
      </div>
      {role === "Owner" || role === "Creator" ? (
        <div className="absolute right-2 top-2">
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
              >
                <span className="sr-only">Delete Stream</span>
                <Image
                  src={"/logo/delete.svg"}
                  height={38}
                  width={38}
                  alt="delete"
                  className="hover:bg-[#171f2e] p-2 rounded-full bg-[#273344] transition-all duration-300 ease-in-out"
                />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold">
                  Delete Space
                </DialogTitle>
                <DialogDescription className="text-gray-400">
                  Are you sure you want to delete this space? This action cannot
                  be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                <h3 className="font-medium text-gray-200">{stream.title}</h3>
                <p className="text-sm text-gray-400">
                  Created by {stream.user.name}
                </p>
              </div>
              <DialogFooter className="sm:justify-between w-full">
                <Button
                  type="button"
                  variant="destructive"
                  onClick={deleteStream}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete{" "}
                  {isDeleting && (
                    <Loader2
                      height={18}
                      width={18}
                      className="animate-spin ml-2"
                    />
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  className="text-gray-600 border-gray-600 hover:bg-gray-700"
                >
                  Cancel
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
}

export default SpaceCard;
