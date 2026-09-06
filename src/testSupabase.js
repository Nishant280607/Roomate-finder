import { supabase } from "./lib/supabase";

async function testSupabase() {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  if (error) {
    console.error("Supabase connection failed:", error);
    return;
  }

  console.log("Supabase connected successfully:", data);
}

testSupabase();