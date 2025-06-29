import { supabase } from "@/lib/supabase/client";

export async function updateAiUsage(senderId: string) {
  try {
    const { data, error: fetchError } = await supabase
      .from("usage")
      .select("aiRequests")
      .eq("userId", senderId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return;
    }

    const newCount = (data?.aiRequests || 0) + 1;

    const { error: updateError } = await supabase
      .from("usage")
      .update({ aiRequests: newCount })
      .eq("userId", senderId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    return "record updated";
  } catch (error) {
    console.error("Error saving template and updating usage:", error);
  }
}
