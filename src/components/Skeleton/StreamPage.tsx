import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

function StreamPage() {
  return (
    <>
      <div className="col-span-1 bg-gradient-to-br flex flex-col overflow-hidden gap-4 from-gray-800 to-gray-900 md:col-span-2 lg:col-span-3 xl:col-span-4 rounded-xl p-4">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <Skeleton className="w-10 h-10 rounded-full" />
            <Skeleton className="w-12 h-12" />
          </div>
        </div>
        <div className="flex flex-row lg:flex-col flex-wrap lg:flex-nowrap gap-6 flex-1 overflow-y-auto custom_scroll">
          {/* {Array.isArray(listStream) && listStream.length > 0 ? (
            listStream.map((stream: StreamTypeApi) => {
              const role =
                streamList.createdBy.email === data?.user.email
                  ? "Owner"
                  : stream.user.email === data?.user.email
                  ? "Creator"
                  : "Member";

              return (
                <StreamCard
                  key={stream.id}
                  stream={stream}
                  currentStream={streamList.CurrentStream[0]}
                  role={role}
                  setStream={setListStream}
                />
              );
            })
          ) : (
            <p>No Stream Available</p>
          )} */}
          <Skeleton className="w-full h-20" />
        </div>
      </div>
      <div className="col-span-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-4">
        <h1 className="text-2xl font-semibold">Add New Stream</h1>
        <div className="mt-3 flex flex-col gap-4">
          <Skeleton className="w-full h-10" />
          <Skeleton className="w-full h-10" />
        </div>
      </div>
    </>
  );
}

export default StreamPage;
