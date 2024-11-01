"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useState } from "react";
import CreateSpace from "./CreateSpace";
import { Plus } from "lucide-react";

function CreateSpaceButton({ children }: { children: React.ReactNode }) {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[700px] bg-[#2A2B2A] border-gray-700 text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-3xl font-semibold text-primary">
            Create Space
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Add a new space and include streams to it.
          </DialogDescription>
        </DialogHeader>
        <CreateSpace setIsDialogOpen={setIsDialogOpen} />
      </DialogContent>
    </Dialog>
  );
}

export default CreateSpaceButton;
