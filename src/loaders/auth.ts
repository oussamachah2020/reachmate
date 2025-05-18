import { supabase } from "@/lib/supabase";
import { LoginDto, RegisterDto } from "@/types/auth";

async function signUpUser(data: RegisterDto) {
  try {
    const { data: signUpData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.fullName,
        },
      },
    });

    if (error) {
      return { error };
    }

    return { user: signUpData?.user };
  } catch (error) {
    return { error };
  }
}

async function verifyEmail(token: string) {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: "email", // Type can be 'signup', 'recovery', etc.
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

    return { success: true, data: signInData };
  } catch (error) {
    return { error };
  }
}

async function requestPasswordResetEmail(email: string) {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "http://localhost:3000/reset-password",
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
};
