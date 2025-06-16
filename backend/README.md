# Milestone Manager Backend

## Setup Instructions

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Variables**
   Create a `.env` file in the backend directory with the following variables:

   ```
   MONGODB_URI=mongodb://localhost:27017/milestone-manager
   PORT=5000
   NODE_ENV=development

   # Email Configuration for RSVP Confirmations
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

   **Email Setup Instructions:**

   - For Gmail: Enable 2-factor authentication and create an App Password
   - Go to: Google Account Settings > Security > 2-Step Verification > App passwords
   - Generate a new app password and use it as EMAIL_PASS
   - Use your Gmail address as EMAIL_USER

3. **Start MongoDB**
   Make sure MongoDB is running on your local machine or update the MONGODB_URI to point to your MongoDB instance.

4. **Seed the Database**
   Run the following command to populate the database with sample tasks:

   ```bash
   npm run seed:tasks
   ```

5. **Start the Server**
   ```bash
   npm run dev
   ```

## API Endpoints

### Tasks

- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `PUT /api/tasks/:id/toggle` - Toggle task completion
- `GET /api/tasks/stats` - Get task statistics
- `GET /api/tasks/upcoming` - Get upcoming tasks
- `GET /api/tasks/overdue` - Get overdue tasks
- `GET /api/tasks/category/:category` - Get tasks by category
- `GET /api/tasks/priority/:priority` - Get tasks by priority

### Events

- `GET /api/events` - Get all events
- `GET /api/events/:id` - Get event by ID
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Guests

- `GET /api/guests` - Get all guests
- `GET /api/guests/:id` - Get guest by ID
- `POST /api/guests` - Create new guest
- `PUT /api/guests/:id` - Update guest
- `DELETE /api/guests/:id` - Delete guest
- `POST /api/guests/:guestId/events/:eventId/rsvp` - Submit/Update RSVP
- `DELETE /api/guests/:guestId/events/:eventId/rsvp` - Cancel RSVP
- `GET /api/guests/lookup` - Lookup guest by name for wedding website

## Database Schema

### Task Model

- `title` (String, required)
- `description` (String)
- `dueDate` (Date, required)
- `category` (String, enum: Budget, Venue, Vendors, Planning, Other)
- `priority` (String, enum: low, medium, high)
- `completed` (Boolean, default: false)
- `assignedTo` (String)
- `estimatedTime` (Number, in hours)
- `actualTime` (Number, in hours)
- `notes` (String)
- `tags` (Array of Strings)
- `subtasks` (Array of objects with title and completed)
- `completedAt` (Date)
- `reminders` (Array of objects with date and message)
- `relatedEvent` (ObjectId, ref: Event)

## Features

### RSVP Email Confirmations

When guests submit their RSVP through the wedding website, they can opt to receive an email confirmation. The system will automatically send a beautifully formatted email with:

- Event details (title, date, location)
- RSVP status confirmation
- Dietary restrictions and special requests (if provided)
- Wedding couple's message

**Note:** Make sure to configure the EMAIL_USER and EMAIL_PASS environment variables for email functionality to work.
