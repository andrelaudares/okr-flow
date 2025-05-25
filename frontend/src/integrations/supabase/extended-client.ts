
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

const SUPABASE_URL = "https://oprgeiuigudofncuofkk.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9wcmdlaXVpZ3Vkb2ZuY3VvZmtrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzNTMwMTksImV4cCI6MjA2MDkyOTAxOX0.k5zfsdFo303Vf8x1s6ZGK_GNbMrasjmm6asiS0KUWD8";

// This client has the extended types for our tables
export const extendedSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage
  }
});
