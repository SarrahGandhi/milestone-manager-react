require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");
const path = require("path");

const SUPABASE_URL =
  process.env.SUPABASE_URL || "https://uvonrgvmptmkgpvqnooa.supabase.co";
const SUPABASE_ANON_KEY =
  process.env.SUPABASE_ANON_KEY || "YOUR_SUPABASE_ANON_KEY_HERE";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTables() {
  try {
    console.log("🔄 Creating database tables...");

    // Read the SQL schema file
    const schemaPath = path.join(__dirname, "../config/schema.sql");
    const schema = fs.readFileSync(schemaPath, "utf8");

    console.log("📋 SQL Schema to be executed:");
    console.log("=====================================");
    console.log(schema);
    console.log("=====================================");

    console.log("\n💡 To create tables in Supabase:");
    console.log("1. Go to your Supabase dashboard");
    console.log("2. Navigate to SQL Editor");
    console.log("3. Copy and paste the above SQL schema");
    console.log("4. Click 'Run' to execute");

    return true;
  } catch (error) {
    console.error("❌ Error reading schema:", error);
    return false;
  }
}

async function seedData() {
  try {
    console.log("\n🌱 Seeding sample data...");

    // Create sample users
    const sampleUsers = [
      {
        username: "admin",
        email: "admin@milestonemanager.com",
        password:
          "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSQVyZpe", // password: admin123
        first_name: "Admin",
        last_name: "User",
        role: "admin",
        is_active: true,
      },
      {
        username: "john_doe",
        email: "john@example.com",
        password:
          "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSQVyZpe", // password: admin123
        first_name: "John",
        last_name: "Doe",
        role: "user",
        is_active: true,
      },
      {
        username: "jane_smith",
        email: "jane@example.com",
        password:
          "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSQVyZpe", // password: admin123
        first_name: "Jane",
        last_name: "Smith",
        role: "user",
        is_active: true,
      },
    ];

    console.log("👥 Inserting sample users...");
    const { data: users, error: usersError } = await supabase
      .from("users")
      .insert(sampleUsers)
      .select();

    if (usersError) {
      console.error("❌ Error inserting users:", usersError);
      return false;
    }

    console.log(`✅ Created ${users.length} users`);
    const adminUser = users.find((u) => u.role === "admin");
    const regularUser = users.find((u) => u.role === "user");

    // Create sample events
    const sampleEvents = [
      {
        title: "Wedding Ceremony",
        description: "The main wedding ceremony",
        event_date: "2024-06-15",
        start_time: "15:00",
        end_time: "16:00",
        location: "St. Mary's Church, 123 Main St",
        dress_code: "Formal",
        menu: ["Appetizers", "Main Course", "Dessert"],
        additional_details: "Please arrive 30 minutes early",
        category: "milestone",
        priority: "high",
        organizer: "Wedding Planner",
        status: "published",
        max_attendees: 150,
        registration_required: true,
        tags: ["wedding", "ceremony", "formal"],
        notes: "Photography will be taking place",
      },
      {
        title: "Wedding Reception",
        description: "Celebration dinner and dancing",
        event_date: "2024-06-15",
        start_time: "18:00",
        end_time: "23:00",
        location: "Grand Ballroom, Luxury Hotel",
        dress_code: "Cocktail",
        menu: ["Cocktail Hour", "Dinner", "Wedding Cake", "Open Bar"],
        additional_details: "Dancing and entertainment throughout the evening",
        category: "celebration",
        priority: "high",
        organizer: "Wedding Planner",
        status: "published",
        max_attendees: 150,
        registration_required: true,
        tags: ["wedding", "reception", "party"],
        notes: "Live band performance from 8-11 PM",
      },
      {
        title: "Rehearsal Dinner",
        description: "Pre-wedding dinner for close family and friends",
        event_date: "2024-06-14",
        start_time: "19:00",
        end_time: "22:00",
        location: "Private Dining Room, Italian Restaurant",
        dress_code: "Smart Casual",
        menu: ["Italian Cuisine", "Wine Pairing"],
        additional_details: "Intimate gathering for wedding party",
        category: "meeting",
        priority: "medium",
        organizer: "Bride & Groom",
        status: "published",
        max_attendees: 30,
        registration_required: false,
        tags: ["rehearsal", "dinner", "family"],
        notes: "Speeches and toasts welcome",
      },
    ];

    console.log("🎉 Inserting sample events...");
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .insert(sampleEvents)
      .select();

    if (eventsError) {
      console.error("❌ Error inserting events:", eventsError);
      return false;
    }

    console.log(`✅ Created ${events.length} events`);

    // Create sample tasks
    const sampleTasks = [
      {
        title: "Book Wedding Venue",
        description: "Research and book the perfect wedding venue",
        due_date: "2024-01-15T10:00:00Z",
        category: "Venue",
        priority: "high",
        completed: true,
        assigned_to: regularUser.id,
        estimated_time: 10.0,
        actual_time: 12.0,
        notes: "Visited 5 venues, chose the Grand Ballroom",
        tags: ["venue", "booking", "urgent"],
        completed_at: "2024-01-10T14:30:00Z",
        related_event: events[0].id,
        user_id: regularUser.id,
        created_by: adminUser.id,
      },
      {
        title: "Send Wedding Invitations",
        description: "Design, print, and mail wedding invitations",
        due_date: "2024-03-01T12:00:00Z",
        category: "Planning",
        priority: "high",
        completed: false,
        assigned_to: regularUser.id,
        estimated_time: 8.0,
        notes: "Need to finalize guest list first",
        tags: ["invitations", "design", "mailing"],
        related_event: events[0].id,
        user_id: regularUser.id,
        created_by: adminUser.id,
      },
      {
        title: "Choose Wedding Cake",
        description: "Taste test and select wedding cake design",
        due_date: "2024-04-15T15:00:00Z",
        category: "Vendors",
        priority: "medium",
        completed: false,
        assigned_to: regularUser.id,
        estimated_time: 4.0,
        notes: "Schedule tastings with 3 different bakeries",
        tags: ["cake", "tasting", "vendors"],
        related_event: events[1].id,
        user_id: regularUser.id,
        created_by: adminUser.id,
      },
      {
        title: "Book Wedding Photographer",
        description: "Research and hire professional wedding photographer",
        due_date: "2024-02-01T09:00:00Z",
        category: "Vendors",
        priority: "high",
        completed: true,
        assigned_to: regularUser.id,
        estimated_time: 6.0,
        actual_time: 8.0,
        notes: "Booked Sarah Johnson Photography",
        tags: ["photography", "vendor", "contract"],
        completed_at: "2024-01-25T16:00:00Z",
        related_event: events[0].id,
        user_id: regularUser.id,
        created_by: adminUser.id,
      },
      {
        title: "Plan Rehearsal Dinner Menu",
        description: "Work with restaurant to plan rehearsal dinner menu",
        due_date: "2024-05-01T11:00:00Z",
        category: "Planning",
        priority: "medium",
        completed: false,
        assigned_to: regularUser.id,
        estimated_time: 3.0,
        notes: "Consider dietary restrictions of guests",
        tags: ["menu", "rehearsal", "restaurant"],
        related_event: events[2].id,
        user_id: regularUser.id,
        created_by: adminUser.id,
      },
    ];

    console.log("📋 Inserting sample tasks...");
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .insert(sampleTasks)
      .select();

    if (tasksError) {
      console.error("❌ Error inserting tasks:", tasksError);
      return false;
    }

    console.log(`✅ Created ${tasks.length} tasks`);

    // Create sample guests
    const sampleGuests = [
      {
        name: "Robert Johnson",
        email: "robert.johnson@email.com",
        phone: "+1-555-0101",
        address: "123 Oak Street",
        city: "New York",
        country: "US",
        category: "groom",
        notes: "Father of the groom",
        user_id: regularUser.id,
      },
      {
        name: "Mary Johnson",
        email: "mary.johnson@email.com",
        phone: "+1-555-0102",
        address: "123 Oak Street",
        city: "New York",
        country: "US",
        category: "groom",
        notes: "Mother of the groom",
        user_id: regularUser.id,
      },
      {
        name: "Sarah Williams",
        email: "sarah.williams@email.com",
        phone: "+1-555-0201",
        address: "456 Pine Avenue",
        city: "Los Angeles",
        country: "US",
        category: "bride",
        notes: "Sister of the bride, Maid of Honor",
        user_id: regularUser.id,
      },
      {
        name: "Michael Davis",
        email: "michael.davis@email.com",
        phone: "+1-555-0301",
        address: "789 Elm Drive",
        city: "Chicago",
        country: "US",
        category: "groom",
        notes: "Best friend, Best Man",
        user_id: regularUser.id,
      },
      {
        name: "Emily Brown",
        email: "emily.brown@email.com",
        phone: "+1-555-0401",
        address: "321 Maple Lane",
        city: "Boston",
        country: "US",
        category: "bride",
        notes: "College roommate, Bridesmaid",
        user_id: regularUser.id,
      },
    ];

    console.log("👥 Inserting sample guests...");
    const { data: guests, error: guestsError } = await supabase
      .from("guests")
      .insert(sampleGuests)
      .select();

    if (guestsError) {
      console.error("❌ Error inserting guests:", guestsError);
      return false;
    }

    console.log(`✅ Created ${guests.length} guests`);

    // Create guest event associations (RSVP data)
    const guestEventData = [];
    guests.forEach((guest) => {
      events.forEach((event) => {
        guestEventData.push({
          guest_id: guest.id,
          event_id: event.id,
          invitation_status: "sent",
          rsvp_status: Math.random() > 0.3 ? "confirmed" : "pending",
          rsvp_date: Math.random() > 0.5 ? new Date().toISOString() : null,
          attendee_count: Math.floor(Math.random() * 3) + 1,
          meal_choice: ["Chicken", "Beef", "Vegetarian", "Fish"][
            Math.floor(Math.random() * 4)
          ],
          user_id: regularUser.id,
        });
      });
    });

    console.log("💌 Inserting guest event associations...");
    const { data: guestEvents, error: guestEventsError } = await supabase
      .from("guest_events")
      .insert(guestEventData)
      .select();

    if (guestEventsError) {
      console.error("❌ Error inserting guest events:", guestEventsError);
      return false;
    }

    console.log(`✅ Created ${guestEvents.length} guest event associations`);

    // Create sample budget items
    const sampleBudgets = [
      {
        description: "Wedding Venue Rental",
        category: "Venue",
        event_id: events[0].id,
        estimated_cost: 5000.0,
        actual_cost: 5200.0,
        notes: "Includes tables, chairs, and basic lighting",
        user_id: regularUser.id,
      },
      {
        description: "Wedding Catering",
        category: "Catering",
        event_id: events[1].id,
        estimated_cost: 8000.0,
        actual_cost: 7800.0,
        notes: "3-course meal for 150 guests",
        user_id: regularUser.id,
      },
      {
        description: "Wedding Photography",
        category: "Photography",
        event_id: events[0].id,
        estimated_cost: 2500.0,
        actual_cost: 2500.0,
        notes: "8-hour coverage with edited photos",
        user_id: regularUser.id,
      },
      {
        description: "Bridal Dress",
        category: "Attire",
        event_id: events[0].id,
        estimated_cost: 1200.0,
        actual_cost: 1350.0,
        notes: "Designer dress with alterations",
        user_id: regularUser.id,
      },
      {
        description: "Wedding Flowers",
        category: "Decor",
        event_id: events[0].id,
        estimated_cost: 800.0,
        actual_cost: 0.0,
        notes: "Bridal bouquet, centerpieces, and ceremony decorations",
        user_id: regularUser.id,
      },
      {
        description: "Wedding Cake",
        category: "Catering",
        event_id: events[1].id,
        estimated_cost: 600.0,
        actual_cost: 0.0,
        notes: "3-tier custom wedding cake",
        user_id: regularUser.id,
      },
      {
        description: "Wedding Transportation",
        category: "Transportation",
        event_id: events[0].id,
        estimated_cost: 400.0,
        actual_cost: 0.0,
        notes: "Limousine service for bridal party",
        user_id: regularUser.id,
      },
    ];

    console.log("💰 Inserting sample budget items...");
    const { data: budgets, error: budgetsError } = await supabase
      .from("budgets")
      .insert(sampleBudgets)
      .select();

    if (budgetsError) {
      console.error("❌ Error inserting budgets:", budgetsError);
      return false;
    }

    console.log(`✅ Created ${budgets.length} budget items`);

    console.log("\n🎉 Sample data seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Users: ${users.length}`);
    console.log(`- Events: ${events.length}`);
    console.log(`- Tasks: ${tasks.length}`);
    console.log(`- Guests: ${guests.length}`);
    console.log(`- Guest Events: ${guestEvents.length}`);
    console.log(`- Budget Items: ${budgets.length}`);

    console.log("\n🔐 Login Credentials:");
    console.log("Admin User:");
    console.log("  Username: admin");
    console.log("  Email: admin@milestonemanager.com");
    console.log("  Password: admin123");
    console.log("\nRegular User:");
    console.log("  Username: john_doe");
    console.log("  Email: john@example.com");
    console.log("  Password: admin123");

    return true;
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    return false;
  }
}

async function main() {
  console.log("🚀 Setting up Supabase for Milestone Manager");
  console.log("============================================");

  if (SUPABASE_ANON_KEY === "YOUR_SUPABASE_ANON_KEY_HERE") {
    console.log(
      "⚠️  Please set your SUPABASE_ANON_KEY environment variable or update this script"
    );
    console.log(
      "You can find your anon key in your Supabase dashboard under Settings > API"
    );
    console.log("\nFor now, here's the SQL schema to create tables manually:");
    await createTables();
    return;
  }

  // Test connection
  try {
    const { data, error } = await supabase
      .from("users")
      .select("count")
      .limit(1);
    if (error && error.code !== "PGRST116") {
      throw error;
    }
    console.log("✅ Connected to Supabase successfully");
  } catch (error) {
    console.error("❌ Failed to connect to Supabase:", error.message);
    console.log("\nPlease check your Supabase configuration and try again.");
    return;
  }

  // Create tables (show SQL for manual execution)
  await createTables();

  // Ask user to confirm tables are created before seeding
  console.log(
    "\n⏳ After creating the tables in Supabase dashboard, run this script again to seed data"
  );
  console.log("Or set SEED_DATA=true environment variable to seed data now");

  if (process.env.SEED_DATA === "true") {
    console.log("\n🌱 Proceeding with data seeding...");
    await seedData();
  }
}

// Allow this script to be run directly
if (require.main === module) {
  main()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Script failed:", error);
      process.exit(1);
    });
}

module.exports = { createTables, seedData };
