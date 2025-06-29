import { supabase } from "@/lib/supabase/client";

type Action = "Increase" | "Decrease";

export async function updateTemplateUsage(senderId: string, action: Action) {
  try {
    const { data, error: fetchError } = await supabase
      .from("usage")
      .select("templatesSaved")
      .eq("userId", senderId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError);
      return;
    }

    const newCount =
      action === "Increase"
        ? (data?.templatesSaved || 0) + 1
        : (data?.templatesSaved || 0) - 1;

    const { error: updateError } = await supabase
      .from("usage")
      .update({ templatesSaved: newCount })
      .eq("userId", senderId);

    if (updateError) {
      console.error("Update error:", updateError);
    }

    return "record updated";
  } catch (error) {
    console.error("Error saving template and updating usage:", error);
  }
}
