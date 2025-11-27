import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://owzurrliqvelrrdzzwpm.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93enVycmxpcXZlbHJyZHp6d3BtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM0NjE3MTEsImV4cCI6MjA3OTAzNzcxMX0.Qyh2b7lmRRzRtvLxPJ0Jv79n1-IVSl6ImAh0RyAlNIk";

export const supabase = createClient(supabaseUrl, supabaseKey);
