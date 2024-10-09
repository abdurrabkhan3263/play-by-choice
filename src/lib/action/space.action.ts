"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { CreateStreamType } from "@/types";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

export async function createStream({
  data,
  stream,
}: {
  data: { spaceName: string };
  stream: CreateStreamType[];
}) {
  try {
    const currentUser = await getServerSession(authOptions);
    const host = headers().get("host");
    const protocol = process?.env.NODE_ENV === "development" ? "http" : "https";
    const addStream = await fetch(`${protocol}://${host}/api/space`, {
      method: "POST",
      body: JSON.stringify({
        spaceName: data.spaceName,
        streams: stream,
        email: currentUser?.user?.email,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log("Add Stream", addStream);
    const res = await addStream.json();
    if (addStream.status >= 400) {
      throw new Error(res.message);
    }
    console.log("Response", res);
    return res;
  } catch (error) {
    console.log("Error is:- ", error);
  } finally {
    revalidatePath("/dashboard");
  }
}
