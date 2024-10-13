"use client";

import Image from "next/image";
import Link from "next/link";
import { dateFormat } from "@/lib/utils";
import { SpaceType } from "@/types";
import { CalendarDays, Music, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useRouter } from "next/navigation";
import DeleteSpace from "./DeleteSpace";
import { Button } from "../ui/button";

export default function SpaceCard({
  id,
  name,
  createdAt,
  Stream,
  createdBy,
}: SpaceType) {
  const router = useRouter();

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
        <DeleteSpace
          createdBy={createdBy}
          name={name}
          spaceId={id}
          place="in_space"
        >
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
          >
            <span className="sr-only">Delete space</span>
            <X className="h-5 w-5" />
          </Button>
        </DeleteSpace>
      </div>
    </div>
  );
}
