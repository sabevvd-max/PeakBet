import { createClient } from "@/lib/supabase/server";

/** Resolves the authenticated Supabase user for a Route Handler, or null. */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}
