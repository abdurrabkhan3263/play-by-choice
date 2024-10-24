import { timeAgo } from "@/lib/utils";
import { CreateStreamType } from "@/types";
import { ChevronDown, ChevronUp, Music2, Play, Trash2 } from "lucide-react";
import Image from "next/image";
import React, { useEffect } from "react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";

function StreamCard({
  title,
  image,
  type,
  createdAt,
  setStream,
  id,
  itemType,
  listSongs,
}: {
  title: string;
  image: string;
  type: string;
  createdAt: Date;
  setStream: React.Dispatch<React.SetStateAction<CreateStreamType[]>>;
  id: string;
  itemType?: "album" | "track" | "playlist";
  listSongs?: CreateStreamType[];
}) {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const removeStream = () => {
    setStream((prev) => prev.filter((s) => s.extractedId !== id));
  };

  useEffect(() => {
    if (listSongs && itemType !== "track" && listSongs?.length === 0) {
      setStream((prev) => prev.filter((s) => s.extractedId !== id));
    }
  }, [id, itemType, listSongs, setStream]);

  return (
    <Card
      className="w-full mx-auto flex-shrink-0 overflow-hidden rounded-xl shadow-lg transition-all duration-300 ease-in-out hover:shadow-xl"
      style={{
        background: "linear-gradient(135deg, #5A5B5A 0%, #6B6D6B 100%)",
      }}
    >
      <CardContent className="p-3.5">
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
              {itemType !== "track" && <span>{listSongs?.length} songs</span>}
              {itemType === "track" && (
                <>
                  <p>{type}</p>
                  {type !== "Youtube" && (
                    <Play size={16} className="text-gray-400" />
                  )}
                </>
              )}
            </div>
            <p className="text-sm text-[#A9C4D7] mt-1">{timeAgo(createdAt)}</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={removeStream}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
            aria-label={isExpanded ? "Collapse playlist" : "Expand playlist"}
          >
            <Trash2 size={20} className="text-[#A9C4D7]" />
          </Button>
          {itemType !== "track" && (
            <Button
              variant="ghost"
              size="icon"
              type="button"
              onClick={() => setIsExpanded((prev) => !prev)}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
              aria-label={isExpanded ? "Collapse playlist" : "Expand playlist"}
            >
              {isExpanded ? (
                <ChevronUp size={20} className="text-[#A9C4D7]" />
              ) : (
                <ChevronDown size={20} className="text-[#A9C4D7]" />
              )}
            </Button>
          )}
        </div>
        {isExpanded && listSongs && (
          <ScrollArea className="h-64 mt-4 pr-4">
            {listSongs.map((song) => (
              <div
                key={song.extractedId}
                className="flex items-center justify-between py-2 text-[#E0E0E0]"
              >
                <div className="flex items-center space-x-2">
                  <Music2 size={16} className="text-[#A9C4D7]" />
                  <div>
                    <p className="font-medium">{song.title}</p>
                    <p className="text-sm text-[#A9C4D7]">{song.artists}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  type="button"
                  onClick={() => {
                    setStream((prev) =>
                      prev.map((s) => {
                        if (s.extractedId === id) {
                          return {
                            ...s,
                            listSongs: s.listSongs?.filter(
                              (ls) => ls.extractedId !== song.extractedId
                            ),
                          };
                        }
                        return s;
                      })
                    );
                  }}
                  className="p-1.5 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors duration-200"
                >
                  <Trash2 size={20} className="text-[#A9C4D7]" />
                </Button>
              </div>
            ))}
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}

export default StreamCard;
