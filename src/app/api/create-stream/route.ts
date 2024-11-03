import { NextResponse } from "next/server";
import { CreateStream } from "@/lib/createStream";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { streamUrl, stream, spaceId } = body;

    const data = await CreateStream({ streamUrl, stream, spaceId });

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Something went wrong.",
      },
      { status: 500 }
    );
  }
}
