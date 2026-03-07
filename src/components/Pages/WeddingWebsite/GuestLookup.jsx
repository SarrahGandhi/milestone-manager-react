import React, { useState } from "react";
import "./WeddingWebsite.css";
import supabase from "../../../utils/supabase";

const buildNameFilters = (value) => {
  // We search using the full input plus each individual word so
  // "Murtaza Saifuddin" can still match on either first or last name.
  const searchTerms = [
    value,
    ...value
      .split(/\s+/)
      .map((term) => term.trim())
      .filter(Boolean),
  ];

  const uniqueTerms = [...new Set(searchTerms)];

  return uniqueTerms
    .map((term) => `name.ilike.%${term.replace(/[%_,]/g, "")}%`)
    .join(",");
};

const formatNameList = (names) => {
  if (names.length === 0) return "";
  if (names.length === 1) return names[0];
  if (names.length === 2) return `${names[0]} and ${names[1]}`;

  return `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`;
};

const buildFamilySearchResults = async (matchedGuests) => {
  const familyIds = [
    ...new Set(
      matchedGuests
        .map((guest) => guest.family_id)
        .filter((familyId) => familyId !== null && familyId !== undefined)
    ),
  ];

  let familyGuests = [];

  if (familyIds.length > 0) {
    // Once we know which matched guests belong to a family, load the full set
    // of members for those families so the chooser is family-based, not guest-based.
    const { data, error } = await supabase
      .from("guests")
      .select(
        `
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
        `
      )
      .in("family_id", familyIds)
      .order("name");

    if (error) {
      throw new Error(error.message || "Failed to load matching families");
    }

    familyGuests = data || [];
  }

  const guestsByGroupKey = new Map();

  familyGuests.forEach((guest) => {
    const groupKey = `family-${guest.family_id}`;

    if (!guestsByGroupKey.has(groupKey)) {
      guestsByGroupKey.set(groupKey, []);
    }

    guestsByGroupKey.get(groupKey).push(guest);
  });

  matchedGuests
    .filter((guest) => guest.family_id === null || guest.family_id === undefined)
    .forEach((guest) => {
      guestsByGroupKey.set(`guest-${guest.id}`, [guest]);
    });

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

  return [...guestsByGroupKey.entries()]
    .map(([groupKey, familyMembers]) => {
      const matchedMembers = matchedByGroupKey.get(groupKey) || [];
      const representativeGuest = matchedMembers[0] || familyMembers[0];
      const family = familyMembers[0]?.guest_families || null;
      const memberNames = familyMembers.map((member) => member.name);

      return {
        key: groupKey,
        // We only need one guest to load the family context later.
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

const buildFamilyContext = (selectedGuest, familyGuests) => {
  const family = familyGuests[0]?.guest_families || null;

  // Normalize the Supabase response into a shape that is easier for the
  // next screen to render: family members plus their invitations.
  const familyMembers = familyGuests.map((guest) => ({
    id: guest.id,
    name: guest.name,
    category: guest.category,
    family_id: guest.family_id,
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

  const eventsMap = new Map();

  // Group invitations by event so the UI can render:
  // Event -> invited family members -> RSVP controls.
  familyMembers.forEach((member) => {
    member.invitations.forEach((invitation) => {
      if (!invitation.event) return;

      const eventId = invitation.event.id;

      if (!eventsMap.has(eventId)) {
        eventsMap.set(eventId, {
          ...invitation.event,
          invitedGuests: [],
        });
      }

      eventsMap.get(eventId).invitedGuests.push({
        guest_id: member.id,
        guest_name: member.name,
        category: member.category,
        rsvp_row_id: invitation.id,
        rsvp_status: invitation.rsvp_status,
      });
    });
  });

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

const fetchFamilyContext = async (selectedGuest) => {
  // After the user chooses one matched guest/family option, we load the full
  // family context in one query: family details, all family members, and each
  // member's RSVP rows with the related event details.
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

  const query = selectedGuest.family_id
    ? baseQuery.eq("family_id", selectedGuest.family_id)
    : baseQuery.eq("id", selectedGuest.id);

  const { data, error } = await query.order("name");

  if (error) {
    throw new Error(error.message || "Failed to load family invitations");
  }

  return buildFamilyContext(selectedGuest, data || []);
};

const GuestLookup = ({ onGuestFound }) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
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

      // First query: search guests by name. This is intentionally lightweight,
      // because we only need enough data to decide which family/families matched.
      const { data, error: searchError } = await supabase
        .from("guests")
        .select(
          `
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
          `
        )
        .or(filters)
        .order("name")
        .limit(20);

      if (searchError) {
        throw new Error(searchError.message || "Failed to find guest");
      }

      const guests = data || [];

      if (guests.length === 0) {
        setError(
          "No guests found matching your search. Please try a different name or contact the hosts."
        );
        return;
      }

      if (guests.length === 1) {
        const guestContext = await fetchFamilyContext(guests[0]);
        onGuestFound(guestContext);
        return;
      }

      // If multiple guests match the search, collapse them into family options
      // so the user selects a family, not an individual person.
      const familyResults = await buildFamilySearchResults(guests);

      if (familyResults.length === 1) {
        const guestContext = await fetchFamilyContext(
          familyResults[0].representativeGuest
        );
        onGuestFound(guestContext);
        return;
      }

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

  const handleGuestSelect = async (result) => {
    setError("");
    setLoading(true);

    try {
      const guestContext = await fetchFamilyContext(result.representativeGuest);
      onGuestFound(guestContext);
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

  const handleRetry = () => {
    setError("");
    setName("");
    setSearchResults([]);
    setShowResults(false);
  };

  const handleNewSearch = () => {
    setError("");
    setSearchResults([]);
    setShowResults(false);
  };

  if (showResults && searchResults.length > 0) {
    return (
      <div className="guest-lookup-container">
        <h2>Multiple Families Found</h2>
        <p className="lookup-instruction">
          We found {searchResults.length}{" "}
          {searchResults.length === 1 ? "family" : "families"} matching "
          {name}". Please select your family:
        </p>

        <div className="search-results">
          {searchResults.map((result) => (
            <button
              key={result.key}
              type="button"
              className="guest-result-card"
              onClick={() => handleGuestSelect(result)}
              disabled={loading}
            >
              <h3>{result.displayName}</h3>
              <p className="guest-events">
                Members: {result.familyMembers.length}
              </p>
              {result.family?.side && (
                <p className="guest-events">Side: {result.family.side}</p>
              )}
              {result.family?.email?.length > 0 && (
                <p className="guest-events">
                  Contact: {result.family.email.join(", ")}
                </p>
              )}
              <p className="guest-events">Family members: {result.displayName}</p>
            </button>
          ))}
        </div>

        <button onClick={handleNewSearch} className="new-search-btn">
          Search Again
        </button>
      </div>
    );
  }

  return (
    <div className="guest-lookup-container">
      <h2>Find Your Invitation</h2>
      <p className="lookup-instruction">
        Enter your first name or full name to find your invitation
      </p>

      <form onSubmit={handleSubmit} className="lookup-form">
        <div className="form-group">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your first name or full name"
            required
            className="lookup-input"
            disabled={loading}
          />
        </div>

        <button type="submit" className="lookup-btn" disabled={loading}>
          {loading ? "Searching..." : "Find Invitation"}
        </button>
      </form>

      {error && (
        <div className="lookup-error">
          {error}
          <button onClick={handleRetry} className="retry-btn">
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default GuestLookup;
