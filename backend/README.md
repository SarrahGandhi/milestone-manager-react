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
   ```

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
