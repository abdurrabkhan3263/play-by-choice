"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { dateFormat } from "@/lib/utils";
import { SpaceType } from "@/types";
import { CalendarDays, Loader2, Music, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { deleteSpaceApi } from "@/lib/action/space.action";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

export default function SpaceCard({
  id,
  name,
  createdAt,
  Stream,
  createdBy,
}: SpaceType) {
  const [isOpen, setIsOpen] = useState(false);
  const { status, data } = useSession();
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const deleteSpace = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteSpaceApi({ id });
      if (res?.status === "Success") {
        setIsOpen(false);
        toast({
          title: "Success",
          description: "Space deleted successfully",
        });
        router.replace("/dashboard");
      } else {
        toast({
          title: "Error",
          description: res?.message || "Something went wrong",
          variant: "destructive",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-md lg:max-w-lg xl:max-w-xl">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div
              className="relative aspect-square w-full lg:w-36 overflow-hidden rounded-lg bg-gray-700 shadow-inner"
              onClick={() => router.push(`/dashboard/stream/${id}`)}
            >
              {Stream.length > 0 && Stream[0].bigImg ? (
                <Image
                  src={Stream[0].bigImg}
                  alt={name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-110"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Music className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1 space-y-4">
              <Link href={`/dashboard/stream/${id}`}>
                <h2 className="text-2xl font-bold leading-tight text-gray-100 group-hover:text-gray-300 transition-colors duration-200">
                  {name}
                </h2>
              </Link>
              <div className="flex items-center text-sm text-gray-400">
                <CalendarDays className="mr-2 h-4 w-4" />
                <time dateTime={dateFormat(createdAt)}>
                  {dateFormat(createdAt)}
                </time>
              </div>
              <div className="flex items-center space-x-3 pt-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={createdBy.image || ""}
                    alt={createdBy.name}
                  />
                  <AvatarFallback>{createdBy.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="text-sm">
                  <p className="font-medium text-gray-200">Created by</p>
                  <p className="text-gray-400">{createdBy.name}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {status !== "loading" && data?.user?.email === createdBy.email && (
          <div className="absolute right-2 top-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
                >
                  <span className="sr-only">Delete space</span>
                  <X className="h-5 w-5" />
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
                  <h3 className="font-medium text-gray-200">{name}</h3>
                  <p className="text-sm text-gray-400">
                    Created by {createdBy.name}
                  </p>
                </div>
                <DialogFooter className="sm:justify-between w-full">
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={deleteSpace}
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
        )}
      </div>
    </div>
  );
}
