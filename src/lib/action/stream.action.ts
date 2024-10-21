"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { CreateStreamType } from "@/types";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
  stream: CreateStreamType;
}) {
  try {
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const newStream = await fetch(
      `${protocol}://${host}/api/space/more/${spaceId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          stream: stream,
        }),
      }
    );
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
  const host = headers().get("host");
  const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";

  try {
    const res = await fetch(`${protocol}://${host}/api/stream/${streamId}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      throw new Error("Failed to delete stream");
    }
    revalidatePath(`/dashboard/stream/${spaceId}`);
    return await res.json();
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message
        : String(error) ?? "Failed to delete stream"
    );
  }
}

export async function upVoteStream({ streamId }: { streamId: string }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/sign-in");
  }
  const host = headers().get("host");
  const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
  try {
    const res = await fetch(`${protocol}://${host}/api/upvote/${streamId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: currentUser }),
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

export async function deleteUpVoteStream({ streamId }: { streamId: string }) {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    redirect("/sign-in");
  }
  const host = headers().get("host");
  const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
  try {
    const res = await fetch(`${protocol}://${host}/api/upvote/${streamId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ user: currentUser }),
    });
    if (!res.ok) {
      throw new Error("Failed to delete upvote");
    }
    return await res.json();
  } catch (error) {
    throw new Error(
      error instanceof Error ? error.message : "Failed to delete upvote"
    );
  }
}

export async function getCurrentStream({ spaceId }: { spaceId: string }) {
  try {
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(
      `${protocol}://${host}/api/current-stream/${spaceId}`,
      {
        method: "GET",
      }
    );
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData?.message ?? "Failed to get current stream");
    }
    return resData?.data;
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
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const res = await fetch(
      `${protocol}://${host}/api/current-stream/${spaceId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ streamId, currentStreamId }),
      }
    );
    const resData = await res.json();
    if (!res.ok) {
      throw new Error(resData?.message ?? "Failed to add current stream");
    }
    revalidatePath(`/dashboard/space/${spaceId}`);
    return resData;
  } catch (error) {
    console.error("Something went wrong while adding current stream", error);
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
    const headersList = headers();
    const host = headersList.get("host");
    const protocol = process.env.NODE_ENV === "development" ? "http" : "https";

    if (!host) {
      throw new Error("Host header is missing");
    }

    const res = await fetch(
      `${protocol}://${host}/api/current-stream/${spaceId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ allPlayed }),
      }
    );

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
    console.error("Error while playing again stream:", error);

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
