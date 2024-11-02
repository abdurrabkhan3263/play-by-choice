import DashboardSpaceCardSkeleton from "@/components/Skeleton/DashboardSpaceCard";
import CreateSpaceButton from "@/components/Space/CreateSpaceButton";
import ListStreams from "@/components/Space/ListSpace";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
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
      <div className="main_container" style={{ height: "calc(100vh - 128px)" }}>
        <Suspense fallback={<DashboardSpaceCardSkeleton />}>
          <ListStreams />
        </Suspense>
      </div>
    </div>
  );
}

export default Dashboard;
