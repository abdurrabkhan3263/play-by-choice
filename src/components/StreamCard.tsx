import { timeAgo } from "@/lib/utils";
import { CreateStreamType } from "@/types";
import Image from "next/image";
import React from "react";

function StreamCard({
  title,
  image,
  type,
  createdAt,
  setStream,
  id,
}: {
  title: string;
  image: string;
  type: string;
  createdAt: Date;
  setStream: React.Dispatch<React.SetStateAction<CreateStreamType[]>>;
  id: string;
}) {
  const removeStream = () => {
    setStream((prev) => prev.filter((s) => s.extractedId !== id));
  };

  return (
    <div className="w-full h-fit p-2 text-[#2E2E2E] rounded-md shrink-0 bg-[#F9F9F9]">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <div className="h-20 w-28 rounded-lg overflow-hidden bg-red-500">
            <Image
              src={image || "/No_Image_Available.jpg"}
              height={300}
              width={300}
              alt="spotify"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold">
              {title || "Unknown Title"}
            </h3>
            <div>
              <div className="flex gap-1">
                <p className="text-sm">{type}</p>
                <Image
                  src="/logo/play.svg"
                  height={16}
                  width={16}
                  alt="spotify"
                />
              </div>
              <p className="text-sm">{timeAgo(createdAt)}</p>
            </div>
          </div>
        </div>
        <button type="button" onClick={removeStream}>
          <Image
            src="/logo/close.svg"
            height={26}
            width={26}
            alt="delete"
            className="cursor-pointer"
          />
        </button>
      </div>
    </div>
  );
}

export default StreamCard;
