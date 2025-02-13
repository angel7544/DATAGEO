# GPS Point & Task Management System

A web-based application for managing GPS points and tasks with user authentication.

## Features

- User Authentication (Login/Register)
- GPS Point Management
  - Add GPS points with AP Name and description
  - Export points to CSV
  - Get current location feature
- Task Management
  - Create tasks with priority levels
  - Mark tasks as complete/incomplete
  - Delete tasks
- Data Export Capabilities
- Secure user sessions

## Prerequisites

- Node.js (v20 or later)
- npm (Node Package Manager)
- MongoDB Atlas account (for database)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd gps-task-manager
```

2. Install dependencies:
```bash
npm install
```

## MongoDB Atlas Setup

1. Create a MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)

2. Create a new cluster:
   - Click "Build a Database"
   - Choose the FREE tier
   - Select your preferred provider & region
   - Click "Create Cluster"

3. Set up database access:
   - Go to Database Access
   - Add a new database user
   - Choose password authentication
   - Set username and password
   - Give read/write permissions

4. Configure network access:
   - Go to Network Access
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)

5. Get your connection string:
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string

## Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string
# Replace <password> with your database user password

# Session Secret
SESSION_SECRET=your_session_secret
```

## Converting to MongoDB Storage

To switch from in-memory storage to MongoDB:

1. Install MongoDB dependencies:
```bash
npm install mongodb mongoose
```

2. Create MongoDB schemas in `shared/mongodb-schema.ts`
3. Update the storage implementation in `server/storage.ts` to use MongoDB
4. Update the API routes to work with MongoDB models

## Running the Application

1. Start the development server:
```bash
npm run dev
```

2. Access the application:
   - Open [http://localhost:5000](http://localhost:5000) in your browser
   - Register a new account
   - Start adding GPS points and tasks

## API Endpoints

### Authentication
- POST `/api/register` - Register new user
- POST `/api/login` - Login user
- POST `/api/logout` - Logout user
- GET `/api/user` - Get current user

### GPS Points
- GET `/api/gps-points` - Get all GPS points
- POST `/api/gps-points` - Create new GPS point
- DELETE `/api/gps-points/:id` - Delete GPS point
- GET `/api/export/gps-points` - Export points to CSV

### Tasks
- GET `/api/tasks` - Get all tasks
- POST `/api/tasks` - Create new task
- PATCH `/api/tasks/:id` - Update task
- DELETE `/api/tasks/:id` - Delete task

## Security

- Passwords are hashed using scrypt
- Session management with express-session
- CSRF protection
- Rate limiting on API routes
