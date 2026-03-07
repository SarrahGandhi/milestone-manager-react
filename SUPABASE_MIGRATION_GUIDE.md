# Supabase Migration Guide

This guide outlines the migration from MongoDB/Render to Supabase PostgreSQL for the Milestone Manager application.

## 🎯 Migration Overview

Your backend has been successfully migrated from:

- **Database**: MongoDB Atlas → Supabase PostgreSQL
- **ORM**: Mongoose → Supabase Client
- **Hosting**: Render → (Ready for deployment)

## 🔧 Configuration Required

### 1. Environment Variables

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Supabase Configuration
SUPABASE_URL=https://uvonrgvmptmkgpvqnooa.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key_here

# Database Configuration (direct PostgreSQL if needed)
PGHOST=db.uvonrgvmptmkgpvqnooa.supabase.co
PGPORT=5432
PGDATABASE=postgres
PGUSER=postgres
PGPASSWORD=your_postgres_password_here

# Application Configuration
JWT_SECRET=milestone_manager_super_secret_key_2024_wedding_planning_app
NODE_ENV=development
PORT=5001

# Email Configuration (optional)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

# Cloudinary Configuration (optional)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 2. Get Your Supabase Keys

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `uvonrgvmptmkgpvqnooa`
3. Go to Settings → API
4. Copy your `anon/public` key and add it to `SUPABASE_ANON_KEY`
5. Set your database password (if you don't have it, reset it in Settings → Database)

## 🗄️ Database Setup

### Option 1: Use the Migration Script (Recommended)

```bash
cd backend
npm install
npm run db:create
```

### Option 2: Manual SQL Execution

1. Go to your Supabase Dashboard → SQL Editor
2. Copy the contents of `backend/src/config/schema.sql`
3. Paste and execute the SQL

## 📦 Installation & Setup

1. **Install Dependencies**:

   ```bash
   cd backend
   npm install
   ```

2. **Create Database Tables**:

   ```bash
   npm run db:create
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## 🔄 Migration Changes Summary

### Database Schema Changes

| MongoDB Collection | PostgreSQL Table                                             | Changes                                  |
| ------------------ | ------------------------------------------------------------ | ---------------------------------------- |
| `users`            | `users`                                                      | ObjectId → UUID, camelCase → snake_case  |
| `events`           | `events` + `event_attendees` + `event_reminders`             | Separated arrays into related tables     |
| `tasks`            | `tasks` + `task_subtasks` + `task_reminders`                 | Separated arrays into related tables     |
| `guests`           | `guests` + `guest_selected_events` + `guest_event_attendees` | Normalized relationships                 |
| `guestevents`      | `guest_events`                                               | Merged plus-one fields                   |
| `budgets`          | `budgets`                                                    | Direct migration with proper constraints |

### Code Changes

1. **Models**: Converted from Mongoose schemas to Supabase query classes
2. **Validation**: Updated to use UUIDs instead of ObjectIds
3. **Server**: Replaced MongoDB connection with Supabase initialization
4. **Data Format**: Auto-conversion between camelCase (frontend) and snake_case (database)

### Key Features Maintained

✅ User authentication and authorization
✅ All CRUD operations for all entities
✅ Data relationships and foreign keys
✅ Validation and error handling
✅ Timestamps and audit trails
✅ Array and object field support

## 🚀 Testing the Migration

### 1. Health Check

```bash
curl http://localhost:5001/api/health
```

### 2. Test User Registration

```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

### 3. Test Login

```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "identifier": "test@example.com",
    "password": "password123"
  }'
```

## 🔍 Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**

   - Verify your `SUPABASE_ANON_KEY` is correct
   - Check your Supabase project URL

2. **Connection Errors**

   - Ensure your Supabase project is active
   - Check your internet connection
   - Verify the database host and credentials

3. **Table Not Found Errors**

   - Run the database creation script: `npm run db:create`
   - Or manually execute the SQL schema

4. **Permission Errors**
   - Check Row Level Security (RLS) settings in Supabase
   - Ensure your API key has the correct permissions

### Getting Help

If you encounter issues:

1. Check the server logs for detailed error messages
2. Verify your `.env` file configuration
3. Test your Supabase connection in the dashboard
4. Review the SQL schema for any missing tables

## 📋 Next Steps

1. **Data Migration**: If you have existing data, you'll need to export from MongoDB and import to PostgreSQL
2. **Row Level Security**: Consider enabling RLS policies in Supabase for enhanced security
3. **Indexes**: The schema includes basic indexes, but you may want to add more for performance
4. **Backup Strategy**: Set up automated backups in your Supabase dashboard
5. **Monitoring**: Configure logging and monitoring for your new database

## 🎉 Success!

Your Milestone Manager backend is now running on Supabase PostgreSQL! The migration maintains all existing functionality while providing:

- ✅ Better performance with PostgreSQL
- ✅ Real-time capabilities (if needed)
- ✅ Built-in auth options
- ✅ Automatic API generation
- ✅ Better scaling options
- ✅ SQL-based queries for complex operations

Enjoy your new Supabase-powered backend! 🚀
