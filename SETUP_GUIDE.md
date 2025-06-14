# StaffIn Performance Review System - Setup Guide

## Current Status and Issues

The application has been analyzed and several issues have been identified and partially fixed:

### Issues Found:
1. **Missing json-server dependency** - Added to package.json
2. **Inconsistent API base URLs** - Different services were using different ports
3. **Missing data collections** - Several modules expected data that wasn't in db.json
4. **Incomplete db.json structure** - Missing endpoints for various modules

### Fixes Applied:
1. ✅ Added json-server and concurrently to package.json
2. ✅ Added npm scripts for running json-server
3. ✅ Updated API services to use consistent configuration
4. ✅ Added missing data collections to db.json:
   - regularizations
   - attendance-settings
   - applications (separate from job-applications)

## How to Run the Application

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation
```bash
# Install dependencies (you may need to run this)
npm install
```

### Running the Application

#### Option 1: Run both frontend and backend together
```bash
npm run dev:full
```
This will start both json-server (port 8090) and the React app (port 5173) concurrently.

#### Option 2: Run separately
```bash
# Terminal 1: Start json-server
npm run server

# Terminal 2: Start React app
npm run dev
```

### API Endpoints Available

The json-server will provide these endpoints at `http://localhost:8090`:

#### Core Data
- `/users` - User accounts
- `/employees` - Employee details
- `/departments` - Department information
- `/roles` - User roles and permissions

#### Leave Management
- `/leave-types` - Types of leave available
- `/leave-requests` - Leave applications
- `/leave-balances` - Employee leave balances

#### Attendance
- `/attendance-records` - Daily attendance records
- `/permissions` - Permission requests
- `/regularizations` - Attendance regularization requests
- `/attendance-settings` - Attendance configuration

#### Goals & Performance
- `/goals` - Individual goals
- `/goals-groups` - Goal groups/collections

#### Recruitment
- `/jobs` - Job postings
- `/job-applications` - Job applications with full details
- `/applications` - Simplified applications endpoint

#### Other Modules
- `/shifts` - Work shifts
- `/employee-shifts` - Employee shift assignments
- `/transfers` - Employee transfer requests
- `/holidays` - Holiday calendar
- `/holiday-lists` - Holiday list management

#### Dashboard
- `/dashboard-stats` - Dashboard statistics
- `/activities` - Recent activities
- `/events` - Upcoming events

## Still Missing / Needs Attention

### 1. Additional Data Collections
Some modules may still expect additional endpoints:
- Attendance clock-in/out endpoints (these need special handling)
- File upload endpoints for documents
- Complex nested endpoints for approvals

### 2. Authentication
The app uses mock authentication. Real authentication would need:
- JWT token validation
- User session management
- Role-based access control

### 3. File Uploads
Some features expect file upload capabilities:
- Resume uploads for recruitment
- Document attachments for transfers
- Supporting documents for regularizations

### 4. Complex API Operations
Some operations may not work with simple json-server:
- Workflow approvals
- Status transitions
- Calculated fields (like leave balances)

## Recommended Next Steps

1. **Install dependencies**: Run `npm install` to get json-server and concurrently
2. **Test the setup**: Run `npm run dev:full` and check if the app loads
3. **Check browser console**: Look for any remaining API errors
4. **Add missing data**: If specific modules still show "no data", add the required collections to db.json
5. **Consider upgrading**: For production, consider replacing json-server with a proper backend

## Troubleshooting

### Port Conflicts
If port 8090 is in use:
1. Change the port in package.json scripts
2. Update the baseURL in service files
3. Or kill the process using port 8090

### CORS Issues
json-server should handle CORS automatically, but if you encounter issues:
- Check that json-server is running on the correct port
- Verify the API URLs in service files

### Missing Data
If a module shows "no data available":
1. Check the browser network tab for failed API calls
2. Add the missing endpoint to db.json
3. Restart json-server

## Data Structure Notes

The db.json file contains sample data for all modules. Key points:
- IDs are strings for some collections, numbers for others (be consistent)
- Dates are in ISO format
- Foreign key relationships use ID references
- Some collections have nested objects (like employee documents)

For questions or issues, check the browser console and network tab for specific error messages.
