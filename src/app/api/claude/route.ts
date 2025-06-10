// app/api/claude/route.ts
import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const { message, temperature = 0.7 } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      temperature,
      messages: [
        {
          role: "user",
          content: message,
        },
      ],
    });

    return NextResponse.json({
      response: (response.content[0] as { text: string }).text,
    });
  } catch (error) {
    console.error("Claude API Error:", error);

    // Handle different types of errors
    if (error instanceof Error) {
      if (error.message.includes("rate_limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }
      if (error.message.includes("invalid_api_key")) {
        return NextResponse.json(
          { error: "Invalid API configuration" },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to generate template. Please try again." },
      { status: 500 }
    );
  }
}
