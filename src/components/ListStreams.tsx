import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";

function ListStreams() {
  return (
    <div className="custom_scroll stream_container">
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="w-full max-w-96 lg:max-w-full relative rounded-lg flex-shrink-0 p-4 bg-[#3a3b3a] shadow-md"
        >
          <div className="absolute  right-6 top-6 lg:right-5 lg:top-5">
            <button className="bg-red-500 rounded-full p-2">
              <Image
                src="/logo/delete.svg"
                height={24}
                width={24}
                alt="delete"
              />
            </button>
          </div>
          <div className="lg:flex gap-x-8 items-start">
            <Image
              src="/music.jpg"
              height={200}
              width={200}
              alt="image"
              className="w-full lg:w-32 object-cover rounded-lg"
            />
            <div className="mt-4">
              <h1 className="text-2xl text-balance font-medium">
                School Concert Song
              </h1>
              <span className="text-gray-400 text-sm">12/12/2021</span>
            </div>
          </div>
          <Button size={"full"}>
            <span className="text-gray-50">View Stream</span>
          </Button>
        </div>
      ))}
    </div>
  );
}

export default ListStreams;
