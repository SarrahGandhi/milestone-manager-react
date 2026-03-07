const { supabase } = require("../config/database");

async function seedRSVPData() {
  try {
    console.log("🌱 Starting RSVP data seeding...");

    // Get the first user to associate with seeded data
    const { data: users, error: userError } = await supabase
      .from("users")
      .select("id")
      .limit(1);

    if (userError || !users || users.length === 0) {
      throw new Error("No users found. Please seed users first.");
    }

    const userId = users[0].id;
    console.log(`Using user ID: ${userId}`);

    // Clear existing guest_events data
    console.log("🧹 Clearing existing guest_events data...");
    await supabase
      .from("guest_events")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Clear existing guests data
    console.log("🧹 Clearing existing guests data...");
    await supabase
      .from("guests")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    // Get events for RSVP associations
    const { data: events, error: eventsError } = await supabase
      .from("events")
      .select("id, title");

    if (eventsError) {
      throw new Error(`Failed to fetch events: ${eventsError.message}`);
    }

    console.log(`Found ${events.length} events for RSVP associations`);

    // Create comprehensive guest data
    const guestsData = [
      {
        name: "Robert Johnson",
        email: "robert.johnson@email.com",
        phone: "+1-555-0101",
        address: JSON.stringify({
          street: "123 Oak Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "US",
        }),
        category: "groom",
        notes: "Father of the groom",
        user_id: userId,
      },
      {
        name: "Mary Johnson",
        email: "mary.johnson@email.com",
        phone: "+1-555-0102",
        address: JSON.stringify({
          street: "123 Oak Street",
          city: "New York",
          state: "NY",
          zipCode: "10001",
          country: "US",
        }),
        category: "groom",
        notes: "Mother of the groom",
        user_id: userId,
      },
      {
        name: "Sarah Williams",
        email: "sarah.williams@email.com",
        phone: "+1-555-0201",
        address: JSON.stringify({
          street: "456 Pine Avenue",
          city: "Los Angeles",
          state: "CA",
          zipCode: "90210",
          country: "US",
        }),
        category: "bride",
        notes: "Sister of the bride, Maid of Honor",
        user_id: userId,
      },
      {
        name: "Michael Davis",
        email: "michael.davis@email.com",
        phone: "+1-555-0301",
        address: JSON.stringify({
          street: "789 Maple Drive",
          city: "Chicago",
          state: "IL",
          zipCode: "60601",
          country: "US",
        }),
        category: "bride",
        notes: "Best friend from college",
        user_id: userId,
      },
      {
        name: "Emily Chen",
        email: "emily.chen@email.com",
        phone: "+1-555-0401",
        address: JSON.stringify({
          street: "321 Elm Street",
          city: "Seattle",
          state: "WA",
          zipCode: "98101",
          country: "US",
        }),
        category: "bride",
        notes: "Work colleague and close friend",
        user_id: userId,
      },
      {
        name: "David Brown",
        email: "david.brown@email.com",
        phone: "+1-555-0501",
        address: JSON.stringify({
          street: "654 Cedar Lane",
          city: "Miami",
          state: "FL",
          zipCode: "33101",
          country: "US",
        }),
        category: "groom",
        notes: "Brother of the groom, Best Man",
        user_id: userId,
      },
      {
        name: "Lisa Martinez",
        email: "lisa.martinez@email.com",
        phone: "+1-555-0601",
        address: JSON.stringify({
          street: "987 Birch Road",
          city: "Denver",
          state: "CO",
          zipCode: "80201",
          country: "US",
        }),
        category: "bride",
        notes: "Cousin of the bride",
        user_id: userId,
      },
      {
        name: "James Wilson",
        email: "james.wilson@email.com",
        phone: "+1-555-0701",
        address: JSON.stringify({
          street: "147 Spruce Street",
          city: "Boston",
          state: "MA",
          zipCode: "02101",
          country: "US",
        }),
        category: "bride",
        notes: "Childhood friend",
        user_id: userId,
      },
    ];

    // Insert guests
    console.log("👥 Inserting guests...");
    const { data: insertedGuests, error: guestsInsertError } = await supabase
      .from("guests")
      .insert(guestsData)
      .select();

    if (guestsInsertError) {
      throw new Error(`Failed to insert guests: ${guestsInsertError.message}`);
    }

    console.log(`✅ Inserted ${insertedGuests.length} guests`);

    // Create RSVP data (guest_events)
    const rsvpData = [];
    const rsvpStatuses = ["confirmed", "declined", "pending", "maybe"];
    const mealChoices = ["Chicken", "Beef", "Vegetarian", "Fish"];

    insertedGuests.forEach((guest, guestIndex) => {
      events.forEach((event, eventIndex) => {
        // Not every guest gets invited to every event
        // All guests get invited to all events for simplicity
        const shouldInvite = true;

        if (shouldInvite) {
          const rsvpStatus = rsvpStatuses[guestIndex % rsvpStatuses.length];
          const attendeeCount =
            rsvpStatus === "confirmed" ? Math.floor(Math.random() * 2) + 1 : 0;

          rsvpData.push({
            guest_id: guest.id,
            event_id: event.id,
            invitation_status: "sent",
            rsvp_status: rsvpStatus,
            rsvp_date:
              rsvpStatus !== "pending" ? new Date().toISOString() : null,
            attendee_count: attendeeCount,
            meal_choice:
              rsvpStatus === "confirmed"
                ? mealChoices[guestIndex % mealChoices.length]
                : null,
            special_requests:
              guestIndex % 3 === 0 ? "Vegetarian option preferred" : null,
            notes:
              guestIndex % 4 === 0
                ? "Will arrive early to help with setup"
                : null,
            user_id: userId,
          });
        }
      });
    });

    // Insert RSVP data
    console.log("📝 Inserting RSVP data...");
    const { data: insertedRSVPs, error: rsvpInsertError } = await supabase
      .from("guest_events")
      .insert(rsvpData)
      .select();

    if (rsvpInsertError) {
      throw new Error(`Failed to insert RSVP data: ${rsvpInsertError.message}`);
    }

    console.log(`✅ Inserted ${insertedRSVPs.length} RSVP records`);

    // Show summary
    console.log("\n📊 RSVP Data Summary:");

    const { data: summary } = await supabase.from("guest_events").select(`
        rsvp_status,
        events!inner(title)
      `);

    if (summary) {
      const summaryByEvent = {};
      summary.forEach((item) => {
        const eventTitle = item.events.title;
        if (!summaryByEvent[eventTitle]) {
          summaryByEvent[eventTitle] = {
            confirmed: 0,
            declined: 0,
            pending: 0,
            maybe: 0,
          };
        }
        summaryByEvent[eventTitle][item.rsvp_status]++;
      });

      Object.entries(summaryByEvent).forEach(([eventTitle, counts]) => {
        console.log(`${eventTitle}:`);
        console.log(`  - Confirmed: ${counts.confirmed}`);
        console.log(`  - Declined: ${counts.declined}`);
        console.log(`  - Pending: ${counts.pending}`);
        console.log(`  - Maybe: ${counts.maybe}`);
      });
    }

    console.log("\n🎉 RSVP data seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding RSVP data:", error);
    throw error;
  }
}

// Run the seeding function if this file is executed directly
if (require.main === module) {
  seedRSVPData()
    .then(() => {
      console.log("Seeding completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Seeding failed:", error);
      process.exit(1);
    });
}

module.exports = { seedRSVPData };
