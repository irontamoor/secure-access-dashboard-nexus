// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://sjsrbuhchekxcpvjvsha.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNqc3JidWhjaGVreGNwdmp2c2hhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk4NTYyOTEsImV4cCI6MjA2NTQzMjI5MX0.NDdPXeRDvXYsmVPWBolvIkxLmTnYhqI8-t7N5RSfsnw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);