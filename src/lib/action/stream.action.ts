import { CreateStreamType } from "@/types";

export async function updateStream({
  spaceId,
  stream,
}: {
  spaceId: string;
  stream: CreateStreamType;
}) {
  try {
    const newStream = await fetch(`/api/space/more/${spaceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        stream: stream,
      }),
    });
    if (!newStream.ok) {
      throw new Error("Failed to update stream");
    }
    const res = await newStream.json();
    return res;
  } catch (error) {
    throw new Error(error);
  }
}
