require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://uvonrgvmptmkgpvqnooa.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function migrateDailyMenuConstraint() {
  try {
    console.log("🔄 Migrating daily_menus table constraint...");

    // SQL commands to update the table constraint
    const migrationSQL = `
-- Drop the old unique constraint on (menu_date, event_id)
ALTER TABLE daily_menus DROP CONSTRAINT IF EXISTS daily_menus_menu_date_event_id_key;

-- Add new unique constraint on just menu_date
ALTER TABLE daily_menus ADD CONSTRAINT daily_menus_menu_date_unique UNIQUE (menu_date);
    `;

    console.log("📋 SQL Migration to be executed:");
    console.log("=====================================");
    console.log(migrationSQL);
    console.log("=====================================");

    console.log("\n💡 To update the constraint in Supabase:");
    console.log("1. Go to your Supabase dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Copy and paste the above SQL migration");
    console.log("4. Click 'Run' to execute");
    console.log("\n⚠️  WARNING: This will prevent multiple menus per date.");
    console.log(
      "   If you have existing duplicate dates, you may need to merge or delete them first."
    );

    return true;
  } catch (error) {
    console.error("❌ Error preparing migration:", error);
    return false;
  }
}

async function checkForDuplicates() {
  try {
    console.log("\n🔍 Checking for existing duplicate dates...");

    // Check if there are any duplicate menu_date entries
    const { data, error } = await supabase.rpc("check_duplicate_menu_dates", {
      query: `
        SELECT menu_date, COUNT(*) as count 
        FROM daily_menus 
        GROUP BY menu_date 
        HAVING COUNT(*) > 1
        ORDER BY menu_date
      `,
    });

    if (error) {
      console.log(
        "⚠️  Cannot check for duplicates via RPC. Please check manually:"
      );
      console.log("   Run this query in your Supabase SQL editor:");
      console.log(
        "   SELECT menu_date, COUNT(*) as count FROM daily_menus GROUP BY menu_date HAVING COUNT(*) > 1;"
      );
      return true;
    }

    if (data && data.length > 0) {
      console.log("❌ Found duplicate dates that need to be resolved:");
      data.forEach((row) => {
        console.log(`   - ${row.menu_date}: ${row.count} menus`);
      });
      console.log(
        "\n⚠️  Please resolve these duplicates before running the migration."
      );
      return false;
    } else {
      console.log(
        "✅ No duplicate dates found. Safe to proceed with migration."
      );
      return true;
    }
  } catch (error) {
    console.log("⚠️  Error checking duplicates:", error.message);
    console.log("   Please manually check for duplicates before proceeding.");
    return true;
  }
}

async function main() {
  console.log("🚀 Daily Menu Constraint Migration");
  console.log("==================================");

  if (SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY_HERE") {
    console.log("⚠️  Please set your SUPABASE_ANON_KEY environment variable");
    console.log("   Showing migration SQL for manual execution:");
    await migrateDailyMenuConstraint();
    return;
  }

  // Test connection
  try {
    const { data, error } = await supabase
      .from("daily_menus")
      .select("count")
      .limit(1);
    if (error && error.code !== "PGRST116") {
      throw error;
    }
    console.log("✅ Connected to Supabase successfully");
  } catch (error) {
    console.error("❌ Failed to connect to Supabase:", error.message);
    console.log("   Showing migration SQL for manual execution:");
    await migrateDailyMenuConstraint();
    return;
  }

  // Check for duplicates first
  const safeToMigrate = await checkForDuplicates();

  if (!safeToMigrate) {
    console.log("\n❌ Migration halted due to duplicate dates.");
    console.log(
      "   Please resolve duplicates first, then run this script again."
    );
    return;
  }

  // Show migration SQL
  await migrateDailyMenuConstraint();
}

// Allow this script to be run directly
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration script failed:", error);
      process.exit(1);
    });
}

module.exports = { migrateDailyMenuConstraint, checkForDuplicates };
