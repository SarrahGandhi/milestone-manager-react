# Role-Based Authentication Implementation Guide

## Overview

This guide explains how to implement role-based authentication in your MilestoneManager application. The system supports two roles: `user` and `admin`.

## Features Implemented

### 1. Updated AuthContext

- Added user data and role information to the context
- Included helper functions: `isAdmin()`, `isUser()`, `canAdd()`, `canEdit()`, `canDelete()`

### 2. RoleGuard Component

Location: `src/components/Auth/RoleGuard.jsx`

Use this component to conditionally render content based on user roles:

```jsx
import RoleGuard from '../Auth/RoleGuard';

// Only admins can see this content
<RoleGuard requireAdmin>
  <button>Delete Item</button>
</RoleGuard>

// Only users can see this content
<RoleGuard requireUser>
  <p>User-specific content</p>
</RoleGuard>

// Multiple roles allowed
<RoleGuard allowedRoles={['admin', 'user']}>
  <p>Content for both roles</p>
</RoleGuard>
```

### 3. AdminRoute Component

Location: `src/components/Auth/AdminRoute.jsx`

Use this to protect entire routes that should only be accessible to admins:

```jsx
import AdminRoute from "../Auth/AdminRoute";

<Route
  path="/admin-only-page"
  element={
    <AdminRoute>
      <AdminOnlyComponent />
    </AdminRoute>
  }
/>;
```

## How to Update Your Components

### Method 1: Using RoleGuard Component

```jsx
import { useAuth } from "../../context/AuthContext";
import RoleGuard from "../Auth/RoleGuard";

const MyComponent = () => {
  return (
    <div>
      <h1>My Component</h1>

      {/* Everyone can see this */}
      <button>View</button>

      {/* Only admins can see these */}
      <RoleGuard requireAdmin>
        <button>Edit</button>
        <button>Delete</button>
        <button>Add New</button>
      </RoleGuard>
    </div>
  );
};
```

### Method 2: Using Auth Context Directly

```jsx
import { useAuth } from "../../context/AuthContext";

const MyComponent = () => {
  const { canEdit, canDelete, canAdd, isAdmin, user } = useAuth();

  return (
    <div>
      <h1>My Component</h1>
      <button>View</button>

      {canEdit() && <button>Edit</button>}
      {canDelete() && <button>Delete</button>}
      {canAdd() && <button>Add New</button>}

      {isAdmin() && (
        <div>
          <h3>Admin Controls</h3>
          <button>Admin Action</button>
        </div>
      )}
    </div>
  );
};
```

## Components to Update

You should update the following components to hide add/edit/delete buttons from regular users:

1. **Events Component** (`src/components/Pages/Events/Events.jsx`)

   - Hide "Add Event" button for users
   - Hide edit/delete buttons in event cards for users

2. **TaskManager Component** (`src/components/Pages/TaskManager.jsx`)

   - Hide "Add Task" button for users
   - Hide edit/delete task buttons for users

3. **Budget Component** (`src/components/Pages/Budget/Budget.jsx`)

   - Hide add/edit/delete budget items for users

4. **EventDetails Component** (`src/components/Pages/Events/EventDetails.jsx`)
   - Hide edit/delete buttons for users

## Available Auth Context Methods

```jsx
const {
  user, // Current user object with role info
  isAuthenticated, // Boolean - is user logged in
  isLoading, // Boolean - is auth check in progress
  login, // Function to log in
  logout, // Function to log out
  hasRole, // Function to check specific role
  isAdmin, // Function - returns true if user is admin
  isUser, // Function - returns true if user is regular user
  canEdit, // Function - returns true if user can edit (admin only)
  canAdd, // Function - returns true if user can add (admin only)
  canDelete, // Function - returns true if user can delete (admin only)
} = useAuth();
```

## User Roles in Database

The User model already supports roles with these values:

- `"user"` - Regular user (default)
- `"admin"` - Administrator

## Routes Updated

- `/events/add` - Now protected with `AdminRoute`
- `/events/edit/:eventId` - Now protected with `AdminRoute`

Add more admin-only routes as needed using the same pattern.

## Testing

To test the role-based authentication:

1. Create a user with role "user" - should not see add/edit/delete buttons
2. Create a user with role "admin" - should see all functionality
3. Try accessing admin-only routes with both user types

## Next Steps

Update your existing components by:

1. Importing the `RoleGuard` component or using the auth context
2. Wrapping add/edit/delete buttons with role checks
3. Testing with both user types
