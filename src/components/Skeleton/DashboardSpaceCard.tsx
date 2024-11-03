import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

export default function DashboardSpaceCardSkeleton() {
  return (
    <>
      <div className="h-fit mb-4 lg:mb-8">
        <Skeleton className="h-9 w-36 bg-gray-700" />
        <div className="flex justify-end">
          <Skeleton className="h-9 w-36 bg-gray-700" />
        </div>
      </div>
      <div className="space_container">
        <SpaceCardSkeleton />
        <SpaceCardSkeleton />
        <SpaceCardSkeleton />
        <SpaceCardSkeleton />
        <SpaceCardSkeleton />
        <SpaceCardSkeleton />
      </div>
    </>
  );
}

function SpaceCardSkeleton() {
  return (
    <div className="w-full">
      <div className="relative overflow-hidden rounded-xl border border-gray-700  bg-gradient-to-br from-gray-800 to-gray-900 shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1">
        <div className="p-4 xl:p-6 lg:p-8">
          <div className="flex flex-col lg:flex-row items-start gap-6">
            <div className="relative aspect-video lg:aspect-square w-full lg:w-36 overflow-hidden rounded-lg bg-gray-700 shadow-inner">
              <Skeleton className="h-full w-full" />
            </div>
            <div className="flex-1 space-y-4 w-full">
              <Skeleton className="h-8 w-3/4" />
              <div className="flex items-center">
                <Skeleton className="h-4 w-4 mr-2" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center space-x-3 pt-2 xl:pt-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute top-4 right-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-full"
            disabled
          >
            <span className="sr-only">Delete space</span>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
