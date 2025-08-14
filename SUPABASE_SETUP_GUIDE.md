# 🚀 Supabase Setup Guide for Milestone Manager

This guide will help you set up Supabase as the database for your Milestone Manager application, replacing MongoDB completely.

## 📋 Prerequisites

- Node.js (v16 or higher)
- A Supabase account (free tier available)
- Git

## 🔧 Step 1: Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in to your account
3. Click "New Project"
4. Choose your organization
5. Fill in project details:
   - **Name**: `milestone-manager` (or your preferred name)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the closest region to your users
6. Click "Create new project"
7. Wait for the project to be created (this may take a few minutes)

## 🔑 Step 2: Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **Anon public key** (starts with `eyJ...`)

## 🗄️ Step 3: Create Database Tables

1. In your Supabase dashboard, go to **SQL Editor**
2. Click "New query"
3. Copy and paste the following SQL schema:

\`\`\`sql
-- Milestone Manager Database Schema for Supabase PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
username VARCHAR(30) UNIQUE NOT NULL CHECK (LENGTH(username) >= 3),
email VARCHAR(255) UNIQUE NOT NULL,
password VARCHAR(255) NOT NULL CHECK (LENGTH(password) >= 6),
first_name VARCHAR(50) NOT NULL,
last_name VARCHAR(50) NOT NULL,
role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
is_active BOOLEAN DEFAULT true,
last_login TIMESTAMP,
reset_password_token VARCHAR(255),
reset_password_expires TIMESTAMP,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
title VARCHAR(255) NOT NULL,
description TEXT,
event_date DATE NOT NULL,
start_time VARCHAR(10) NOT NULL,
end_time VARCHAR(10),
location VARCHAR(255) NOT NULL,
dress_code VARCHAR(255),
menu TEXT[], -- Array of strings for menu items
additional_details TEXT,
category VARCHAR(50) DEFAULT 'other' CHECK (category IN ('milestone', 'meeting', 'celebration', 'deadline', 'workshop', 'other')),
priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
organizer VARCHAR(255) NOT NULL,
status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'cancelled', 'completed')),
max_attendees INTEGER,
registration_required BOOLEAN DEFAULT false,
tags TEXT[], -- Array of strings for tags
notes TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event attendees table (for the attendees array in the original schema)
CREATE TABLE IF NOT EXISTS event_attendees (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
name VARCHAR(255) NOT NULL,
email VARCHAR(255),
role VARCHAR(100),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Event reminders table (for the reminders array in the original schema)
CREATE TABLE IF NOT EXISTS event_reminders (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
type VARCHAR(100) NOT NULL,
time TIMESTAMP NOT NULL,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
title VARCHAR(255) NOT NULL,
description TEXT,
due_date TIMESTAMP NOT NULL,
category VARCHAR(50) DEFAULT 'Other' CHECK (category IN ('Budget', 'Venue', 'Vendors', 'Planning', 'Other')),
priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
completed BOOLEAN DEFAULT false,
assigned_to UUID REFERENCES users(id),
estimated_time DECIMAL(5,2), -- in hours
actual_time DECIMAL(5,2), -- in hours
notes TEXT,
tags TEXT[], -- Array of strings for tags
completed_at TIMESTAMP,
related_event UUID REFERENCES events(id),
user_id UUID NOT NULL REFERENCES users(id),
created_by UUID NOT NULL REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task subtasks table (for the subtasks array in the original schema)
CREATE TABLE IF NOT EXISTS task_subtasks (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
title VARCHAR(255) NOT NULL,
completed BOOLEAN DEFAULT false,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Task reminders table (for the reminders array in the original schema)
CREATE TABLE IF NOT EXISTS task_reminders (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
date TIMESTAMP NOT NULL,
message TEXT,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Guests table
CREATE TABLE IF NOT EXISTS guests (
id UUID PRIMARY KEY DEFAULT uuid*generate_v4(),
name VARCHAR(255) NOT NULL,
email VARCHAR(255),
phone VARCHAR(50),
address TEXT,
city VARCHAR(100),
country VARCHAR(100) DEFAULT 'US',
category VARCHAR(20) NOT NULL CHECK (category IN ('bride', 'groom')),
notes TEXT,
user_id UUID REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
CONSTRAINT valid_email CHECK (email IS NULL OR email ~\* '^[A-Za-z0-9.*%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
);

-- Guest selected events table (for the selectedEvents array)
CREATE TABLE IF NOT EXISTS guest_selected_events (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(guest_id, event_id)
);

-- Guest event attendees table (for the eventAttendees object)
CREATE TABLE IF NOT EXISTS guest_event_attendees (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
guest_id UUID REFERENCES guests(id) ON DELETE CASCADE,
event_id UUID REFERENCES events(id) ON DELETE CASCADE,
men INTEGER DEFAULT 0,
women INTEGER DEFAULT 0,
kids INTEGER DEFAULT 0,
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(guest_id, event_id)
);

-- Guest events table (replaces GuestEvent model)
CREATE TABLE IF NOT EXISTS guest_events (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
guest_id UUID NOT NULL REFERENCES guests(id) ON DELETE CASCADE,
event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
invitation_status VARCHAR(20) DEFAULT 'not_sent' CHECK (invitation_status IN ('not_sent', 'sent', 'delivered', 'opened')),
rsvp_status VARCHAR(20) DEFAULT 'pending' CHECK (rsvp_status IN ('pending', 'confirmed', 'declined', 'maybe')),
rsvp_date TIMESTAMP,
attendee_count INTEGER DEFAULT 1 CHECK (attendee_count >= 0),
meal_choice VARCHAR(255),
special_requests TEXT,
plus_one_name VARCHAR(255),
plus_one_dietary_restrictions TEXT,
notes TEXT,
user_id UUID REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
UNIQUE(guest_id, event_id)
);

-- Budgets table
CREATE TABLE IF NOT EXISTS budgets (
id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
description VARCHAR(255) NOT NULL,
category VARCHAR(50) NOT NULL CHECK (category IN ('Venue', 'Catering', 'Decor', 'Entertainment', 'Photography', 'Attire', 'Transportation', 'Gifts', 'Other')),
event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
estimated_cost DECIMAL(10,2) NOT NULL CHECK (estimated_cost >= 0),
actual_cost DECIMAL(10,2) DEFAULT 0 CHECK (actual_cost >= 0),
notes TEXT,
user_id UUID NOT NULL REFERENCES users(id),
created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_events_date ON events(event_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_completed ON tasks(completed);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);

CREATE INDEX IF NOT EXISTS idx_guests_user_id ON guests(user_id);
CREATE INDEX IF NOT EXISTS idx_guests_name ON guests(name);
CREATE INDEX IF NOT EXISTS idx_guests_category ON guests(category);
CREATE INDEX IF NOT EXISTS idx_guests_email ON guests(email);

CREATE INDEX IF NOT EXISTS idx_guest_events_user_id ON guest_events(user_id);
CREATE INDEX IF NOT EXISTS idx_guest_events_event_id ON guest_events(event_id);
CREATE INDEX IF NOT EXISTS idx_guest_events_rsvp_status ON guest_events(rsvp_status);

CREATE INDEX IF NOT EXISTS idx_budgets_event_id ON budgets(event_id);
CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets(user_id);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category);

-- Create trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = CURRENT_TIMESTAMP;
RETURN NEW;
END;

$$
language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_guest_events_updated_at BEFORE UPDATE ON guest_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
\`\`\`

4. Click **Run** to execute the SQL
5. You should see "Success. No rows returned" message

## ⚙️ Step 4: Configure Environment Variables

1. Navigate to your backend directory:
   \`\`\`bash
   cd backend
   \`\`\`

2. Create a `.env` file:
   \`\`\`bash
   touch .env
   \`\`\`

3. Add your Supabase credentials to the `.env` file:
   \`\`\`env
   # Supabase Configuration
   SUPABASE_URL=your_supabase_project_url_here
   SUPABASE_ANON_KEY=your_supabase_anon_key_here

   # JWT Configuration
   JWT_SECRET=your_jwt_secret_here

   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # Email Configuration (optional)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password

   # Cloudinary Configuration (optional)
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   \`\`\`

   **Replace the placeholder values with your actual credentials:**
   - `your_supabase_project_url_here` → Your Project URL from Step 2
   - `your_supabase_anon_key_here` → Your Anon public key from Step 2
   - `your_jwt_secret_here` → A random string for JWT signing (e.g., generate with `openssl rand -base64 32`)

## 🌱 Step 5: Seed Sample Data

1. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`

2. Run the seeding script to populate your database with sample data:
   \`\`\`bash
   npm run seed:all
   \`\`\`

   This will create:
   - Sample users (admin and regular users)
   - Sample events (wedding ceremony, reception, rehearsal dinner)
   - Sample tasks (venue booking, invitations, etc.)
   - Sample guests with RSVP data
   - Sample budget items

## 🚀 Step 6: Start the Application

1. Start the backend server:
   \`\`\`bash
   npm run dev
   \`\`\`

2. In a new terminal, start the frontend:
   \`\`\`bash
   cd ../
   npm run dev
   \`\`\`

## 🔐 Default Login Credentials

After seeding, you can log in with these accounts:

**Admin User:**
- Username: `admin`
- Email: `admin@milestonemanager.com`
- Password: `admin123`

**Regular User:**
- Username: `john_doe`
- Email: `john@example.com`
- Password: `admin123`

## 🗃️ Database Tables Created

The setup creates the following tables:

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `events` | Wedding events and milestones |
| `event_attendees` | Event attendee information |
| `event_reminders` | Event reminder settings |
| `tasks` | Task management and tracking |
| `task_subtasks` | Subtasks for main tasks |
| `task_reminders` | Task reminder notifications |
| `guests` | Guest list management |
| `guest_selected_events` | Guest event selections |
| `guest_event_attendees` | Guest attendance counts |
| `guest_events` | RSVP and invitation tracking |
| `budgets` | Budget planning and tracking |

## 🔧 Troubleshooting

### Common Issues:

1. **"supabaseKey is required" error:**
   - Make sure your `.env` file has the correct `SUPABASE_ANON_KEY`
   - Restart your server after adding environment variables

2. **Connection errors:**
   - Verify your `SUPABASE_URL` is correct
   - Check that your Supabase project is active
   - Ensure your internet connection is stable

3. **SQL execution errors:**
   - Make sure you copied the entire SQL schema
   - Check for any syntax errors in the SQL Editor
   - Try running the schema in smaller chunks if needed

4. **Seeding fails:**
   - Ensure tables are created first
   - Check that your environment variables are set correctly
   - Look at the console output for specific error messages

### Getting Help:

- Check the Supabase documentation: [https://supabase.com/docs](https://supabase.com/docs)
- Review the application logs for detailed error messages
- Ensure all dependencies are installed with `npm install`

## 🎉 Success!

You should now have:
- ✅ Supabase database with all required tables
- ✅ Sample data populated
- ✅ Backend connected to Supabase
- ✅ Frontend ready to use
- ✅ No MongoDB dependencies

Your Milestone Manager application is now fully migrated to Supabase! 🚀
$$
