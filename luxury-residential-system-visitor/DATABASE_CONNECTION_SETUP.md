# Database Connection Setup Guide

## ✅ Completed Implementations

All components have been connected to the MongoDB database. Here's what was done:

### Backend Setup

#### 1. **User Controller** (`Vbackend/controllers/userController.js`)
- Implemented `register` - Create new users with validation
- Implemented `login` - Authenticate users with password hashing
- Implemented `getProfile` - Fetch user details
- Implemented `updateUser` - Update user information
- Implemented `deleteUser` - Remove user accounts
- Implemented `getAllUsers` - Fetch all users

#### 2. **User Routes** (`Vbackend/routes/users.js`)
- Updated to use the new user controller
- Routes:
  - `POST /api/users/register` - Register new user
  - `POST /api/users/login` - Login user
  - `GET /api/users` - Get all users
  - `GET /api/users/:id` - Get user profile
  - `PUT /api/users/:id` - Update user
  - `DELETE /api/users/:id` - Delete user

#### 3. **Visitor Management**
- Already fully implemented in the backend
- Routes available:
  - `GET /api/visitors` - Get all visitors
  - `GET /api/visitors/:id` - Get single visitor
  - `POST /api/visitors` - Create visitor
  - `PUT /api/visitors/:id` - Update visitor
  - `DELETE /api/visitors/:id` - Delete visitor
  - `GET /api/visitors/status/:status` - Filter by status
  - `GET /api/visitors/date-range` - Filter by date range

### Frontend Setup

#### 1. **API Service** (`visitor/src/services/api.js`)
- Created centralized API client using axios
- User API functions for all user operations
- Visitor API functions for all visitor operations
- Configured with environment variables

#### 2. **Environment Configuration** (`visitor/.env.local`)
```
VITE_API_URL=http://localhost:5000/api
```

#### 3. **Connected Components**

**Login Component** - `visitor/src/component/Login.jsx`
- Form fields: email, password
- API Call: `POST /api/users/login`
- Features:
  - Form validation
  - User authentication
  - Local storage for user data
  - Navigation to home on success
  - Toast notifications for feedback

**Register Component** - `visitor/src/component/Register.jsx`
- Form fields: firstName, lastName, email, phone, password, confirmPassword
- API Call: `POST /api/users/register`
- Features:
  - Form validation
  - Password confirmation check
  - Minimum password length validation
  - Toast notifications
  - Redirect to login on success

**Demo Form Component** - `visitor/src/component/DemoForm.jsx`
- Form fields: firstName, lastName, email, phone, state, city, societyName, visitDate, message
- API Call: `POST /api/visitors`
- Features:
  - Creates a visitor record in database
  - Date picker for visit date
  - State and city dropdowns
  - Form validation
  - Toast success/error messages

**Visitor Management Component** - `visitor/src/component/VisitorManagement.jsx`
- Displays all visitors from database in a table
- Features:
  - Fetch and display all visitors
  - Filter by status (All, Approved, Pending, Rejected)
  - Update visitor status with dropdown
  - Delete visitor functionality
  - Loading states
  - Toast notifications

---

## 🚀 How to Run

### 1. Start MongoDB
Ensure MongoDB is running on `mongodb://localhost:27017`

### 2. Start Backend Server
```bash
cd Vbackend
npm install  # if not already done
npm start    # or npm run dev if configured
```
Server runs on: `http://localhost:5000`

### 3. Start Frontend Development Server
```bash
cd visitor
npm install  # if not already done
npm run dev
```
Frontend runs on: `http://localhost:5173` (Vite default)

---

## 📡 API Endpoints

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/users/register` | Register new user |
| POST | `/api/users/login` | Login user |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user profile |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Visitor Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/visitors` | Create visitor |
| GET | `/api/visitors` | Get all visitors |
| GET | `/api/visitors/:id` | Get single visitor |
| PUT | `/api/visitors/:id` | Update visitor |
| DELETE | `/api/visitors/:id` | Delete visitor |
| GET | `/api/visitors/status/:status` | Filter by status |
| GET | `/api/visitors/date-range?startDate=...&endDate=...` | Filter by date range |

---

## 🔐 User Roles

The system supports 4 user roles:
- `admin` - Full access
- `security` - Security personnel access
- `resident` - Resident access
- `manager` - Property manager access (default)

---

## 💾 Database Models

### User Schema
- name (required)
- email (required, unique)
- password (required, hashed with bcrypt)
- phone (required)
- role (enum: admin, security, resident, manager)
- apartment (optional)
- isActive (boolean, default: true)
- createdAt, updatedAt (timestamps)

### Visitor Schema
- firstName (required)
- lastName (required)
- email (required, unique)
- phone (required)
- address (optional)
- city (optional)
- state (optional)
- zipCode (optional)
- visitDate (required)
- purpose (optional)
- status (enum: pending, approved, rejected)
- createdAt, updatedAt (timestamps)

---

## 🎯 Next Steps

1. **Add Authentication Middleware** - Protect routes with JWT tokens
2. **Add Contact Form Backend** - Create endpoint for contact form submissions
3. **Add Image Upload** - Allow visitor photos in the system
4. **Add Notifications** - Email/SMS notifications for visitor approval
5. **Add Dashboard** - Admin dashboard to view analytics
6. **Add Search & Export** - Search visitors and export data to CSV/PDF
7. **Add Pagination** - Implement pagination for large datasets

---

## 🐛 Testing

Test the following workflows:

### User Management Flow
1. Register → Check if user is created in database
2. Login → Check if credentials are validated
3. View Profile → Check if user data is retrieved
4. Update Profile → Check if changes are saved

### Visitor Management Flow
1. Submit Demo Form → Check if visitor is created in database
2. View Visitors → Check if all visitors are displayed
3. Change Status → Check if status is updated
4. Delete Visitor → Check if visitor is removed

---

## 📝 Notes

- Make sure `.env` file in Vbackend has correct `MONGODB_URI`
- Make sure `.env.local` in visitor has correct `VITE_API_URL`
- All API responses follow the format: `{ success: boolean, message?: string, data?: any, error?: string }`
- Passwords are automatically hashed using bcrypt before saving
- All errors are caught and returned with appropriate status codes

---

## ✨ Features Added

✅ User Registration & Login  
✅ Password Hashing & Security  
✅ Visitor Management (CRUD)  
✅ Status Filtering  
✅ Date Range Filtering  
✅ Form Validation  
✅ Toast Notifications  
✅ Loading States  
✅ Error Handling  
✅ Local Storage for User Data  
✅ Responsive Design  

---

Generated: February 9, 2026
