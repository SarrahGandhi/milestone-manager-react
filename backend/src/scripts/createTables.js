const { supabase } = require("../config/database");
const fs = require("fs");
const path = require("path");

async function createTables() {
  try {
    console.log("🔄 Creating database tables...");

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, "../config/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    // Split the schema into individual statements
    const statements = schema
      .split(";")
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    // Execute each statement
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await supabase.from("_temp").select("1").limit(1); // Test connection
          console.log(`✅ Executing: ${statement.substring(0, 50)}...`);

          // Use RPC to execute raw SQL
          const { error } = await supabase.rpc("exec_sql", {
            sql_statement: statement + ";",
          });

          if (error) {
            console.log(`⚠️  Note: ${error.message}`);
            // Continue with other statements even if some fail (they might already exist)
          }
        } catch (err) {
          console.log(`⚠️  Note: ${err.message}`);
          // Continue with other statements
        }
      }
    }

    console.log("✅ Database tables creation completed!");
    console.log("\n📝 Next steps:");
    console.log("1. Make sure to set your SUPABASE_ANON_KEY in the .env file");
    console.log("2. Install dependencies: npm install");
    console.log("3. Start the server: npm run dev");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    console.log("\n💡 Alternative approach:");
    console.log("1. Copy the SQL from src/config/schema.sql");
    console.log("2. Go to your Supabase dashboard > SQL Editor");
    console.log("3. Paste and run the SQL directly");
  }
}

// Allow this script to be run directly
if (require.main === module) {
  createTables()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = { createTables };
