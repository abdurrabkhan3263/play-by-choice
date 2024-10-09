import Image from "next/image";
import React from "react";
import { Button } from "./ui/button";
import { headers } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

async function ListStreams() {
  const currentUser = await getServerSession(authOptions);
  const host = headers().get("host");
  const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
  const res = await fetch(
    `${protocol}://${host}/api/get-all-spaces/${encodeURIComponent(
      currentUser?.user?.email as string
    )}`,
    {
      method: "GET",
    }
  );

  if (res.status >= 400) {
    return (
      <div className="flex items-center justify-center h-96">
        <h1 className="text-3xl text-gray-400">No Streams Found</h1>
      </div>
    );
  }

  const data = await res.json();

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-96">
        <h1 className="text-3xl text-gray-400">No Streams Found</h1>
      </div>
    );
  }

  data.data.map((d: any) => console.log(d));

  return (
    <div className="custom_scroll stream_container">
      {Array.isArray(data.data) &&
        data.data.map(
          ({
            id,
            name,
            createdBy,
            Stream,
            createdAt,
          }: {
            id: string;
            name: string;
            createdBy: any;
            Stream: any;
            createdAt: string;
          }) => (
            <div
              key={id}
              className="w-full max-w-96 lg:max-w-full relative rounded-lg flex-shrink-0 p-4 bg-[#3a3b3a] shadow-md"
            >
              <div className="absolute  right-6 top-6 lg:right-5 lg:top-5">
                <button className="bg-red-500 rounded-full p-2">
                  <Image
                    src={"/logo/delete.svg"}
                    height={24}
                    width={24}
                    alt="delete"
                  />
                </button>
              </div>
              <div className="lg:flex gap-x-8 items-start">
                <Image
                  src={Stream.length > 0 ? Stream[0].bigImg : "/music.jpg"}
                  height={200}
                  width={200}
                  alt="image"
                  className="w-full lg:w-32 object-cover rounded-lg"
                />
                <div className="mt-4">
                  <h1 className="text-2xl text-balance font-medium">{name}</h1>
                  <span className="text-gray-400 text-sm">12/12/2021</span>
                </div>
              </div>
              <Button size={"full"}>
                <span className="text-gray-50">View Stream</span>
              </Button>
            </div>
          )
        )}
    </div>
  );
}

export default ListStreams;
