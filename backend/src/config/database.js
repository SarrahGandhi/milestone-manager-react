const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

// Supabase configuration
const supabaseUrl =
  process.env.SUPABASE_URL || "https://uvonrgvmptmkgpvqnooa.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Validate required environment variables
if (!supabaseKey) {
  console.error("❌ FATAL ERROR: SUPABASE_ANON_KEY is not set in environment variables!");
  console.error("Please set the following environment variables:");
  console.error("  - SUPABASE_ANON_KEY: Your Supabase anonymous key");
  console.error("  - SUPABASE_URL: Your Supabase project URL (optional, has default)");
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Test database connection
const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);

    if (error && error.code !== "PGRST116") {
      // PGRST116 means table doesn't exist yet, which is okay
      console.error("❌ Supabase connection error:", error);
      return false;
    }

    console.log("✅ Connected to Supabase successfully");
    return true;
  } catch (err) {
    console.error("❌ Supabase connection error:", err);
    return false;
  }
};

module.exports = {
  supabase,
  testConnection,
};
