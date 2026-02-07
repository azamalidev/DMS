# DMS (Document Management System)

## Project Overview
A full-stack document management system with authentication, file uploads, category management, real-time notifications, and admin dashboard. Built with Node.js, Express, TypeScript, Next.js, Socket.io, Redis, and AWS S3.

## Project Setup Instructions

### Backend
1. `cd backend`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start server: `npm run dev`

### Frontend
1. `cd dms-frontend`
2. Install dependencies: `npm install`
3. Configure environment variables in `.env`
4. Start frontend: `npm run dev`

## Environment Variables List

### Backend
- `PORT` - Server port
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASS`, `DB_NAME` - Database config
- `REDIS_URL` - Redis connection string
- `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION` - AWS S3 config
- `ADMIN_SECRET` - Admin registration secret
- `JWT_SECRET` - JWT signing secret
- `SOCKET_URL` - Socket.io server URL

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_SOCKET_URL` - Socket.io server URL

## Database Setup Instructions
- Use PostgreSQL or MySQL
- Create database and user
- Update `.env` with credentials
- Run migrations if needed

## AWS S3 Setup Instructions
- Create S3 bucket
- Set permissions for file upload
- Update `.env` with keys and bucket name

## Redis Setup Instructions
- Install Redis server
- Start Redis
- Update `.env` with Redis URL

## Socket.io Setup Instructions
- Socket.io is auto-configured in backend
- Ensure `SOCKET_URL` is set in frontend and backend

## How to Run the Application
1. Start Redis and database
2. Start backend (`npm run dev` in backend)
3. Start frontend (`npm run dev` in dms-frontend)
4. Access frontend at `http://localhost:3000`

## API Endpoints Documentation

### Auth
- `POST /api/auth/register` - Register user/admin
- `POST /api/auth/login` - Login

### Documents
- `GET /api/documents` - List documents
- `POST /api/documents/upload` - Upload document
- `PUT /api/documents/:id` - Edit document
- `DELETE /api/documents/:id` - Delete document

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)

### Users
- `GET /api/users` - List users (admin)

### Dashboard
- `GET /api/dashboard/stats` - Dashboard stats (admin)
- `GET /api/active-users` - Real-time active users (admin)

### Notifications
- `GET /api/notifications` - List notifications
- `PUT /api/notifications/:id/read` - Mark as read

## Socket.io Events Documentation
- `joinRoom` - User joins their room (userId)
- `activeUsers` - Emits list of active user IDs
- `document:deleted` - Document deleted
- `document:updated` - Document updated
- `category:created` - Category created

## Troubleshooting Guide
- Check `.env` for correct values
- Ensure Redis and database are running
- Check AWS S3 permissions
- Socket.io not connecting? Check CORS and URLs
- Use logs for debugging

## Testing Instructions

### Authentication
- Register and login via frontend
- Test admin registration with `ADMIN_SECRET`

### File Upload
- Upload documents as user
- Check S3 bucket for files

### Document Management
- Edit/delete documents
- Check real-time updates

### Redis Caching
- Check Redis for cached data (if implemented)

### Socket.io Real-Time Features
- Open multiple clients
- Edit/delete/upload documents and see real-time updates
- Check active users in admin dashboard

### Multiple Clients
- Open app in multiple browsers
- Test real-time features

### Test Credentials
- Register new users
- For admin: use `ADMIN_SECRET` during registration

---
For any issues, check logs and environment variables. All features are documented above.