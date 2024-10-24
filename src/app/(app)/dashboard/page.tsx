import CreateSpaceButton from "@/components/Space/CreateSpaceButton";
import ListStreams from "@/components/Space/ListSpace";
import React from "react";

async function Dashboard() {
  return (
    <div className="flex justify-center">
      <div
        className="main_container max-w-7xl w-full"
        style={{ height: "calc(100vh - 128px)" }}
      >
        <div className="h-[60px]">
          <h1 className="text-3xl font-semibold">Dashboard</h1>
          <div className="flex justify-end">
            <CreateSpaceButton />
          </div>
        </div>
        <ListStreams />
      </div>
    </div>
  );
}

export default Dashboard;
