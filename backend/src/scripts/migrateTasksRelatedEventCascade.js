require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://uvonrgvmptmkgpvqnooa.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function showMigrationSQL() {
  try {
    console.log("\n🔄 Migrating tasks.related_event to ON DELETE CASCADE...");

    const migrationSQL = `
-- Drop existing FK and recreate with ON DELETE CASCADE
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_related_event_fkey;
ALTER TABLE tasks
  ADD CONSTRAINT tasks_related_event_fkey
  FOREIGN KEY (related_event)
  REFERENCES events(id)
  ON DELETE CASCADE;
`;

    console.log("\n📋 SQL Migration to be executed:");
    console.log("=====================================");
    console.log(migrationSQL);
    console.log("=====================================\n");

    console.log("💡 To update the constraint in Supabase:");
    console.log("1. Open Supabase dashboard");
    console.log("2. Go to SQL Editor");
    console.log("3. Paste the above SQL");
    console.log("4. Click 'Run'\n");

    console.log(
      "⚠️  Note: Existing tasks linked to an event will be deleted when that event is deleted."
    );

    return true;
  } catch (error) {
    console.error("❌ Error preparing migration:", error);
    return false;
  }
}

async function testConnection() {
  try {
    const { error } = await supabase.from("events").select("count").limit(1);
    if (error && error.code !== "PGRST116") throw error;
    console.log("✅ Connected to Supabase successfully");
    return true;
  } catch (error) {
    console.error("❌ Failed to connect to Supabase:", error.message);
    return false;
  }
}

async function main() {
  console.log("🚀 Tasks related_event Cascade Migration");
  console.log("====================================");

  const ok = await testConnection();
  if (!ok) {
    console.log("Showing migration SQL for manual execution:");
    await showMigrationSQL();
    return;
  }

  await showMigrationSQL();
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { showMigrationSQL };
