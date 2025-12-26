# SYNC - Cabin Booking & Attendance Management System

A comprehensive full-stack application for managing employee attendance, cabin bookings, leave requests, and events.

## Features

- **Role-Based Access Control**: Separate dashboards for Admin and Employee users
- **Attendance Management**: Track employee check-ins, check-outs, and working hours
- **Cabin Booking System**: Reserve cabins with conflict prevention
- **Leave Management**: Request and approve leaves with multiple leave types
- **Events Calendar**: View and manage company events
- **Progressive Web App**: Installable on mobile and desktop with offline support
- **Secure Authentication**: JWT-based authentication with HTTP-only cookies

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: MySQL with Prisma ORM
- **Authentication**: Custom JWT-based auth (no next-auth)
- **UI**: Tailwind CSS v4 + shadcn/ui components
- **PWA**: Service Worker + Web App Manifest

## Setup Instructions

1. **Clone and Install**
   ```bash
   npm install
   ```

2. **Configure Database**
   
   Create a `.env` file:
   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/cabin_booking"
   ADMIN_NAME="System Admin"
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="Admin@123"
   JWT_SECRET="your-super-secret-jwt-key"
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

3. **Setup Database**
   ```bash
   npx prisma generate
   npx prisma db push
   npx prisma db seed
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```

5. **First Login**
   - Navigate to `http://localhost:3000`
   - Login with admin credentials (from .env):
     - Email: admin@example.com
     - Password: Admin@123

## User Roles

### Admin
- Dashboard with overview stats
- Manage all employee attendance
- Approve/reject leave requests
- Manage cabins and bookings
- Create and manage events
- Add new employees with password setup
- View and generate reports

### Employee
- **Attendance Management**: 
  - Check-in at start of day
  - Pause/Resume for breaks
  - Check-out at end of day
  - View attendance history with working hours
- **Leave Requests**:
  - Submit leave requests (Sick, Casual, Annual)
  - View leave balance by type
  - Track request status (Pending, Approved, Rejected)
- **Cabin Booking**:
  - Browse available cabins
  - Book cabins with date, time, and purpose
  - View booking history and status

## Database Schema

- **User**: Stores admin and employee accounts
- **Attendance**: Daily attendance records
- **LeaveRequest**: Leave applications with approval workflow
- **Cabin**: Meeting room/cabin details
- **CabinBooking**: Cabin reservation records
- **Event**: Company events and holidays

## PWA Features

- Installable on mobile and desktop
- Offline app shell caching
- Fast load times with service worker
- Add to home screen capability

## Security

- Password hashing with bcrypt
- JWT tokens stored in HTTP-only cookies
- Role-based route protection via middleware
- Secure session management

## Deployment

1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Attendance (Employee)
- `POST /api/attendance/check-in` - Start workday
- `POST /api/attendance/check-out` - End workday
- `POST /api/attendance/pause` - Start break
- `POST /api/attendance/resume` - End break
- `GET /api/attendance/today` - Fetch today's attendance

### Leave Requests
- `POST /api/leave-requests` - Submit leave request
- `GET /api/leave-requests` - Get user's leave requests

### Cabin Bookings
- `POST /api/cabin-bookings` - Create booking
- `GET /api/cabin-bookings` - Get user's bookings

### Admin APIs
- `POST /api/employees` - Add new employee
- `GET /api/employees` - List all employees
- `POST /api/cabins` - Add new cabin
- `GET /api/cabins` - List all cabins
- `POST /api/events` - Create event
- `GET /api/events` - List all events

## License

Proprietary - Internal Use Only
