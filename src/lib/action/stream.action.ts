"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { CreateStreamType } from "@/types";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    return session?.user;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to get current user"
    );
  }
}

export async function updateStream({
  spaceId,
  stream,
}: {
  spaceId: string;
  stream: CreateStreamType[];
}) {
  try {
    const newStream = await fetch(`${baseUrl}/api/space/more/${spaceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream: stream,
      }),
    });
    const res = await newStream.json();

    if (!newStream.ok) {
      throw new Error(res?.message ?? "Failed to update stream");
    }
    revalidatePath(`/dashboard/space/${spaceId}`);
    return res;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to update stream"
    );
  }
}

export async function deleteStream({
  streamId,
  spaceId,
}: {
  streamId: string;
  spaceId: string;
}) {
  if (!streamId) {
    throw new Error("No stream id provided");
  }

  try {
    const res = await fetch(`${baseUrl}/api/stream/${streamId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete stream");
    }
    revalidatePath(`/dashboard/space/${spaceId}`);
    return await res.json();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : String(error) ?? "Failed to delete stream"
    );
  }
}

export async function toggleUpVote({
  streamId,
  isUpVoted,
}: {
  streamId: string;
  isUpVoted: boolean;
}) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/sign-in");
  }
  try {
    const res = await fetch(`${baseUrl}/api/upvote/${streamId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: currentUser, isUpVoted }),
    });
    if (!res.ok) {
      throw new Error("Failed to upvote stream");
    }
    return await res.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to upvote stream"
    );
  }
}

export async function getCurrentStream({ spaceId }: { spaceId: string }) {
  try {
    const res = await fetch(`${baseUrl}/api/current-stream/${spaceId}`, {
      method: "GET",
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData?.message ?? "Failed to get current stream");
    }
    return resData;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : "Something went when getting the current stream"
    );
  }
}

export async function addCurrentStream({
  spaceId,
  streamId,
  currentStreamId,
}: {
  spaceId: string;
  streamId: string;
  currentStreamId: string;
}) {
  try {
    const res = await fetch(`${baseUrl}/api/current-stream/${spaceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ streamId, currentStreamId }),
    });
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData?.message ?? "Failed to add current stream");
    }
    revalidatePath(`/dashboard/space/${spaceId}`);
    return resData;
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to add current stream"
    );
  }
}

export async function playAgainStream({
  spaceId,
  allPlayed,
}: {
  spaceId: string;
  allPlayed: boolean;
}) {
  try {
    const res = await fetch(`${baseUrl}/api/current-stream/${spaceId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ allPlayed }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(
        errorData.message ||
          `Failed to play again stream: ${res.status} ${res.statusText}`
      );
    }

    revalidatePath(`/dashboard/space/${spaceId}`);
    return await res.json();
  } catch (error) {
    // Instead of throwing an error, return an error response
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
