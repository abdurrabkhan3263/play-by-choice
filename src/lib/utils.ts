import { StreamItemType, StreamType } from "@/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface getStreamTypeReturn {
  platform: StreamType;
  type?: StreamItemType;
  id: string;
}

export function getStreamType(url: string): getStreamTypeReturn | any {
  const spotifyRegex = /spotify/i;
  const youtubeRegex = /youtube/i;
  const youtubePhoneRegex = /youtu\.be/i;
  const streamUrl = new URL(url);

  if (spotifyRegex.test(url)) {
    try {
      url = url.trim();

      const match = url.match(
        /spotify\.com\/(track|album|playlist)\/([A-Za-z0-9]+)/
      );

      if (match) {
        return {
          platform: "spotify",
          type: match[1] as StreamItemType,
          id: match[2],
        };
      }

      return {
        error: "Invalid Spotify URL format",
      };
    } catch (error) {
      return {
        error: "Failed to process URL",
        details: error instanceof Error ? error.message : "Unknown error",
      };
    }
  } else if (youtubeRegex.test(url)) {
    const extractedId = streamUrl.searchParams.get("v");
    return {
      platform: "youtube",
      id: extractedId ?? "",
    };
  } else if (youtubePhoneRegex.test(url)) {
    const match = url?.match(/youtu\.be\/([A-Za-z0-9-_]+)/);
    const extractedId = match ? match[1] : null;
    return {
      platform: "youtube",
      id: extractedId ?? "",
    };
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

export const sortStream = (listStream: any[]) => {
  if (!listStream || listStream.length === 0) return [];

  const result = [...listStream];
  const priorityIndex = listStream[0].active ? 0 : -1;

  if (priorityIndex !== -1) {
    const priorityItem = result.splice(priorityIndex, 1)[0];
    result.sort((a, b) => b.Upvote.length - a.Upvote.length);
    result.unshift(priorityItem);
  } else {
    result.sort((a, b) => b.Upvote.length - a.Upvote.length);
  }
  return result;
};

export const userStreamCount = (listStream: any[], currentUserId: string) => {
  const count = listStream.reduce((acc: Record<string, number>, current) => {
    const userId: string = current?.userId ?? "unknown";
    acc[userId] = (acc[userId] ?? 0) + 1;
    return acc;
  }, {});

  return count[currentUserId] ?? 0;
};

export const totalNumberOfStreams = (listStream: any[]) => {
  const count = listStream.reduce((acc, s) => {
    if (s.itemType !== "track" && s.listSongs) {
      return acc + s.listSongs.length;
    }
    return acc + 1;
  }, 0);

  return count;
};
