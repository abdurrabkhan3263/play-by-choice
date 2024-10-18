"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession, Session } from "next-auth";

export async function fetchSpotifyWebApi({
  endpoint,
  method,
  body,
}: {
  endpoint: string;
  method: string;
  body?: [];
}) {
  try {
    const token = (await getServerSession(authOptions)) as Session & {
      accessToken?: string;
    };

    if (!token.user.accessToken) {
      return { error: "No access token" };
    }
    const res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers: {
        Authorization: `Bearer ${token?.user.accessToken}`,
      },
      method,
      body: JSON.stringify(body),
    });
    return await res.json();
  } catch (error) {
    throw new Error(error as string);
  }
}
