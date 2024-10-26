import DashboardSpaceCardSkeleton from "@/components/Skeleton/DashboardSpaceCard";
import CreateSpaceButton from "@/components/Space/CreateSpaceButton";
import ListStreams from "@/components/Space/ListSpace";
import { Metadata } from "next";
import React, { Suspense } from "react";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Dashboard",
};

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
        <Suspense fallback={<DashboardSpaceCardSkeleton />}>
          <ListStreams />
        </Suspense>
      </div>
    </div>
  );
}

export default Dashboard;
