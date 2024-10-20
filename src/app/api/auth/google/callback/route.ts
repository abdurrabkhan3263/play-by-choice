import { OAuth2Client } from "google-auth-library";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const oAuth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
  );

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "No code provided" }, { status: 400 });
  }

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);

    const url = "https://www.googleapis.com/auth/youtube.readonly";
    const res = await oAuth2Client.request({ url });

    const tokenInfo = await oAuth2Client.getTokenInfo(
      tokens.access_token as string
    );
    console.log(tokenInfo);

    // Create the response first
    const response = NextResponse.redirect(new URL("/dashboard", request.url));

    // Then set the cookie
    response.cookies.set("user", JSON.stringify(res.data), {
      httpOnly: true,
      secure: true,
    });

    // Return the response
    return response;
  } catch (error) {
    console.error("Error during OAuth flow:", error);
    return NextResponse.json(
      { error: "Authentication failed" },
      { status: 500 }
    );
  }
}
