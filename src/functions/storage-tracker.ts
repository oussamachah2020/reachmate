import { supabase } from "@/lib/supabase/client";

export async function updateStorageUsage(senderId: string, size: number) {
  try {
    // Fetch current totalStorageUsed
    const { data, error: fetchError } = await supabase
      .from("usage")
      .select("totalStorageUsed")
      .eq("userId", senderId)
      .single();

    if (fetchError) {
      console.error("Fetch error:", fetchError.message);
      return;
    }

    const newSize = (data?.totalStorageUsed || 0) + size;

    const { error: updateError } = await supabase
      .from("usage")
      .update({ totalStorageUsed: newSize })
      .eq("userId", senderId);

    if (updateError) {
      console.error("Update error:", updateError.message);
      return;
    }

    return "record updated";
  } catch (error) {
    console.error("Error storing attachment and updating usage:", error);
  }
}
