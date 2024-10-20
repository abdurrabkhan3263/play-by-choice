// export function oauthSignIn() {
//   // const clientId = process.env.GOOGLE_CLIENT_ID;
//   const clientId =
//     "708913427895-gl5bhe3jejdqhvi9ahkn8rea93v3fcdj.apps.googleusercontent.com";
//   const redirectUri = "http://localhost:3000/api/new-auth";
//   const scope = "https://www.googleapis.com/auth/youtube.readonly";
//   const responseType = "token";
//   const includeGrantedScopes = "true";
//   const state = "pass-through value";

export async function getVideoInfo(videoId: string) {
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails,statistics&id=${videoId}&access_token=ya29.a0AcM612xkxAnLUkRis7xe_wmX-dPQHJ3fqamU17TgkiNvItC1dLRdUS4kD9vhFbB3QdYRyVl27XLbtDyMsIjPZQFkhjzH3ZQH7q-Yjp_IPjqpYXuuZ1OftrNKt0OhoanFTtgOD9cL7BNY1SdVEUV3RbMirBHkcrinwE0Ja5wSaCgYKAWMSARESFQHGX2MirJPYS8kldSbS6XcuobEL5A0175`
    );
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching video info:", error);
    throw error;
  }
}
