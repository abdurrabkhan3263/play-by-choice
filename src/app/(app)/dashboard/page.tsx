import CreateSpaceButton from "@/components/CreateSpaceButton";
import ListStreams from "@/components/ListStreams";
import React from "react";

function Dashboard() {
  return (
    <div className="flex justify-center">
      <div
        className="main_container w-[1280px]"
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
