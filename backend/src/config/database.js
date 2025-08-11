const { createClient } = require("@supabase/supabase-js");

// Supabase configuration
const supabaseUrl =
  process.env.SUPABASE_URL || "https://uvonrgvmptmkgpvqnooa.supabase.co";
const supabaseKey = process.env.SUPABASE_ANON_KEY; // You'll need to get this from your Supabase dashboard

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
