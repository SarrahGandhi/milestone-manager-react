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

4. **Environment Setup**
   Create a `.env` file in the `backend` directory:

   ```env
   MONGODB_URI=mongodb://localhost:27017/milestone-manager
   PORT=5000
   NODE_ENV=development
   JWT_SECRET=your-jwt-secret-key

   # Email Configuration (for RSVP confirmations)
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```

5. **Start MongoDB**
   Ensure MongoDB is running on your system

6. **Seed the database** (optional)

   ```bash
   cd backend
   npm run seed:tasks
   ```

7. **Start the development servers**

   Backend (from backend directory):

   ```bash
   npm run dev
   ```

   Frontend (from root directory):

   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000`

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

## 📧 Email Configuration

For RSVP email confirmations:

1. Enable 2-factor authentication on your Gmail account
2. Generate an App Password: Google Account Settings > Security > App passwords
3. Use your Gmail address as `EMAIL_USER` and the app password as `EMAIL_PASS`

## 🚀 Deployment

### Frontend (Vite)

```bash
npm run build
npm run preview
```

### Backend

Configure environment variables for production and deploy to your preferred hosting service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💡 Future Enhancements

- Calendar integration
- Photo gallery management
- Vendor contact management
- Timeline and checklist templates
- Mobile app version
- Multi-language support

---

Built with ❤️ for couples planning their perfect day!
