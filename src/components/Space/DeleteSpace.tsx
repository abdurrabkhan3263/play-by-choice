"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteSpaceApi } from "@/lib/action/space.action";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

interface DeleteSpaceProps {
  spaceId: string;
  createdBy: { name: string; email: string };
  name: string;
  children: React.ReactNode;
  place: "in_space" | "in_stream";
}

function DeleteSpace({
  spaceId,
  createdBy,
  name,
  children,
  place,
}: DeleteSpaceProps): React.ReactElement {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { data, status } = useSession();

  const deleteSpace = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteSpaceApi({ id: spaceId });
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

  return status === "authenticated" && createdBy.email === data?.user.email ? (
    <div className={cn({ "absolute right-2 top-2": place === "in_space" })}>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px] bg-gray-800 text-gray-100 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">
              Delete Space
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Are you sure you want to delete this space? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 p-4 bg-gray-900 rounded-lg">
            <h3 className="font-medium text-gray-200">{name}</h3>
            <p className="text-sm text-gray-400">Created by {createdBy.name}</p>
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
                <Loader2 height={18} width={18} className="animate-spin ml-2" />
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
  );
}

export default DeleteSpace;
