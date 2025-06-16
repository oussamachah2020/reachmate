// lib/auth.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export interface AuthenticatedRequest extends NextRequest {
  user: any;
  userId: string;
}

type AuthenticatedHandler = (
  req: AuthenticatedRequest
) => Promise<NextResponse> | NextResponse;

export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest) => {
    try {
      const cookieStore = await cookies();

      const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_ANON_TOKEN!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value;
            },
            set(name: string, value: string, options: any) {
              // This is needed for server-side auth to work properly
              cookieStore.set(name, value, options);
            },
            remove(name: string, options: any) {
              cookieStore.set(name, "", { ...options, maxAge: 0 });
            },
          },
        }
      );

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      console.log("User:", user);
      console.log("Error:", error);

      if (error || !user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      // Extend request with user data
      const authReq = req as AuthenticatedRequest;
      authReq.user = user;
      authReq.userId = user.id;

      return handler(authReq);
    } catch (error) {
      console.error("Auth error:", error);
      return NextResponse.json(
        { error: "Authentication failed" },
        { status: 500 }
      );
    }
  };
}
