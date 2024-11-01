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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateStreamSchema } from "@/lib/zod";
import { CreateStreamType } from "@/types";
import StreamCard from "@/components/Space/StreamCard";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { DialogFooter } from "../ui/dialog";
import { Loader2 } from "lucide-react";
import { messageForUserLimit, USER_LIMIT_SONG_LIST } from "@/lib/constants";
import Image from "next/image";
import { CreateStream as CreateStreamForSpace } from "@/lib/action/stream.action";
import { createSpace } from "@/lib/action/space.action";
import { totalNumberOfStreams } from "@/lib/utils";

function CreateSpace({
  setIsDialogOpen,
}: {
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [streamUrl, setStreamUrl] = useState<string>("");
  const [stream, setStream] = useState<CreateStreamType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
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
    const totalNumberOfStream = totalNumberOfStreams(stream);

    console.log("Streams:- ", stream);

    if (totalNumberOfStream > USER_LIMIT_SONG_LIST) {
      toast({
        title: "Error",
        description: messageForUserLimit,
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

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
      setStream([]);
      setIsDialogOpen(false);
    }
  };

  const handleAddStreams = async ({ streamUrl }: { streamUrl: string }) => {
    try {
      const getStream = await CreateStreamForSpace({
        stream,
        streamUrl,
      });
      if (getStream) {
        setStream((prev) => [...prev, getStream]);
        setStreamUrl("");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="spaceName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-200">Space Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter space name"
                  {...field}
                  className="bg-[#3A3B3A] border-gray-600 text-gray-100 focus:border-primary"
                />
              </FormControl>
              <FormMessage className="text-red-400" />
            </FormItem>
          )}
        />

        <div>
          <FormLabel className="text-gray-200">Stream URL</FormLabel>
          <div className="flex mt-2 gap-2.5 items-center">
            <Input
              placeholder="Enter stream URL"
              value={streamUrl}
              onChange={(e) => setStreamUrl(e.target.value)}
              className="bg-[#3A3B3A] border-gray-600 text-gray-100 focus:border-primary"
            />
            <Button
              variant={"addBtn"}
              type="button"
              className="flex gap-2"
              disabled={isLoading}
              onClick={() => handleAddStreams({ streamUrl })}
            >
              {isLoading ? (
                <Image
                  src="/logo/loader.svg"
                  height={20}
                  width={20}
                  alt="loading"
                  className="animate-spin"
                />
              ) : (
                "Add Stream"
              )}
            </Button>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold text-primary mb-2">
            Added Streams
          </h2>
          <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3 custom_scroll">
            {stream.length === 0 ? (
              <p className="text-lg text-gray-400 text-center">
                No streams added
              </p>
            ) : (
              stream.map((item, index) => (
                <StreamCard
                  key={index}
                  title={item.title}
                  image={item.bigImg}
                  createdAt={item.createdAt}
                  type={item.type}
                  setStream={setStream}
                  id={item.extractedId}
                  itemType={item.itemType}
                  listSongs={item.listSongs}
                />
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-4 rounded-md shadow-lg transition-all duration-300 ease-in-out transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                <span>Creating Space...</span>
              </div>
            ) : (
              <span>Create Space</span>
            )}
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
}

export default CreateSpace;
