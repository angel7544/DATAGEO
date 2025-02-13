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

# Session Secret
SESSION_SECRET=your_session_secret

# Frontend URL (CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app
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

## Deployment

### Frontend Deployment (Vercel)

1. Create a Vercel account at [vercel.com](https://vercel.com)

2. Install Vercel CLI:
```bash
npm install -g vercel
```

3. Build the frontend:
```bash
npm run build
```

4. Deploy to Vercel:
```bash
vercel
```

Follow the prompts to complete the deployment.

### Frontend Deployment (Netlify)

1. Create a Netlify account at [netlify.com](https://netlify.com)

2. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

3. Build the frontend:
```bash
npm run build
```

4. Deploy to Netlify:
```bash
netlify deploy
```

Follow the prompts and specify `dist/public` as your publish directory.

### Backend Deployment

Since this is a full-stack application, you'll need to deploy the backend separately. Here are some recommended platforms:

1. Railway (recommended):
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository
   - Railway will automatically detect your Node.js application
   - Set your environment variables in the Railway dashboard

2. Render:
   - Visit [render.com](https://render.com)
   - Create a new Web Service
   - Connect your repository
   - Set the build command to `npm install && npm run build`
   - Set the start command to `npm start`

### Environment Variables

Make sure to set these environment variables in your deployment platform:

```env
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Session Secret
SESSION_SECRET=your_session_secret

# Frontend URL (CORS)
FRONTEND_URL=https://your-frontend-url.vercel.app