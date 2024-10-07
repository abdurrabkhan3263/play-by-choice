"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { CreateStreamSchema } from "@/lib/zod";
import { CreateStreamType } from "@/types";
import AddStreamBtn from "@/components/AddStreamBtn";

function CreateStream() {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [stream, setStream] = useState<CreateStreamType[]>([]);

  const form = useForm<z.infer<typeof CreateStreamSchema>>({
    resolver: zodResolver(CreateStreamSchema),
    defaultValues: {
      spaceName: "",
    },
  });

  const onSubmit = (data: z.infer<typeof CreateStreamSchema>) => {
    console.log(data);
  };

  return (
    <div className="flex justify-center items-center fixed h-screen w-screen bg-[#3a3b3a98] backdrop-blur-sm filter top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2">
      <div className="w-[600px] max-h-[80%] p-4 rounded-xl border bg-[#3a3b3a]">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Add Stream</h1>
          <Link
            href={"/dashboard"}
            className="bg-red-500 p-1.5 rounded-full hover:bg-red-800 transition-all"
          >
            <Image src="/logo/close.svg" height={26} width={26} alt="delete" />
          </Link>
        </div>
        {/* Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 flex flex-col justify-between"
            style={{ height: "calc(100% - 52px)" }}
          >
            <div>
              <FormField
                control={form.control}
                name="spaceName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Stream Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter space name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="mt-2">
                <FormLabel>Stream Url</FormLabel>
                <div className="flex mt-2 gap-2.5 items-center">
                  <Input
                    placeholder="Enter stream URL"
                    value={streamUrl}
                    onChange={(e) => setStreamUrl(e.target.value)}
                  />
                  <AddStreamBtn
                    setStream={setStream}
                    streamUrl={streamUrl}
                    stream={stream}
                  />
                </div>
              </div>

              {stream.length <= 0 && (
                <div className="mt-6">
                  <h2 className="text-xl font-semibold">Added Stream</h2>
                  <div
                    className="flex mt-2 flex-col gap-y-3 flex-1 overflow-y-auto"
                    style={{ maxHeight: "300px" }}
                  >
                    <div className="w-full h-fit p-2 rounded-md shrink-0 bg-blue-500">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2 items-center">
                          <div className="h-20 w-28 rounded-lg overflow-hidden bg-red-500">
                            <Image
                              src={
                                "https://i.scdn.co/image/ab67616d00001e02bb52f4d0546656ebcf9ed925"
                              }
                              height={300}
                              width={300}
                              alt="spotify"
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">
                              Bheegi Bheegi raton mein yaad teri aayi hai
                            </h3>
                            <p className="text-sm">Spotify</p>
                          </div>
                        </div>
                        <button>
                          <Image
                            src="/logo/close.svg"
                            height={26}
                            width={26}
                            alt="delete"
                          />
                        </button>
                      </div>
                    </div>
                    <div className="w-full h-16 shrink-0 bg-blue-500"></div>
                  </div>
                </div>
              )}
            </div>
            <Button size={"full"} type="submit">
              Submit
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default CreateStream;
