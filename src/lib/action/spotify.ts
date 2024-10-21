"use server";

import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession, Session } from "next-auth";
import SpotifyWebApi from "spotify-web-api-node";
import { JWT } from "next-auth/jwt";

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

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: "http://localhost:3000/api/auth/callback/spotify",
});

async function initializeSpotifyToken() {
  const session = await getServerSession(authOptions);
  if (session?.user?.accessToken) {
    spotifyApi.setAccessToken(session.user.accessToken);
    if (session.user.refreshToken) {
      spotifyApi.setRefreshToken(session.user.refreshToken);
    }
  }
}

export async function getTrack(trackId: string) {
  await initializeSpotifyToken();
  try {
    const data = await spotifyApi.getTrack(trackId);
    return data.body;
  } catch (error) {
    console.error("Error fetching track:", error);
    throw error;
  }
}

export async function getAlbum(albumId: string) {
  await initializeSpotifyToken();
  try {
    const data = await spotifyApi.getAlbum(albumId);
    return data.body;
  } catch (error) {
    console.error("Error fetching album:", error);
    throw error;
  }
}

export async function getPlaylist(playlistId: string) {
  await initializeSpotifyToken();
  try {
    const data = await spotifyApi.getPlaylist(playlistId);
    return data.body;
  } catch (error) {
    console.error("Error fetching album:", error);
    throw error;
  }
}

export async function playNextTrack() {
  await initializeSpotifyToken();
  try {
    const data = await spotifyApi.skipToNext();
    return data.body;
  } catch (error) {
    console.error("Error playing next track:", error);
    throw error;
  }
}

export async function playNewTrack({
  trackUri,
  deviceId,
}: {
  trackUri: string;
  deviceId: string;
}) {
  await initializeSpotifyToken();
  try {
    const data = await spotifyApi.play({
      uris: [trackUri],
      device_id: deviceId,
    });
    return data.body;
  } catch (error) {
    console.error("Error playing track:", error);
    throw error;
  }
}

export async function refreshAccessToken(token: JWT) {
  try {
    const url = `https://accounts.spotify.com/api/token`;
    const basicAuth = Buffer.from(
      `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
    ).toString("base64");

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken as string,
      }),
    });

    const refreshedTokens = await response.json();
    if (!response.ok) {
      throw refreshAccessToken;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken,
    };
  } catch (error) {
    console.error("Error refreshing access token:", error);
    return { ...token, error: "RefreshAccessTokenError" };
  }
}
