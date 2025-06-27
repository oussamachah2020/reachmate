import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

const prisma = new PrismaClient();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseToken = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!;

export async function GET(request: Request) {
  try {
    const supabase = createServerComponentClient(
      { cookies },
      { supabaseKey: supabaseToken, supabaseUrl },
    );
    const {
      data: { user: supabaseUser },
    } = await supabase.auth.getUser();

    console.log(supabaseUser);

    if (!supabaseUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const sender = await prisma.sender.findUnique({
      where: { id: supabaseUser.id },
      include: {
        UserPlan: true,
        Usage: true,
      },
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender data not found for this user." },
        { status: 404 },
      );
    }

    // Prepare the response data, aligning with your Zustand store's expectations
    // Note: Prisma BigInt types are converted to numbers here.
    const responseData = {
      senderData: {
        id: sender.id,
        firstName: sender.firstName,
        lastName: sender.lastName,
        email: sender.email,
        avatar: sender.avatar,
        isAnonymous: sender.isAnonymous,
      },
      planData: sender.UserPlan
        ? {
            ...sender.UserPlan,
            maxStorageUsed: Number(sender.UserPlan.maxStorageUsed), // Ensure BigInt is number
          }
        : null,
      usageData: sender.Usage
        ? {
            ...sender.Usage,
            totalStorageUsed: Number(sender.Usage.totalStorageUsed), // Ensure BigInt is number
          }
        : null,
      supabaseUser: supabaseUser, // Pass the full Supabase user object
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
