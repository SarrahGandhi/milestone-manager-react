// Import React and the useState hook
// React lets us build UI components
// useState lets us store data that can change (like input values, loading state, etc)
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
// Import CSS file for styling
import "./Invite.css";

// Import the Supabase client so we can query the database
import supabase from "../../../utils/supabase";


// This function builds search filters for Supabase queries
// Example input: "Murtaza Saifuddin"
// It allows searching by full name OR by individual words
const buildNameFilters = (value) => {

    // Create an array of search terms
    // It includes the full input AND each word separately
    const searchTerms = [
        value, // full input
        ...value
            .split(/\s+/) // split the name into words
            .map((term) => term.trim()) // remove extra spaces
            .filter(Boolean), // remove empty words
    ];

    // Remove duplicate search terms
    const uniqueTerms = [...new Set(searchTerms)];

    // Build Supabase filter query
    // ilike = case insensitive search
    return uniqueTerms
        .map((term) => `name.ilike.%${term.replace(/[%_,]/g, "")}%`)
        .join(",");
};


// This function formats a list of names nicely
// Example:
// ["Ali"] -> "Ali"
// ["Ali","Sara"] -> "Ali and Sara"
// ["Ali","Sara","Ahmed"] -> "Ali, Sara, and Ahmed"
const formatNameList = (names) => {

    if (names.length === 0) return "";
    if (names.length === 1) return names[0];
    if (names.length === 2) return `${names[0]} and ${names[1]}`;

    return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};



// This function groups matched guests into families
// So if multiple guests belong to the same family,
// we show the family as one selectable result
const buildFamilySearchResults = async (matchedGuests) => {

    // Extract unique family IDs from the matched guests
    const familyIds = [
        ...new Set(
            matchedGuests
                .map((guest) => guest.family_id)
                .filter((familyId) => familyId !== null && familyId !== undefined)
        ),
    ];

    let familyGuests = [];

    // If we found families, fetch ALL members of those families
    if (familyIds.length > 0) {

        const { data, error } = await supabase
            .from("guests") // query the guests table
            .select(`
        id,
        name,
        category,
        family_id,
        guest_families (
          id,
          email,
          phone,
          side
        )
      `)
            .in("family_id", familyIds) // get guests whose family_id matches
            .order("name");

        // If database error occurs
        if (error) {
            throw new Error(error.message || "Failed to load matching families");
        }

        familyGuests = data || [];
    }

    // Map that groups guests by family
    const guestsByGroupKey = new Map();

    // Add family members into the map
    familyGuests.forEach((guest) => {

        const groupKey = `family-${guest.family_id}`;

        // If this family does not exist yet in the map, create it
        if (!guestsByGroupKey.has(groupKey)) {
            guestsByGroupKey.set(groupKey, []);
        }

        // Add guest to the family group
        guestsByGroupKey.get(groupKey).push(guest);
    });

    // Guests without families are treated as individual groups
    matchedGuests
        .filter((guest) => guest.family_id === null || guest.family_id === undefined)
        .forEach((guest) => {
            guestsByGroupKey.set(`guest-${guest.id}`, [guest]);
        });

    // Map to track which guests matched the search
    const matchedByGroupKey = new Map();

    matchedGuests.forEach((guest) => {

        const groupKey =
            guest.family_id === null || guest.family_id === undefined
                ? `guest-${guest.id}`
                : `family-${guest.family_id}`;

        if (!matchedByGroupKey.has(groupKey)) {
            matchedByGroupKey.set(groupKey, []);
        }

        matchedByGroupKey.get(groupKey).push(guest);
    });

    // Convert the map into a list of results for UI
    return [...guestsByGroupKey.entries()]
        .map(([groupKey, familyMembers]) => {

            const matchedMembers = matchedByGroupKey.get(groupKey) || [];

            // Pick one guest to represent the family
            const representativeGuest = matchedMembers[0] || familyMembers[0];

            const family = familyMembers[0]?.guest_families || null;

            const memberNames = familyMembers.map((member) => member.name);

            return {
                key: groupKey,
                representativeGuest,
                family,
                familyMembers,
                memberNames,
                displayName: formatNameList(memberNames),
                matchedCount: matchedMembers.length,
            };
        })
        .sort((a, b) => a.displayName.localeCompare(b.displayName));
};




// This function transforms database results into a format
// that is easier for the UI to display
const buildFamilyContext = (selectedGuest, familyGuests) => {

    const family = familyGuests[0]?.guest_families || null;

    // Convert guests into a simpler structure
    const familyMembers = familyGuests.map((guest) => ({
        id: guest.id,
        name: guest.name,
        category: guest.category,
        family_id: guest.family_id,

        // Each guest can have invitations to multiple events
        invitations:
            guest.event_guests_rsvp?.map((invitation) => ({
                id: invitation.id,
                guest_id: invitation.guest_id,
                event_id: invitation.event_id,
                rsvp_status: invitation.rsvp_status,
                created_at: invitation.created_at,
                event: invitation.events,
            })) || [],
    }));


    // Map to group guests by event
    const eventsMap = new Map();

    familyMembers.forEach((member) => {

        member.invitations.forEach((invitation) => {

            if (!invitation.event) return;

            const eventId = invitation.event.id;

            // Create event group if it doesn't exist
            if (!eventsMap.has(eventId)) {
                eventsMap.set(eventId, {
                    ...invitation.event,
                    invitedGuests: [],
                });
            }

            // Add guest to that event
            eventsMap.get(eventId).invitedGuests.push({
                guest_id: member.id,
                guest_name: member.name,
                category: member.category,
                rsvp_row_id: invitation.id,
                rsvp_status: invitation.rsvp_status,
            });
        });
    });

    // Convert map into array and sort by date
    const events = [...eventsMap.values()].sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateA - dateB;
    });

    return {
        id: selectedGuest.id,
        name: selectedGuest.name,
        category: selectedGuest.category,
        family_id: selectedGuest.family_id,
        email: family?.email?.[0] || "",

        selectedGuest: {
            id: selectedGuest.id,
            name: selectedGuest.name,
            category: selectedGuest.category,
            family_id: selectedGuest.family_id,
        },

        family,
        familyMembers,
        events,
    };
};



// Fetch full invitation data for a selected guest/family
const fetchFamilyContext = async (selectedGuest) => {

    const baseQuery = supabase.from("guests").select(`
    id,
    name,
    category,
    family_id,
    guest_families (
      id,
      email,
      phone,
      side
    ),
    event_guests_rsvp (
      id,
      guest_id,
      event_id,
      rsvp_status,
      created_at,
      events (
        id,
        name,
        date,
        location,
        dress_code,
        details,
        created_at
      )
    )
  `);

    // If guest belongs to a family, fetch entire family
    const query = selectedGuest.family_id
        ? baseQuery.eq("family_id", selectedGuest.family_id)
        : baseQuery.eq("id", selectedGuest.id);

    const { data, error } = await query.order("name");

    if (error) {
        throw new Error(error.message || "Failed to load family invitations");
    }

    return buildFamilyContext(selectedGuest, data || []);
};



// Main React component
const GuestLookupPage = () => {

    // React state variables

    const [name, setName] = useState(""); // user input
    const [error, setError] = useState(""); // error message
    const [loading, setLoading] = useState(false); // loading spinner state
    const [searchResults, setSearchResults] = useState([]); // families found
    const [showResults, setShowResults] = useState(false); // show result selection
    const [guestContext, setGuestContext] = useState(null); // final selected guest data



    // Function to update RSVP status in the database and UI
    const handleRsvpChange = async (rsvpRowId, newStatus) => {
        try {
            console.log("Attempting to update RSVP:", rsvpRowId, newStatus);
            // 1. Update Supabase database
            const { error: updateError } = await supabase
                .from("event_guests_rsvp")
                .update({ rsvp_status: newStatus })
                .eq("id", rsvpRowId);

            if (updateError) {
                console.error("Supabase Error:", updateError);
                throw updateError;
            }

            console.log("Successfully updated Supabase!");

            // 2. Update local state so UI updates immediately without needing a refresh
            setGuestContext((prevContext) => {
                const updatedEvents = prevContext.events.map((event) => {
                    const updatedGuests = event.invitedGuests.map((guest) => {
                        if (guest.rsvp_row_id === rsvpRowId) {
                            return { ...guest, rsvp_status: newStatus };
                        }
                        return guest;
                    });
                    return { ...event, invitedGuests: updatedGuests };
                });

                return { ...prevContext, events: updatedEvents };
            });

        } catch (err) {
            console.error("Error updating RSVP:", err);
            alert("Error updating RSVP: " + (err.message || "Unknown Error"));
            setError("Failed to update RSVP. Please try again.");
        }
    };

    // Function runs when user submits search form
    const handleSubmit = async (e) => {

        e.preventDefault(); // stop page reload

        setError("");
        setLoading(true);
        setSearchResults([]);
        setShowResults(false);

        try {

            const trimmedName = name.trim();

            if (!trimmedName) {
                throw new Error("Please enter a name to search");
            }

            const filters = buildNameFilters(trimmedName);

            // Query database for guests matching the name
            const { data, error: searchError } = await supabase
                .from("guests")
                .select(`
          id,
          name,
          category,
          family_id,
          guest_families (
            id,
            email,
            phone,
            side
          )
        `)
                .or(filters)
                .order("name")
                .limit(20);

            if (searchError) {
                throw new Error(searchError.message || "Failed to find guest");
            }

            const guests = data || [];

            // If nothing found
            if (guests.length === 0) {
                setError("No guests found matching your search.");
                return;
            }

            // If exactly one guest found
            if (guests.length === 1) {
                const context = await fetchFamilyContext(guests[0]);
                setGuestContext(context);
                return;
            }

            // If multiple guests matched
            const familyResults = await buildFamilySearchResults(guests);

            // If only one family matched
            if (familyResults.length === 1) {
                const context = await fetchFamilyContext(
                    familyResults[0].representativeGuest
                );
                setGuestContext(context);
                return;
            }

            // Show family selection
            setSearchResults(familyResults);
            setShowResults(true);

        } catch (err) {

            console.error("Error looking up guest:", err);

            setError(
                err.message || "An error occurred while looking up your invitation"
            );

        } finally {

            setLoading(false);

        }
    };



    // When user selects a family result
    const handleGuestSelect = async (result) => {

        setError("");
        setLoading(true);

        try {

            const context = await fetchFamilyContext(result.representativeGuest);

            setGuestContext(context);

            setSearchResults([]);
            setShowResults(false);

        } catch (err) {

            console.error("Error loading family invitations:", err);

            setError(
                err.message || "An error occurred while loading family invitations"
            );

        } finally {

            setLoading(false);

        }
    };



    // Reset search
    const handleRetry = () => {
        setError("");
        setName("");
        setSearchResults([]);
        setShowResults(false);
    };

    // Start new search
    const handleNewSearch = () => {
        setError("");
        setSearchResults([]);
        setShowResults(false);
    };

    // Clear selected guest and return to search
    const handleClearSelection = () => {
        setGuestContext(null);
        setSearchResults([]);
        setShowResults(false);
        setError("");
    };



    return (
        <div className="invite-page">
            <nav className="wedding-navbar">
                <div className="nav-logo">
                    <img src="smlogo.png" alt="S&M" />
                </div>
                <ul className="nav-links">
                    <li><NavLink to="/">Home</NavLink></li>
                    <li><NavLink to="/our-story">Our Story</NavLink></li>
                    <li><NavLink to="/invite">Find Your Invitation</NavLink></li>
                </ul>
            </nav>

            {/* If a guest is selected, show invitation data */}
            {guestContext ? (
                <div className="guest-lookup-container">
                    {/* <button onClick={handleClearSelection}>
                        Clear Selection
                    </button> */}

                    {/* <h2>Multiple Families Found</h2>
                    <p>We found multiple families matching your name. Please select the family you are looking for.</p>
                    <p><strong>Name:</strong> {guestContext.selectedGuest?.name}</p> */}

                    {/* <h2>Family Members</h2> */}


                    {/* {guestContext.familyMembers.map((member) => (
                        <div key={member.id}>
                            <p>{member.name}</p>
                        </div>
                    ))} */}

                    <h2>Events</h2>

                    {guestContext.events.map((event) => (
                        <div className="event-rsvp-details" key={event.id}>
                            <h3>{event.name}</h3>
                            <p>{event.date}</p>
                            <p>{event.time}</p>
                            <p>{event.location}</p>
                            <div className="guest-rsvp">
                                {event.invitedGuests.map((guest) => (
                                    <div className="guest-rsvp-row" key={guest.rsvp_row_id}>
                                        <span>{guest.guest_name}</span>
                                        <div className="guest-rsvp-buttons">
                                            <button
                                                className={guest.rsvp_status === "ACCEPTED" ? "accepted" : ""}
                                                onClick={() => handleRsvpChange(guest.rsvp_row_id, "ACCEPTED")}
                                            >
                                                Accept
                                            </button>

                                            <button
                                                className={guest.rsvp_status === "DECLINED" ? "declined" : ""}
                                                onClick={() => handleRsvpChange(guest.rsvp_row_id, "DECLINED")}
                                            >
                                                Decline
                                            </button>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}



                </div>
            ) : showResults && searchResults.length > 0 ? (
                /* If multiple families matched */
                <div className="guest-lookup-container">
                    <h2>Multipe Families Found</h2>
                    <p>We found multiple families matching your name. Please select the family you are looking for.</p>

                    {searchResults.map((result) => (
                        <button
                            key={result.key}
                            type="button"
                            className="guest-result-card"
                            onClick={() => handleGuestSelect(result)}
                            disabled={loading}>
                            <h3>{result.displayName}</h3>
                            <p className="guest-events">Members:  {result.familyMembers.length}</p>
                            {result.family?.side && (<p className="guest-events">Side: {result.family.side}     </p>)}

                        </button>

                    ))}
                    <div className="new-search">
                        <button onClick={handleNewSearch}>Search Again</button></div>
                </div>
            ) : (
                /* Default search UI */
                <div className="invite-content">
                    <h2>Find Your Invitation</h2>
                    <p>Enter your first name or full name to find your invitation</p>
                    <form className="invite-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                            required
                        />
                        <button type="submit">
                            {loading ? "Searching..." : "Find Invitation"}
                        </button>
                    </form>

                    {error && <p>{error}</p>}
                </div>
            )}

            <footer className="wedding-footer">
                <img src="/smlogo.png" alt="smlogo"></img>
            </footer>
        </div>
    );
};

export default GuestLookupPage;