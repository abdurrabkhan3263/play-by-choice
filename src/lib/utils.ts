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

export function timeAgo(date: Date) {
  const now = new Date();
  date = new Date(date);
  const secondsPast = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (secondsPast < 60) {
    return `${secondsPast} seconds ago`;
  }
  const minutesPast = Math.floor(secondsPast / 60);
  if (minutesPast < 60) {
    return `${minutesPast} minutes ago`;
  }
  const hoursPast = Math.floor(minutesPast / 60);
  if (hoursPast < 24) {
    return `${hoursPast} hours ago`;
  }
  const daysPast = Math.floor(hoursPast / 24);
  if (daysPast < 30) {
    return `${daysPast} days ago`;
  }
  const monthsPast = Math.floor(daysPast / 30);
  if (monthsPast < 12) {
    return `${monthsPast} months ago`;
  }
  const yearsPast = Math.floor(monthsPast / 12);
  return `${yearsPast} years ago`;
}

export function dateFormat(data: Date) {
  const formatedDate = new Date(data).toLocaleDateString("en-IN", {
    timeZone: "UTC",
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
  return formatedDate;
}
