"use client";

import ListStreams from "@/components/ListStreams";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import React from "react";

function Dashboard() {
  const router = useRouter();

  return (
    <div className="flex justify-center">
      <div
        className="main_container w-[1280px]"
        style={{ height: "calc(100vh - 128px)" }}
      >
        <div className="h-[60px]">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <div className="flex justify-end">
            <Button
              variant={"addBtn"}
              className="px-8 py-5 md:py-4 mt-4"
              onClick={() => router.push("/dashboard/create-stream")}
            >
              Create New Stream
            </Button>
          </div>
        </div>
        <ListStreams />
      </div>
    </div>
  );
}

export default Dashboard;
