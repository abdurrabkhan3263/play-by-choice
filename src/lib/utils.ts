import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getStreamType(url: string) {
  const spotifyRegex = /spotify/i;
  const youtubeRegex = /youtube/i;

  if (spotifyRegex.test(url)) {
    return "Spotify";
  } else if (youtubeRegex.test(url)) {
    return "Youtube";
  }
  return "Unknown";
}

export async function fetchSpotifyWebApi({
  endpoint,
  method,
  body,
}: {
  endpoint: string;
  method: string;
  body?: [];
}) {
  const res = await fetch(`https://api.spotify.com/${endpoint}`, {
    headers: {
      Authorization: `Bearer ${process.env.SPOTIFY_TOKEN}`,
    },
    method,
    body: JSON.stringify(body),
  });
  return await res.json();
}
