import SpotifyWebApi from "spotify-web-api-node";
import { JWT } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

export async function refreshAccessToken(token: JWT) {
  try {
    const url = `https://accounts.spotify.com/api/token`;
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization: `Basic ${Buffer.from(
          process.env.SPOTIFY_CLIENT_ID +
            ":" +
            process.env.SPOTIFY_CLIENT_SECRET
        ).toString("base64")}`,
      },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: token.refreshToken || "",
      }),
    });

    const refreshedTokens = await response.json();

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

// export default spotifyApi;

export class getSpotifyApi extends SpotifyWebApi {
  constructor() {
    super({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
      redirectUri: "http://localhost:3000/api/auth/callback/spotify",
    });
    getServerSession(authOptions)
      .then((session) => {
        this.setAccessToken(session?.user.accessToken as string);
        this.setRefreshToken(session?.user.refreshToken as string);
      })
      .catch((error) => {
        console.error("Error getting session", error);
      });
  }
}
