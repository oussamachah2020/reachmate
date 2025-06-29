import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

const prisma = new PrismaClient();

// Access your API key from environment variables
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req: Request) {
  try {
    const { prompt, senderId } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: "Prompt is required." },
        { status: 400 },
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedText = response.text();

    await prisma.usage.update({
      where: { userId: senderId },
      data: {
        aiRequests: { increment: 1 },
      },
    });

    return NextResponse.json({ text: generatedText });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return NextResponse.json({ error }, { status: 500 });
  }
}
