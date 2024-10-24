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
