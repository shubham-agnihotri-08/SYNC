# Employee Features Documentation

## Attendance Management

### Features Implemented:
- **Check In**: Employees can check in at the start of their workday
- **Pause/Break**: Start a break during work hours
- **Resume**: End break and continue working
- **Check Out**: End the workday

### How It Works:
1. Employee navigates to "Attendance" (dashboard)
2. Click "Check In" button to start the day
3. During the day, click "Pause" to take a break
4. Click "Resume" to end the break
5. Click "Check Out" to end the workday

### Attendance Tracking:
- Real-time display of check-in time, working hours, break time, and check-out time
- Attendance history table showing past 10 records
- Status badges (Present, Absent, Short Leave, Half Day, On Leave)

## Leave Management

### Features Implemented:
- **Request Leave**: Submit leave requests with type, dates, and reason
- **Leave Balance**: View remaining leave days by category
- **Leave History**: View all past leave requests with status

### Leave Types:
- Sick Leave (7/8 days available)
- Casual Leave (4/5 days available)
- Annual Leave (4/6 days available)

### How to Request Leave:
1. Navigate to "Leave & Holidays"
2. Click "Request Leave" button
3. Select leave type from dropdown
4. Choose start and end dates
5. Provide a reason
6. Click "Submit Request"
7. Wait for admin approval

## Cabin Booking

### Features Implemented:
- **View Available Cabins**: See all cabins with capacity and availability
- **Book Cabin**: Reserve a cabin for a specific date and time
- **Booking History**: View all past and upcoming bookings

### How to Book a Cabin:
1. Navigate to "Cabin Booking"
2. Browse available cabins (shows capacity, opening hours, max booking time)
3. Click "Submit Request" button
4. Fill in the booking form:
   - Select cabin
   - Choose date
   - Set duration
   - Specify start and end time
   - Provide purpose
5. Click "Submit Request"
6. Wait for admin confirmation

### Booking Details:
Each cabin card displays:
- Cabin name with color indicator
- Capacity
- Operating hours
- Maximum booking duration
- Availability status

## API Endpoints Used

### Attendance:
- `POST /api/attendance/check-in` - Start workday
- `POST /api/attendance/check-out` - End workday
- `POST /api/attendance/pause` - Start break
- `POST /api/attendance/resume` - End break
- `GET /api/attendance/today` - Fetch today's attendance and history

### Leave Requests:
- `POST /api/leave-requests` - Submit new leave request
- `GET /api/leave-requests` - Fetch all leave requests for logged-in user

### Cabin Bookings:
- `POST /api/cabin-bookings` - Create new cabin booking
- `GET /api/cabin-bookings` - Fetch all bookings for logged-in user
- `GET /api/cabins` - Fetch all available cabins

## Status Tracking

All employee actions result in status updates:
- **Attendance**: Present, Absent, Short Leave, Half Day, On Leave
- **Leave Requests**: Pending, Approved, Rejected
- **Cabin Bookings**: Pending, Confirmed, Cancelled

## User Interface

All employee pages follow the design specifications:
- Dark sidebar with SYNC branding
- Clean card-based layouts
- Real-time data updates
- Toast notifications for all actions
- Responsive design for all screen sizes
```

```tsx file="" isHidden
