import { createClient } from "@supabase/supabase-js";

const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabase_token = process.env.NEXT_PUBLIC_SUPABASE_ANON_TOKEN!;

const supabase = createClient(supabase_url, supabase_token);



export { supabase };
