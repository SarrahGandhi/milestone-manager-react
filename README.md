# MilestoneManager

A comprehensive wedding planning and event management application built with React and Node.js. MilestoneManager helps couples organize their special day with features for task management, budget tracking, guest management, RSVP handling, and more.

## 🌟 Features

### Core Functionality

- **Task Management**: Create, assign, and track wedding planning tasks with categories, priorities, and deadlines
- **Event Management**: Organize multiple events (ceremony, reception, rehearsal dinner, etc.)
- **Guest Management**: Maintain guest lists with contact information and dietary preferences
- **RSVP System**: Public wedding website for guests to confirm attendance
- **Budget Tracking**: Monitor expenses and stay within budget
- **Admin Dashboard**: Administrative controls for managing the entire planning process

### User Experience

- **Role-Based Authentication**: Different access levels for admins and regular users
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Email Notifications**: Automated RSVP confirmations sent to guests
- **Modern UI**: Clean, intuitive interface built with Bootstrap and custom CSS

## 🛠️ Tech Stack

**Frontend:**

- React 18 with Vite for fast development
- React Router for navigation
- Bootstrap 5 for responsive design
- FontAwesome for icons
- Context API for state management

**Backend:**

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT-based authentication
- Email service integration
- RESTful API architecture

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd MilestoneManager
   ```

2. **Install frontend dependencies**

   ```bash
   npm install
   ```

3. **Install backend dependencies**

   ```bash
   cd backend
   npm install
   ```



5. **Start MongoDB**
   Ensure MongoDB is running on your system



## 📁 Project Structure

```
MilestoneManager/
├── src/                          # Frontend source code
│   ├── components/              # React components
│   │   ├── Admin/              # Admin dashboard components
│   │   ├── Auth/               # Authentication components
│   │   ├── Pages/              # Main page components
│   │   └── ...
│   ├── context/                # React Context providers
│   └── services/               # API service functions
├── backend/                     # Backend source code
│   ├── src/
│   │   ├── controllers/        # Route controllers
│   │   ├── models/            # Database models
│   │   ├── routes/            # API routes
│   │   ├── middleware/        # Custom middleware
│   │   └── utils/             # Utility functions
│   └── server.js              # Express server entry point
└── public/                     # Static assets
```

## 🔧 API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Tasks

- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Events

- `GET /api/events` - Get all events
- `POST /api/events` - Create new event
- `PUT /api/events/:id` - Update event
- `DELETE /api/events/:id` - Delete event

### Guests & RSVP

- `GET /api/guests` - Get all guests
- `POST /api/guests` - Add new guest
- `POST /api/guests/:guestId/events/:eventId/rsvp` - Submit RSVP
- `GET /api/guests/lookup` - Public guest lookup for wedding website

### Budget

- `GET /api/budget` - Get budget items
- `POST /api/budget` - Create budget item
- `PUT /api/budget/:id` - Update budget item
- `DELETE /api/budget/:id` - Delete budget item

## 🎨 Key Components

- **Dashboard**: Central hub showing task progress, upcoming events, and budget overview
- **Task Manager**: Comprehensive task tracking with categories, priorities, and assignments
- **Event Management**: Create and manage multiple wedding-related events
- **Guest List**: Maintain detailed guest information with RSVP tracking
- **Wedding Website**: Public-facing RSVP portal for guests
- **Budget Tracker**: Monitor expenses across different categories
- **Admin Panel**: Administrative controls for managing the entire system




## 🚀 Deployment





## 💡 Future Enhancements

- Calendar integration
- Photo gallery management
- Vendor contact management
- Timeline and checklist templates
- Mobile app version
- Multi-language support

---

Built with ❤️ for couples planning their perfect day!
