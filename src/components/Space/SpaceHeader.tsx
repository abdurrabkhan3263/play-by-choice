import React, { useCallback, useEffect } from "react";
import { useRef } from "react";
import { motion } from "framer-motion";
import { Save, MoreVertical, Share2, Trash2, Edit2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { updateSpaceName } from "@/lib/action/space.action";
import { useToast } from "@/hooks/use-toast";
import DeleteSpace from "./DeleteSpace";
import { SpaceStreamList } from "@/types";

function SpaceHeader({ streamList }: { streamList: SpaceStreamList }) {
  const spaceId = streamList.id;
  const { toast } = useToast();
  const [spaceName, setSpaceName] = React.useState<string>(
    streamList.name ?? ""
  );
  const [isEditing, setIsEditing] = React.useState(false);
  const editingContainer = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  const handleShare = () => {
    const link = `${window.location.origin}/dashboard/stream/${spaceId}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(link)}`;
    window.open(whatsappUrl, "_blank");
  };

  const changeSpaceName = useCallback(async () => {
    try {
      if (streamList.name === spaceName) return;
      const updatedSpace = await updateSpaceName({ spaceId, spaceName });
      if (updatedSpace?.status === "Success") {
        streamList.name = spaceName;
        toast({
          title: "Success",
          description:
            updatedSpace?.message ?? "Space name updated successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsEditing(false);
    }
  }, [spaceName, isEditing, streamList]);

  useEffect(() => {
    if (isEditing && input.current) {
      input.current.focus();
    }
    if (!isEditing && spaceName !== streamList.name) {
      changeSpaceName();
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (
        editingContainer.current &&
        !editingContainer.current.contains(event.target as Node)
      ) {
        changeSpaceName();
      }
    };
    if (isEditing) {
      document.addEventListener("click", handleClick);
    }
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [changeSpaceName, isEditing]);

  return (
    <Card className="w-full bg-[#171F2D] border-none shadow-none">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2" ref={editingContainer}>
            <Input
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-100 text-white placeholder-gray-400"
              disabled={!isEditing}
              ref={input}
            />
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsEditing((prev) => !prev)}
                    className="text-gray-300 hover:text-white hover:bg-gray-700"
                  >
                    {!isEditing ? (
                      <Edit2 className="h-5 w-5" />
                    ) : (
                      <Save className="h-5 w-5" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{isEditing ? "Save" : "Edit"} space name</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                className="bg-blue-500 hover:bg-blue-600 text-white"
                onClick={handleShare}
              >
                <Share2 className="w-5 h-5 mr-2" />
                Share
              </Button>
            </motion.div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="border-gray-600 text-gray-300 hover:text-white hover:bg-gray-700"
                >
                  <MoreVertical className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-[#1F2937] border-gray-600"
              >
                <DeleteSpace
                  createdBy={streamList.createdBy}
                  name={spaceName}
                  spaceId={spaceId}
                  place="in_stream"
                >
                  <DropdownMenuItem className="text-red-400 focus:text-red-300 focus:bg-red-900">
                    <Trash2 className="w-5 h-5 mr-2" />
                    Delete Space
                  </DropdownMenuItem>
                </DeleteSpace>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default SpaceHeader;
