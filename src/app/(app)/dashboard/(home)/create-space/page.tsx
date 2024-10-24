import React from "react";
import CreateSpace from "@/components/Space/CreateSpace";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Stream",
  description: "Create a new stream to share with your friends and followers.",
};

function CreateStream() {
  return (
    <div className="flex justify-center items-center fixed h-screen w-screen bg-[#3a3b3a98] backdrop-blur-sm filter top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2">
      <CreateSpace />
    </div>
  );
}

export default CreateStream;
