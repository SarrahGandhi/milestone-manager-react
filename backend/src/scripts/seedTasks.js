require("dotenv").config();
const { supabase } = require("../config/database");

// Sample task data for seeding

const sampleTasks = [
  {
    title: "Book Wedding Venue",
    description:
      "Research and book the perfect wedding venue for the ceremony and reception",
    category: "Venue",
    priority: "high",
    estimatedTime: 10.0,
    tags: ["venue", "booking", "research"],
    notes: "Consider capacity, location, and budget constraints",
  },
  {
    title: "Send Save the Dates",
    description: "Design and send save the date cards to all guests",
    category: "Planning",
    priority: "high",
    estimatedTime: 5.0,
    tags: ["invitations", "design", "mailing"],
    notes: "Send 6-8 months before wedding date",
  },
  {
    title: "Choose Wedding Photographer",
    description: "Research, interview, and book wedding photographer",
    category: "Vendors",
    priority: "high",
    estimatedTime: 8.0,
    tags: ["photography", "vendor", "contract"],
    notes: "Review portfolios and check availability",
  },
  {
    title: "Select Wedding Dress",
    description: "Shop for and purchase wedding dress with alterations",
    category: "Other",
    priority: "high",
    estimatedTime: 12.0,
    tags: ["dress", "shopping", "alterations"],
    notes: "Allow time for multiple fittings",
  },
  {
    title: "Plan Wedding Menu",
    description: "Work with caterer to plan wedding menu and tastings",
    category: "Vendors",
    priority: "medium",
    estimatedTime: 6.0,
    tags: ["catering", "menu", "tasting"],
    notes: "Consider dietary restrictions and preferences",
  },
  {
    title: "Book Wedding Band/DJ",
    description: "Research and book entertainment for wedding reception",
    category: "Vendors",
    priority: "medium",
    estimatedTime: 4.0,
    tags: ["entertainment", "music", "reception"],
    notes: "Check equipment needs and song preferences",
  },
  {
    title: "Order Wedding Flowers",
    description:
      "Choose and order bridal bouquet, centerpieces, and ceremony flowers",
    category: "Vendors",
    priority: "medium",
    estimatedTime: 5.0,
    tags: ["flowers", "decor", "bouquet"],
    notes: "Consider seasonal availability and color scheme",
  },
  {
    title: "Plan Honeymoon",
    description: "Research destinations and book honeymoon travel",
    category: "Planning",
    priority: "low",
    estimatedTime: 8.0,
    tags: ["honeymoon", "travel", "booking"],
    notes: "Consider passport requirements and travel insurance",
  },
  {
    title: "Order Wedding Cake",
    description: "Design and order wedding cake with baker",
    category: "Vendors",
    priority: "medium",
    estimatedTime: 3.0,
    tags: ["cake", "dessert", "tasting"],
    notes: "Schedule cake tasting and discuss design options",
  },
  {
    title: "Plan Rehearsal Dinner",
    description: "Organize rehearsal dinner for wedding party and families",
    category: "Planning",
    priority: "medium",
    estimatedTime: 4.0,
    tags: ["rehearsal", "dinner", "family"],
    notes: "Keep it intimate with close family and wedding party",
  },
  {
    title: "Purchase Wedding Rings",
    description: "Shop for and purchase wedding bands",
    category: "Other",
    priority: "high",
    estimatedTime: 4.0,
    tags: ["rings", "jewelry", "shopping"],
    notes: "Allow time for engraving and sizing",
  },
  {
    title: "Create Wedding Website",
    description: "Build wedding website with details and RSVP functionality",
    category: "Planning",
    priority: "medium",
    estimatedTime: 6.0,
    tags: ["website", "rsvp", "information"],
    notes: "Include venue details, registry, and accommodation info",
  },
  {
    title: "Book Wedding Transportation",
    description: "Arrange transportation for wedding party and guests",
    category: "Other",
    priority: "low",
    estimatedTime: 2.0,
    tags: ["transportation", "logistics"],
    notes: "Consider shuttle service for guests if needed",
  },
  {
    title: "Plan Wedding Favors",
    description: "Choose and order wedding favors for guests",
    category: "Other",
    priority: "low",
    estimatedTime: 3.0,
    tags: ["favors", "gifts", "guests"],
    notes: "Consider personalized or edible options",
  },
  {
    title: "Finalize Guest List",
    description: "Create and finalize complete guest list with addresses",
    category: "Planning",
    priority: "high",
    estimatedTime: 4.0,
    tags: ["guests", "list", "addresses"],
    notes: "Coordinate with both families for complete list",
  },
];

async function seedTasks() {
  try {
    console.log("🌱 Starting task seeding process...");

    // Check if we have any users to assign tasks to
    const { data: users, error: usersError } = await supabase
      .from("users")
      .select("id, username, role")
      .limit(5);

    if (usersError) {
      console.error("❌ Error fetching users:", usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.log(
        "⚠️  No users found. Please run the setup script first to create users."
      );
      return;
    }

    console.log(`✅ Found ${users.length} users`);

    // Get a sample user to assign tasks to
    const sampleUser = users.find((u) => u.role === "user") || users[0];
    const adminUser = users.find((u) => u.role === "admin") || users[0];

    console.log(`📋 Assigning tasks to user: ${sampleUser.username}`);

    // Get events to associate some tasks with
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title")
      .limit(3);

    if (eventsError) {
      console.error("❌ Error fetching events:", eventsError);
    }

    // Prepare tasks with user assignments and random due dates
    const tasksToInsert = sampleTasks.map((task, index) => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + Math.floor(Math.random() * 180) + 30); // 30-210 days from now

      return {
        ...task,
        due_date: dueDate.toISOString(),
        completed: Math.random() > 0.7, // 30% chance of being completed
        assigned_to: sampleUser.id,
        user_id: sampleUser.id,
        created_by: adminUser.id,
        related_event:
          events && events.length > 0 ? events[index % events.length].id : null,
        completed_at: Math.random() > 0.7 ? new Date().toISOString() : null,
      };
    });

    console.log("📝 Inserting sample tasks...");
    const { data: insertedTasks, error: insertError } = await supabase
      .from("tasks")
      .insert(tasksToInsert)
      .select();

    if (insertError) {
      console.error("❌ Error inserting tasks:", insertError);
      return;
    }

    console.log(`✅ Successfully created ${insertedTasks.length} sample tasks`);

    // Add some subtasks to a few tasks
    const subtasksToInsert = [];
    insertedTasks.slice(0, 3).forEach((task) => {
      const subtaskCount = Math.floor(Math.random() * 3) + 1;
      for (let i = 0; i < subtaskCount; i++) {
        subtasksToInsert.push({
          task_id: task.id,
          title: `Subtask ${i + 1} for ${task.title}`,
          completed: Math.random() > 0.5,
        });
      }
    });

    if (subtasksToInsert.length > 0) {
      console.log("📋 Adding subtasks...");
      const { data: insertedSubtasks, error: subtaskError } = await supabase
        .from("task_subtasks")
        .insert(subtasksToInsert)
        .select();

      if (subtaskError) {
        console.error("❌ Error inserting subtasks:", subtaskError);
      } else {
        console.log(
          `✅ Successfully created ${insertedSubtasks.length} subtasks`
        );
      }
    }

    // Add some reminders to tasks
    const remindersToInsert = [];
    insertedTasks.slice(0, 5).forEach((task) => {
      const reminderDate = new Date(task.due_date);
      reminderDate.setDate(
        reminderDate.getDate() - Math.floor(Math.random() * 7) - 1
      ); // 1-7 days before due date

      remindersToInsert.push({
        task_id: task.id,
        date: reminderDate.toISOString(),
        message: `Reminder: ${task.title} is due soon!`,
      });
    });

    if (remindersToInsert.length > 0) {
      console.log("⏰ Adding task reminders...");
      const { data: insertedReminders, error: reminderError } = await supabase
        .from("task_reminders")
        .insert(remindersToInsert)
        .select();

      if (reminderError) {
        console.error("❌ Error inserting reminders:", reminderError);
      } else {
        console.log(
          `✅ Successfully created ${insertedReminders.length} reminders`
        );
      }
    }

    console.log("\n🎉 Task seeding completed successfully!");
    console.log("\n📊 Summary:");
    console.log(`- Tasks: ${insertedTasks.length}`);
    console.log(`- Subtasks: ${subtasksToInsert.length}`);
    console.log(`- Reminders: ${remindersToInsert.length}`);
    console.log(`- Assigned to: ${sampleUser.username} (${sampleUser.id})`);
  } catch (error) {
    console.error("❌ Error in seedTasks:", error);
  }
}

// Allow this script to be run directly
if (require.main === module) {
  seedTasks()
    .then(() => {
      console.log("✅ Task seeding script completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Task seeding script failed:", error);
      process.exit(1);
    });
}

module.exports = { seedTasks };
