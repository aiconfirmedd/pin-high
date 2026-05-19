import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://mzrcsgympluneeodssrk.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_tfp6IZ2buUA5vAAJM5nZKg_4WJvUbej";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const OWNER_EMAIL = "aiconfirmedd@gmail.com";
