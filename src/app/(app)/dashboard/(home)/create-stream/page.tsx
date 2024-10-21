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
import StreamCard from "@/components/Space/StreamCard";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { createSpace } from "@/lib/action/space.action";

function CreateStream() {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [stream, setStream] = useState<CreateStreamType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm<z.infer<typeof CreateStreamSchema>>({
    resolver: zodResolver(CreateStreamSchema),
    defaultValues: {
      spaceName: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof CreateStreamSchema>) => {
    setIsSubmitting(true);
    try {
      const addStream = await createSpace({ data, stream });
      if (addStream) {
        toast({
          title: "Success",
          description: addStream.message,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      form.reset();
    }
  };

  return (
    <div className="flex justify-center items-center fixed h-screen w-screen bg-[#3a3b3a98] backdrop-blur-sm filter top-1/2 -translate-y-1/2 right-1/2 translate-x-1/2">
      <div className="w-[600px] max-h-[80%] p-4 rounded-xl border bg-[#3a3b3a]">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-semibold">Add Stream</h1>
          <Link
            href={"/dashboard"}
            className="p-1.5 rounded-full bg-[#F9F9F9]  transition-all"
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
                      <div className="flex items-center gap-3">
                        <Input placeholder="Enter space name" {...field} />
                      </div>
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
                    setStreamUrl={setStreamUrl}
                  />
                </div>
              </div>
              <div className="mt-6">
                <h2 className="text-xl font-semibold">Added Stream</h2>
                <div
                  className="custom_scroll flex mt-2 flex-col gap-y-3 flex-1 overflow-y-auto"
                  style={{ maxHeight: "300px" }}
                >
                  {stream.length <= 0 ? (
                    <p className="text-sm text-[#8D8D8D]">No stream added</p>
                  ) : (
                    stream.map(
                      (
                        {
                          title,
                          bigImg,
                          createdAt,
                          type,
                          extractedId,
                          itemType,
                          listSongs,
                        },
                        index
                      ) => (
                        <StreamCard
                          title={title}
                          image={bigImg}
                          createdAt={createdAt}
                          type={type}
                          key={index}
                          setStream={setStream}
                          id={extractedId}
                          itemType={itemType}
                          listSongs={listSongs}
                        />
                      )
                    )
                  )}
                </div>
              </div>
            </div>
            <Button size={"full"} type="submit" disabled={isSubmitting}>
              Submit
              {isSubmitting && (
                <Image
                  src="/logo/loader.svg"
                  height={20}
                  width={20}
                  alt="loading"
                  className="animate-spin ml-2"
                />
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

export default CreateStream;
