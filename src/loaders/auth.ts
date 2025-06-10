import { supabase } from "@/lib/supabase/client";
import { LoginDto, RegisterDto } from "@/types/auth";
import { useAuthStore } from "@/zustand/auth.store";
import { Gender } from "@prisma/client";
import { Session, User } from "@supabase/supabase-js";

async function signUpUser(data: RegisterDto) {
  try {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        emailRedirectTo: "https://reachmate.xyz/confirmation",
        data: {
          username: `${data.firstName} ${data.lastName}`,
        },
      },
    });

    if (error) {
      return { error };
    }

    await supabase.from("sender").insert({
      id: signUpData.user?.id,
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      gender: Gender.MALE,
    });

    return { user: signUpData?.user };
  } catch (error) {
    return { error };
  }
}

async function signInWithLinkedIn() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "linkedin_oidc",
      options: {
        redirectTo: "httpS://reachmate.xyz/confirmation",
      },
    });

    if (error) {
      return {
        success: false,
        data: error.message,
      };
    }

    return { success: true, data };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      data: err,
    };
  }
}

async function verifyEmail(token: string, type: any) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) {
      return {
        success: false,
        data: error,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    return {
      success: false,
      data: error,
    };
  }
}

async function signInUser(data: LoginDto) {
  try {
    const { data: signInData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, data: error.message };
    }

    useAuthStore.setState(() => ({ session: signInData.session }));
    useAuthStore.setState(() => ({ user: signInData.user }));

    return {
      success: true,
      data: signInData as { user: User; session: Session },
    };
  } catch (error) {
    return { error };
  }
}

async function requestPasswordResetEmail(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "https://reachmate.xyz/reset-password",
    });

    if (error) {
      console.error("Supabase Password Reset Request Error:", error);
      throw new Error(error.message); // Forward error to UI
    }

    return data;
  } catch (error) {
    console.error("Network/Unknown Error:", error);
    throw new Error(
      "Failed to connect to the server. Check your internet connection."
    );
  }
}

async function updateUserPassword(password: string) {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      console.error("Supabase Password update error:", error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Network/Unknown Error:", error);
    throw new Error(
      "Failed to connect to the server. Check your internet connection."
    );
  }
}

export {
  signUpUser,
  signInUser,
  verifyEmail,
  requestPasswordResetEmail,
  updateUserPassword,
  signInWithLinkedIn,
};
