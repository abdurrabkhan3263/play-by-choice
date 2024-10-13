"use server";

import { CreateStreamType } from "@/types";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

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
