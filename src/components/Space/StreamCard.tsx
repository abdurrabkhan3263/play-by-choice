import { timeAgo } from "@/lib/utils";
import { CreateStreamType } from "@/types";
import { Play, X } from "lucide-react";
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
    <div
      className="w-full mx-auto flex-shrink-0 overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl"
      style={{
        background: "linear-gradient(135deg, #5A5B5A 0%, #6B6D6B 100%)",
      }}
    >
      <div className="p-3.5">
        <div className="flex items-center space-x-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg">
            <Image
              src={image}
              layout="fill"
              objectFit="cover"
              alt={title}
              className="transition-transform duration-300 ease-in-out hover:scale-110"
            />
          </div>
          <div className="flex-grow">
            <h3 className="text-xl font-bold text-[#E0E0E0] mb-1">{title}</h3>
            <div className="flex items-center space-x-2 text-sm text-[#A9C4D7]">
              <span>{type}</span>

              <Play size={16} className="text-gray-400" />
            </div>
            <p className="text-sm text-[#A9C4D7] mt-1">{timeAgo(createdAt)}</p>
          </div>
          <button
            type="button"
            onClick={removeStream}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
            aria-label="Remove stream"
          >
            <X size={20} className="text-[#A9C4D7]" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default StreamCard;
