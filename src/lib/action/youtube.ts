"use server";

import { JWT } from "next-auth/jwt";

export async function getVideoInfo(videoId: string, access_token: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&access_token=${access_token}`
    );
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? error.message || "Something went wrong while getting the video"
        : String(error) || "Something went wrong while getting the video"
    );
  }
}

export async function refreshGAccessToken({ token }: { token: JWT }) {
  const url = "https://oauth2.googleapis.com/token";

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = token?.refreshToken;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing required environment variables for Google OAuth");
  }

  const params = new URLSearchParams();
  params.append("client_id", clientId);
  params.append("client_secret", clientSecret);
  params.append("refresh_token", refreshToken);
  params.append("grant_type", "refresh_token");

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });
    const refToken = await response.json();
    return {
      ...token,
      accessToken: refToken.access_token,
      accessTokenExpires: Date.now() + refToken.expires_in * 1000,
      refreshToken: refToken.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    throw new Error("Could not refresh access token");
  }
}
