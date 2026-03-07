-- Manual Seed Data for Milestone Manager
-- Run this in your Supabase SQL Editor to populate your database with sample data

-- Insert sample users (passwords are hashed version of 'admin123')
INSERT INTO users (username, email, password, first_name, last_name, role, is_active) VALUES
('admin', 'admin@milestonemanager.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSQVyZpe', 'Admin', 'User', 'admin', true),
('john_doe', 'john@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSQVyZpe', 'John', 'Doe', 'user', true),
('jane_smith', 'jane@example.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSQVyZpe', 'Jane', 'Smith', 'user', true);

-- Insert sample events
INSERT INTO events (title, description, event_date, start_time, end_time, location, dress_code, menu, additional_details, category, priority, organizer, status, max_attendees, registration_required, tags, notes) VALUES
('Wedding Ceremony', 'The main wedding ceremony', '2024-06-15', '15:00', '16:00', 'St. Mary''s Church, 123 Main St', 'Formal', ARRAY['Appetizers', 'Main Course', 'Dessert'], 'Please arrive 30 minutes early', 'milestone', 'high', 'Wedding Planner', 'published', 150, true, ARRAY['wedding', 'ceremony', 'formal'], 'Photography will be taking place'),
('Wedding Reception', 'Celebration dinner and dancing', '2024-06-15', '18:00', '23:00', 'Grand Ballroom, Luxury Hotel', 'Cocktail', ARRAY['Cocktail Hour', 'Dinner', 'Wedding Cake', 'Open Bar'], 'Dancing and entertainment throughout the evening', 'celebration', 'high', 'Wedding Planner', 'published', 150, true, ARRAY['wedding', 'reception', 'party'], 'Live band performance from 8-11 PM'),
('Rehearsal Dinner', 'Pre-wedding dinner for close family and friends', '2024-06-14', '19:00', '22:00', 'Private Dining Room, Italian Restaurant', 'Smart Casual', ARRAY['Italian Cuisine', 'Wine Pairing'], 'Intimate gathering for wedding party', 'meeting', 'medium', 'Bride & Groom', 'published', 30, false, ARRAY['rehearsal', 'dinner', 'family'], 'Speeches and toasts welcome');

-- Insert sample tasks (using the user IDs from above)
INSERT INTO tasks (title, description, due_date, category, priority, completed, assigned_to, estimated_time, actual_time, notes, tags, completed_at, related_event, user_id, created_by) 
SELECT 
  'Book Wedding Venue',
  'Research and book the perfect wedding venue',
  '2024-01-15T10:00:00Z',
  'Venue',
  'high',
  true,
  u_regular.id,
  10.0,
  12.0,
  'Visited 5 venues, chose the Grand Ballroom',
  ARRAY['venue', 'booking', 'urgent'],
  '2024-01-10T14:30:00Z',
  e.id,
  u_regular.id,
  u_admin.id
FROM 
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1) u_admin,
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u_regular,
  (SELECT id FROM events WHERE title = 'Wedding Ceremony' LIMIT 1) e;

INSERT INTO tasks (title, description, due_date, category, priority, completed, assigned_to, estimated_time, notes, tags, related_event, user_id, created_by) 
SELECT 
  'Send Wedding Invitations',
  'Design, print, and mail wedding invitations',
  '2024-03-01T12:00:00Z',
  'Planning',
  'high',
  false,
  u_regular.id,
  8.0,
  'Need to finalize guest list first',
  ARRAY['invitations', 'design', 'mailing'],
  e.id,
  u_regular.id,
  u_admin.id
FROM 
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1) u_admin,
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u_regular,
  (SELECT id FROM events WHERE title = 'Wedding Ceremony' LIMIT 1) e;

INSERT INTO tasks (title, description, due_date, category, priority, completed, assigned_to, estimated_time, notes, tags, related_event, user_id, created_by) 
SELECT 
  'Choose Wedding Cake',
  'Taste test and select wedding cake design',
  '2024-04-15T15:00:00Z',
  'Vendors',
  'medium',
  false,
  u_regular.id,
  4.0,
  'Schedule tastings with 3 different bakeries',
  ARRAY['cake', 'tasting', 'vendors'],
  e.id,
  u_regular.id,
  u_admin.id
FROM 
  (SELECT id FROM users WHERE role = 'admin' LIMIT 1) u_admin,
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u_regular,
  (SELECT id FROM events WHERE title = 'Wedding Reception' LIMIT 1) e;

-- Insert sample guests
INSERT INTO guests (name, email, phone, address, city, country, category, notes, user_id)
SELECT 
  'Robert Johnson',
  'robert.johnson@email.com',
  '+1-555-0101',
  '123 Oak Street',
  'New York',
  'US',
  'groom',
  'Father of the groom',
  u.id
FROM (SELECT id FROM users WHERE role = 'user' LIMIT 1) u;

INSERT INTO guests (name, email, phone, address, city, country, category, notes, user_id)
SELECT 
  'Mary Johnson',
  'mary.johnson@email.com',
  '+1-555-0102',
  '123 Oak Street',
  'New York',
  'US',
  'groom',
  'Mother of the groom',
  u.id
FROM (SELECT id FROM users WHERE role = 'user' LIMIT 1) u;

INSERT INTO guests (name, email, phone, address, city, country, category, notes, user_id)
SELECT 
  'Sarah Williams',
  'sarah.williams@email.com',
  '+1-555-0201',
  '456 Pine Avenue',
  'Los Angeles',
  'US',
  'bride',
  'Sister of the bride, Maid of Honor',
  u.id
FROM (SELECT id FROM users WHERE role = 'user' LIMIT 1) u;

-- Insert sample budget items
INSERT INTO budgets (description, category, event_id, estimated_cost, actual_cost, notes, user_id)
SELECT 
  'Wedding Venue Rental',
  'Venue',
  e.id,
  5000.00,
  5200.00,
  'Includes tables, chairs, and basic lighting',
  u.id
FROM 
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u,
  (SELECT id FROM events WHERE title = 'Wedding Ceremony' LIMIT 1) e;

INSERT INTO budgets (description, category, event_id, estimated_cost, actual_cost, notes, user_id)
SELECT 
  'Wedding Catering',
  'Catering',
  e.id,
  8000.00,
  7800.00,
  '3-course meal for 150 guests',
  u.id
FROM 
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u,
  (SELECT id FROM events WHERE title = 'Wedding Reception' LIMIT 1) e;

INSERT INTO budgets (description, category, event_id, estimated_cost, actual_cost, notes, user_id)
SELECT 
  'Wedding Photography',
  'Photography',
  e.id,
  2500.00,
  2500.00,
  '8-hour coverage with edited photos',
  u.id
FROM 
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u,
  (SELECT id FROM events WHERE title = 'Wedding Ceremony' LIMIT 1) e;

-- Insert guest event associations (RSVP data)
INSERT INTO guest_events (guest_id, event_id, invitation_status, rsvp_status, rsvp_date, attendee_count, meal_choice, user_id)
SELECT 
  g.id,
  e.id,
  'sent',
  'confirmed',
  CURRENT_TIMESTAMP,
  2,
  'Chicken',
  u.id
FROM 
  guests g,
  events e,
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u
WHERE g.name = 'Robert Johnson' AND e.title = 'Wedding Ceremony';

INSERT INTO guest_events (guest_id, event_id, invitation_status, rsvp_status, rsvp_date, attendee_count, meal_choice, user_id)
SELECT 
  g.id,
  e.id,
  'sent',
  'confirmed',
  CURRENT_TIMESTAMP,
  2,
  'Beef',
  u.id
FROM 
  guests g,
  events e,
  (SELECT id FROM users WHERE role = 'user' LIMIT 1) u
WHERE g.name = 'Mary Johnson' AND e.title = 'Wedding Reception';

-- Show summary of inserted data
SELECT 'Users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'Events', COUNT(*) FROM events
UNION ALL
SELECT 'Tasks', COUNT(*) FROM tasks
UNION ALL
SELECT 'Guests', COUNT(*) FROM guests
UNION ALL
SELECT 'Budgets', COUNT(*) FROM budgets
UNION ALL
SELECT 'Guest Events', COUNT(*) FROM guest_events;
