import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";

export async function GET() {
  const oAuth2Client = new OAuth2Client(
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET,
    `http://localhost:3000/api/auth/google/callback`
  );

  const authorizeUrl = oAuth2Client.generateAuthUrl({
    access_type: "offline",
    scope: "https://www.googleapis.com/auth/youtube.readonly",
    redirect_uri: `http://localhost:3000/api/auth/google/callback`,
  });

  return NextResponse.redirect(authorizeUrl);
}
