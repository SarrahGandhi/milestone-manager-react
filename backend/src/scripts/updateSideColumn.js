const { supabase } = require("../config/database");

async function updateSideColumn() {
  try {
    console.log("🔄 Updating side column values...");

    // Update users table - change bride_side to bride and groom_side to groom
    console.log("Updating users table...");
    const { error: usersError } = await supabase.rpc("exec_sql", {
      sql_statement: `
        UPDATE users 
        SET side = CASE 
          WHEN side = 'bride_side' THEN 'bride'
          WHEN side = 'groom_side' THEN 'groom'
          ELSE side
        END
        WHERE side IN ('bride_side', 'groom_side');
      `,
    });

    if (usersError) {
      console.error("Error updating users table:", usersError);
    } else {
      console.log("✅ Users table updated successfully");
    }

    // Update events table - change bride_side to bride and groom_side to groom
    console.log("Updating events table...");
    const { error: eventsError } = await supabase.rpc("exec_sql", {
      sql_statement: `
        UPDATE events 
        SET side = CASE 
          WHEN side = 'bride_side' THEN 'bride'
          WHEN side = 'groom_side' THEN 'groom'
          ELSE side
        END
        WHERE side IN ('bride_side', 'groom_side');
      `,
    });

    if (eventsError) {
      console.error("Error updating events table:", eventsError);
    } else {
      console.log("✅ Events table updated successfully");
    }

    // Update the table constraints to use the new values
    console.log("Updating table constraints...");

    // Drop old constraints and add new ones for users table
    const { error: constraintError1 } = await supabase.rpc("exec_sql", {
      sql_statement: `
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_side_check;
        ALTER TABLE users ADD CONSTRAINT users_side_check CHECK (side IN ('bride', 'groom'));
      `,
    });

    if (constraintError1) {
      console.log("⚠️  Note about users constraint:", constraintError1.message);
    } else {
      console.log("✅ Users table constraints updated");
    }

    // Drop old constraints and add new ones for events table
    const { error: constraintError2 } = await supabase.rpc("exec_sql", {
      sql_statement: `
        ALTER TABLE events DROP CONSTRAINT IF EXISTS events_side_check;
        ALTER TABLE events ADD CONSTRAINT events_side_check CHECK (side IN ('bride', 'groom', 'both'));
      `,
    });

    if (constraintError2) {
      console.log(
        "⚠️  Note about events constraint:",
        constraintError2.message
      );
    } else {
      console.log("✅ Events table constraints updated");
    }

    console.log("✅ Side column migration completed successfully!");
    console.log("\n📝 Summary:");
    console.log("- Updated existing 'bride_side' values to 'bride'");
    console.log("- Updated existing 'groom_side' values to 'groom'");
    console.log("- Updated database constraints to use new values");
  } catch (error) {
    console.error("❌ Error updating side column:", error);
    console.log("\n💡 Alternative approach:");
    console.log("1. Go to your Supabase dashboard > SQL Editor");
    console.log("2. Run the following SQL commands:");
    console.log(`
-- Update users table
UPDATE users 
SET side = CASE 
  WHEN side = 'bride_side' THEN 'bride'
  WHEN side = 'groom_side' THEN 'groom'
  ELSE side
END
WHERE side IN ('bride_side', 'groom_side');

-- Update events table
UPDATE events 
SET side = CASE 
  WHEN side = 'bride_side' THEN 'bride'
  WHEN side = 'groom_side' THEN 'groom'
  ELSE side
END
WHERE side IN ('bride_side', 'groom_side');

-- Update constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_side_check;
ALTER TABLE users ADD CONSTRAINT users_side_check CHECK (side IN ('bride', 'groom'));

ALTER TABLE events DROP CONSTRAINT IF EXISTS events_side_check;
ALTER TABLE events ADD CONSTRAINT events_side_check CHECK (side IN ('bride', 'groom', 'both'));
    `);
  }
}

// Allow this script to be run directly
if (require.main === module) {
  updateSideColumn()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Migration failed:", error);
      process.exit(1);
    });
}

module.exports = { updateSideColumn };
