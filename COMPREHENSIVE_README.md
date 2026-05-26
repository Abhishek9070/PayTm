# PayTm - Digital Wallet & Payment Application

A comprehensive full-stack digital wallet and payment application built with Node.js, Express, MongoDB, React, and Redux. The platform enables users to manage digital wallets, transfer money, deposit/withdraw funds, verify KYC, and provides a robust admin panel for system management and fraud detection.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Project Structure](#project-structure)
5. [Understanding Order - Reading Guide](#understanding-order---reading-guide)
6. [Setup Instructions](#setup-instructions)
7. [API Documentation Overview](#api-documentation-overview)
8. [Environment Variables](#environment-variables)
9. [Database Models](#database-models)
10. [Key Concepts](#key-concepts)
11. [Workflow Diagrams](#workflow-diagrams)

---

## Project Overview

**PayTm** is a full-featured digital wallet and payment platform that mimics the functionality of services like PayTm or Google Pay. The application is divided into two main components:

- **Backend (Node.js + Express)**: RESTful API server managing all business logic, authentication, payments, and data persistence
- **Frontend (React + Redux)**: Interactive user interface for regular users and a separate admin dashboard for system administrators

The platform handles:
- User account management with JWT-based authentication
- Digital wallet transactions and balance management
- UPI (Unified Payments Interface) integration
- Razorpay payment gateway integration for deposits
- KYC (Know Your Customer) verification with document upload
- Comprehensive transaction history tracking
- Admin panel with fraud detection and user management
- Real-time notifications for transactions
- Security event logging and fraud protection

---

## Key Features

### User Features
1. **Authentication System**
   - User registration with phone number, email, and password
   - Login with JWT token-based authentication
   - Token refresh mechanism for session management
   - Secure password hashing using bcrypt

2. **Digital Wallet**
   - Wallet creation on registration (initial balance: ₹500)
   - Real-time balance tracking
   - Support for locked balance (for pending transactions)

3. **Money Transfer**
   - Transfer money between registered users
   - Support for both UPI ID and phone number-based transfers
   - Transaction status tracking (pending, success, failed)
   - Duplicate transaction detection within 2-minute window

4. **Deposits (Add Money to Wallet)**
   - Users can deposit money using various payment methods
   - Integration with Razorpay for payment processing
   - Payment reference tracking for reconciliation
   - Admin approval workflow for deposits
   - Webhook handling for incoming payment confirmations

5. **Withdrawals (Withdraw Money)**
   - Users can withdraw money to their registered UPI ID
   - Withdrawal request tracking with status updates
   - Admin approval/rejection workflow
   - Cooldown period enforcement (15 minutes between withdrawals)

6. **KYC Verification**
   - Document upload support (Aadhaar or PAN)
   - Cloudinary-based secure file storage
   - Multi-status tracking (not_submitted, pending, approved, rejected)
   - Profile image storage alongside KYC documents

7. **Transaction History**
   - Comprehensive transaction tracking with filters
   - Support for filtering by type (transfer, deposit, withdrawal)
   - Status-based filtering (pending, success, failed)
   - Date range filtering for historical analysis

8. **Notifications**
   - Real-time in-app notifications for transactions
   - Notification types: transfer, deposit, withdrawal, payment
   - Notification status tracking (read/unread)

9. **User Profile Management**
   - Profile information display
   - Profile picture upload via Cloudinary
   - UPI ID and QR code generation
   - KYC status visibility

### Admin Features
1. **Admin Authentication**
   - Separate admin login system
   - Role-based access control (super_admin, support_admin, finance_admin, fraud_admin)
   - Admin token refresh mechanism
   - Admin session management

2. **Dashboard & Analytics**
   - System summary dashboard with key metrics
   - Pending actions overview
   - Fraud event tracking and visualization
   - Real-time statistics

3. **User Management**
   - View all users with filtering options
   - User details inspection
   - User account freezing/unfreezing
   - User account blocking capabilities

4. **KYC Management**
   - View pending KYC submissions
   - KYC document review
   - Approval/rejection workflow
   - Document viewing capabilities

5. **Transaction Management**
   - View all system transactions
   - Filter by type, status, amount, and date range
   - Detailed transaction inspection
   - High-value transaction flagging

6. **Deposit Management**
   - View pending deposit requests
   - Approve/reject deposits
   - Payment reference verification
   - Reconciliation support

7. **Withdrawal Management**
   - View pending withdrawal requests
   - Approve/reject withdrawals
   - UPI verification
   - Processing status updates

8. **Security & Fraud Detection**
   - Security event logging
   - Fraud pattern detection
   - Rate limiting enforcement
   - High-value transaction monitoring
   - Duplicate transaction detection
   - Anomalous activity flagging

9. **Audit & Compliance**
   - Admin action audit trail
   - Activity logging
   - Notification broadcasting to users

---

## Technology Stack

### Backend
- **Runtime**: Node.js (ES6+ Modules)
- **Framework**: Express.js v5.2.1
- **Database**: MongoDB with Mongoose ODM v9.4.1
- **Authentication**: JWT (jsonwebtoken v9.0.3)
- **Password Security**: bcrypt v6.0.0 and bcryptjs v3.0.3
- **File Upload**: Multer v2.1.1 with Cloudinary storage
- **Cloud Storage**: Cloudinary v1.41.3 (for KYC documents and profile images)
- **Payment Gateway**: Razorpay v2.9.6 (for payment processing)
- **Communication**: Twilio v6.0.0 (for SMS notifications)
- **Middleware**: CORS v2.8.6, Cookie-Parser v1.4.7
- **Development**: Nodemon v3.1.14 (with dotenv)

### Frontend
- **Framework**: React v19.2.5 with React DOM
- **Routing**: React Router DOM v7.14.2
- **State Management**: Redux Toolkit v2.11.2 with React-Redux v9.2.0
- **Styling**: Tailwind CSS v4.2.2 with utilities
- **Build Tool**: Vite v8.0.4
- **HTTP Client**: Axios v1.15.2
- **Animations**: Framer Motion v12.38.0
- **Charts**: Recharts v3.8.1
- **QR Code**: QRCode.react v4.2.0
- **Notifications**: React Hot Toast v2.6.0
- **Utilities**: clsx v2.0.0, tailwind-merge v2.2.0
- **Code Quality**: ESLint with React plugins

### Database Structure
- **Primary Database**: MongoDB
- **Schema Design**: Mongoose with embedded documents and references
- **Indexes**: Strategic indexing for query optimization

---

## Project Structure

```
PayTm/
├── Backend/                          # Backend API Server
│   ├── src/
│   │   ├── index.js                 # Entry point - database connection & server startup
│   │   ├── app.js                   # Express app setup with middleware and routes
│   │   ├── constants.js             # Application constants
│   │   │
│   │   ├── config/                  # Configuration files
│   │   │   ├── cloudinary.js        # Cloudinary setup for file uploads
│   │   │   └── razorpay.js          # Razorpay payment gateway configuration
│   │   │
│   │   ├── db/
│   │   │   └── index.js             # MongoDB connection setup
│   │   │
│   │   ├── models/                  # Mongoose data models
│   │   │   ├── user.model.js        # User schema with auth methods
│   │   │   ├── admin.model.js       # Admin schema with role-based access
│   │   │   ├── wallet.model.js      # Wallet schema with balance tracking
│   │   │   ├── transaction.model.js # Transaction schema
│   │   │   ├── deposit.model.js     # Deposit request schema
│   │   │   ├── withdraw.model.js    # Withdrawal request schema
│   │   │   ├── notification.model.js# Notification schema
│   │   │   ├── otp.model.js         # OTP storage schema
│   │   │   ├── paymentOrder.model.js# Razorpay payment order schema
│   │   │   ├── securityEvent.model.js # Security event logging
│   │   │   ├── adminAudit.model.js  # Admin action audit trail
│   │   │   └── incomingPayment.model.js # Incoming payment webhook tracking
│   │   │
│   │   ├── controllers/             # Business logic handlers
│   │   │   ├── auth.controller.js   # User registration, login, token refresh
│   │   │   ├── admin.auth.controller.js # Admin login and session management
│   │   │   ├── admin.controller.js  # Admin dashboard and management functions
│   │   │   ├── wallet.controller.js # Wallet balance management
│   │   │   ├── transaction.controller.js # Money transfer logic
│   │   │   ├── deposit.controller.js # Deposit request handling
│   │   │   ├── withdrawal.controller.js # Withdrawal request handling
│   │   │   ├── kyc.controller.js    # KYC verification logic
│   │   │   ├── razorpay.controller.js # Razorpay webhook handling
│   │   │   ├── notification.controller.js # Notification retrieval
│   │   │   ├── user.controller.js   # User profile management
│   │   │   └── adminNotifications.controller.js # Admin notifications
│   │   │
│   │   ├── routes/                  # API route definitions
│   │   │   ├── auth.routes.js       # /api/v1/auth - User authentication
│   │   │   ├── admin.auth.routes.js # /api/v1/admin/auth - Admin authentication
│   │   │   ├── admin.routes.js      # /api/v1/admin - Admin operations
│   │   │   ├── wallet.routes.js     # /api/v1/wallet - Wallet operations
│   │   │   ├── transaction.routes.js# /api/v1/transactions - Money transfers
│   │   │   ├── deposit.routes.js    # (via wallet.routes.js) - Deposit handling
│   │   │   ├── withdrawal.routes.js # /api/v1/withdrawals - Withdrawal handling
│   │   │   ├── kyc.routes.js        # /api/v1/kyc - KYC verification
│   │   │   ├── razorpay.routes.js   # /api/v1/razorpay - Payment webhooks
│   │   │   ├── user.routes.js       # /api/v1/users - User profile
│   │   │   └── notification.routes.js # /api/v1/notifications - Notifications
│   │   │
│   │   ├── middlewares/             # Express middleware functions
│   │   │   ├── auth.middleware.js   # JWT verification (verifyJWT)
│   │   │   ├── admin.auth.middleware.js # Admin JWT verification
│   │   │   ├── admin.middleware.js  # Admin role checking (isAdmin)
│   │   │   ├── kycUpload.middleware.js # Multer KYC document upload
│   │   │   └── refreshToken.middleware.js # Refresh token verification
│   │   │
│   │   ├── utils/                   # Utility functions
│   │   │   ├── apiResponse.js       # Standardized API response wrapper
│   │   │   ├── apiErros.js          # Custom API error class
│   │   │   ├── asyncHandler.js      # Async/await error wrapper
│   │   │   ├── createNotification.js # Notification creation helper
│   │   │   └── fraudProtection.js   # Fraud detection and rate limiting
│   │   │
│   │   ├── services/
│   │   │   └── sms.service.js       # SMS notification service (Twilio)
│   │   │
│   │   └── public/                  # Static files directory
│   │       └── temp/
│   │
│   ├── scripts/
│   │   └── make-admin.js            # Script to create admin users
│   │
│   ├── tmp/                         # Temporary test files
│   │   ├── findUserById.mjs
│   │   ├── probeAdminKycHttp.mjs
│   │   ├── probeAdminRoutes.mjs
│   │   ├── probeAdminUserRoute.mjs
│   │   ├── testAdminAuditImport.mjs
│   │   └── testKycEndpoint.mjs
│   │
│   ├── package.json                 # Backend dependencies and scripts
│   └── readme.md
│
├── PayTm/                            # Frontend React Application
│   ├── src/
│   │   ├── main.jsx                 # React root entry point
│   │   ├── App.jsx                  # Main App component with routing
│   │   ├── App.css
│   │   ├── index.css
│   │   │
│   │   ├── context/                 # React context for global state
│   │   │   └── AuthContext.jsx      # User authentication context
│   │   │
│   │   ├── routes/                  # Page components (route pages)
│   │   │   ├── home.jsx             # Home/landing page
│   │   │   ├── login.jsx            # User login page
│   │   │   ├── register.jsx         # User registration page
│   │   │   ├── dashboard.jsx        # User dashboard/overview
│   │   │   ├── wallet.jsx           # Wallet balance display
│   │   │   ├── deposite.jsx         # Deposit money page
│   │   │   ├── withdraw.jsx         # Withdraw money page
│   │   │   ├── withdrawal.jsx       # Withdrawal status page
│   │   │   ├── history.jsx          # Transaction history
│   │   │   ├── sendMoney.jsx        # Send money to users
│   │   │   ├── kyc.jsx              # KYC verification page
│   │   │   ├── profile.jsx          # User profile management
│   │   │   └── ProtectedRoute.jsx   # Route protection wrapper
│   │   │
│   │   ├── admin/                   # Admin dashboard section
│   │   │   ├── context/
│   │   │   │   └── AdminAuthContext.jsx # Admin authentication context
│   │   │   │
│   │   │   ├── layouts/
│   │   │   │   └── AdminLayout.jsx  # Admin layout wrapper
│   │   │   │
│   │   │   ├── pages/               # Admin page components
│   │   │   │   ├── AdminLogin.jsx   # Admin login page
│   │   │   │   ├── AdminDashboard.jsx # Admin main dashboard
│   │   │   │   ├── AdminAnalytics.jsx # Analytics and reporting
│   │   │   │   ├── AdminUsers.jsx   # User management
│   │   │   │   ├── AdminTransactions.jsx # Transaction viewing
│   │   │   │   ├── AdminKyc.jsx     # KYC management
│   │   │   │   ├── AdminKycDetail.jsx # KYC document review
│   │   │   │   ├── AdminWithdrawals.jsx # Withdrawal approvals
│   │   │   │   ├── AdminReports.jsx # Report generation
│   │   │   │   └── AdminSettings.jsx # Admin settings
│   │   │   │
│   │   │   ├── routes/
│   │   │   │   └── AdminProtectedRoute.jsx # Admin route protection
│   │   │   │
│   │   │   └── services/            # Admin-specific services
│   │   │
│   │   ├── layouts/
│   │   │   └── AppLayout.jsx        # Main app layout wrapper
│   │   │
│   │   ├── components/
│   │   │   └── ui/                  # Reusable UI components
│   │   │
│   │   ├── store/                   # Redux store configuration
│   │   │   └── index.js             # Redux store setup
│   │   │
│   │   ├── api/
│   │   │   └── axios.js             # Axios instance with interceptors
│   │   │
│   │   ├── lib/
│   │   │   └── utils.ts             # Utility functions and helpers
│   │   │
│   │   ├── assets/                  # Images, icons, and static files
│   │   │
│   │   └── public/                  # Public static files
│   │
│   ├── vite.config.js               # Vite build configuration
│   ├── tailwind.config.mjs           # Tailwind CSS configuration
│   ├── postcss.config.mjs            # PostCSS configuration
│   ├── eslint.config.js             # ESLint configuration
│   ├── package.json                 # Frontend dependencies and scripts
│   ├── index.html                   # HTML entry point
│   └── README.md
│
└── README.md                        # Project root README
```

---

## Understanding Order - Reading Guide

To understand this project comprehensively, follow this reading order:

### **Phase 1: Project Foundation (Start Here)**
1. **[README.md](README.md)** - Project overview and quick start guide
2. **[Backend/package.json](Backend/package.json)** - Backend dependencies and version info
3. **[PayTm/package.json](PayTm/package.json)** - Frontend dependencies and version info

### **Phase 2: Backend Core Architecture**
4. **[Backend/src/index.js](Backend/src/index.js)** - Server entry point, database connection initialization
5. **[Backend/src/app.js](Backend/src/app.js)** - Express app setup, middleware configuration, all route registrations
6. **[Backend/src/constants.js](Backend/src/constants.js)** - Application constants

### **Phase 3: Database Configuration & Models**
7. **[Backend/src/db/index.js](Backend/src/db/index.js)** - MongoDB connection setup
8. **[Backend/src/config/cloudinary.js](Backend/src/config/cloudinary.js)** - Cloudinary configuration for file uploads
9. **[Backend/src/config/razorpay.js](Backend/src/config/razorpay.js)** - Razorpay payment gateway setup
10. **[Backend/src/models/user.model.js](Backend/src/models/user.model.js)** - User schema with JWT token generation methods
11. **[Backend/src/models/admin.model.js](Backend/src/models/admin.model.js)** - Admin schema with role-based access
12. **[Backend/src/models/wallet.model.js](Backend/src/models/walet.model.js)** - Wallet schema (note: file is named "walet.model.js")
13. **[Backend/src/models/transaction.model.js](Backend/src/models/transaction.model.js)** - Transaction schema for all transaction types
14. **[Backend/src/models/deposit.model.js](Backend/src/models/deposit.model.js)** - Deposit request schema
15. **[Backend/src/models/withdraw.model.js](Backend/src/models/withdraw.model.js)** - Withdrawal request schema
16. **[Backend/src/models/notification.model.js](Backend/src/models/notification.model.js)** - Notification schema

### **Phase 4: Authentication & Security**
17. **[Backend/src/utils/apiErros.js](Backend/src/utils/apiErros.js)** - Custom API error class
18. **[Backend/src/utils/apiResponse.js](Backend/src/utils/apiResponse.js)** - Standardized API response wrapper
19. **[Backend/src/middlewares/auth.middleware.js](Backend/src/middlewares/auth.middleware.js)** - JWT verification middleware
20. **[Backend/src/middlewares/admin.middleware.js](Backend/src/middlewares/admin.middleware.js)** - Admin authorization check
21. **[Backend/src/controllers/auth.controller.js](Backend/src/controllers/auth.controller.js)** - User registration, login, token refresh logic
22. **[Backend/src/controllers/admin.auth.controller.js](Backend/src/controllers/admin.auth.controller.js)** - Admin login and session management

### **Phase 5: Fraud Protection & Utilities**
23. **[Backend/src/utils/fraudProtection.js](Backend/src/utils/fraudProtection.js)** - Fraud detection, rate limiting, security event logging
24. **[Backend/src/utils/asyncHandler.js](Backend/src/utils/asyncHandler.js)** - Async error handling wrapper
25. **[Backend/src/utils/createNotification.js](Backend/src/utils/createNotification.js)** - Notification creation helper
26. **[Backend/src/services/sms.service.js](Backend/src/services/sms.service.js)** - Twilio SMS service

### **Phase 6: User Features - Controllers & Routes**
27. **[Backend/src/controllers/wallet.controller.js](Backend/src/controllers/wallet.controller.js)** - Wallet balance operations
28. **[Backend/src/controllers/transaction.controller.js](Backend/src/controllers/transaction.controller.js)** - Money transfer logic with fraud checks
29. **[Backend/src/controllers/deposit.controller.js](Backend/src/controllers/deposit.controller.js)** - Deposit/add-money logic
30. **[Backend/src/controllers/withdrawal.controller.js](Backend/src/controllers/withdrawal.controller.js)** - Withdrawal request handling
31. **[Backend/src/controllers/kyc.controller.js](Backend/src/controllers/kyc.controller.js)** - KYC verification with Cloudinary upload
32. **[Backend/src/controllers/razorpay.controller.js](Backend/src/controllers/razorpay.controller.js)** - Razorpay webhook handling
33. **[Backend/src/controllers/user.controller.js](Backend/src/controllers/user.controller.js)** - User profile management
34. **[Backend/src/controllers/notification.controller.js](Backend/src/controllers/notification.controller.js)** - Notification retrieval

**Routes for User Features:**
35. **[Backend/src/routes/auth.routes.js](Backend/src/routes/auth.routes.js)** - Authentication endpoints
36. **[Backend/src/routes/wallet.routes.js](Backend/src/routes/wallet.routes.js)** - Wallet and deposit endpoints
37. **[Backend/src/routes/transaction.routes.js](Backend/src/routes/transaction.routes.js)** - Money transfer endpoints
38. **[Backend/src/routes/withdrawal.routes.js](Backend/src/routes/withdrawal.routes.js)** - Withdrawal endpoints
39. **[Backend/src/routes/kyc.routes.js](Backend/src/routes/kyc.routes.js)** - KYC endpoints

### **Phase 7: Admin Features**
40. **[Backend/src/controllers/admin.controller.js](Backend/src/controllers/admin.controller.js)** - Admin dashboard, user management, KYC review
41. **[Backend/src/controllers/adminNotifications.controller.js](Backend/src/controllers/adminNotifications.controller.js)** - Admin notification broadcasting
42. **[Backend/src/routes/admin.routes.js](Backend/src/routes/admin.routes.js)** - Admin management endpoints
43. **[Backend/src/routes/admin.auth.routes.js](Backend/src/routes/admin.auth.routes.js)** - Admin authentication endpoints
44. **[Backend/src/middlewares/kycUpload.middleware.js](Backend/src/middlewares/kycUpload.middleware.js)** - Multer KYC document upload
45. **[Backend/src/middlewares/refreshToken.middleware.js](Backend/src/middlewares/refreshToken.middleware.js)** - Refresh token middleware

### **Phase 8: Frontend Architecture**
46. **[PayTm/src/main.jsx](PayTm/src/main.jsx)** - React root entry point, Redux store and auth provider setup
47. **[PayTm/src/App.jsx](PayTm/src/App.jsx)** - Main App component with routing for both user and admin routes
48. **[PayTm/src/context/AuthContext.jsx](PayTm/src/context/AuthContext.jsx)** - User authentication context provider

### **Phase 9: Frontend Configuration & Utilities**
49. **[PayTm/src/api/axios.js](PayTm/src/api/axios.js)** - Axios instance with interceptors for API calls
50. **[PayTm/src/lib/utils.ts](PayTm/src/lib/utils.ts)** - Utility helper functions
51. **[PayTm/tailwind.config.mjs](PayTm/tailwind.config.mjs)** - Tailwind CSS configuration
52. **[PayTm/vite.config.js](PayTm/vite.config.js)** - Vite build configuration

### **Phase 10: Frontend User Pages**
53. **[PayTm/src/routes/home.jsx](PayTm/src/routes/home.jsx)** - Home/landing page
54. **[PayTm/src/routes/login.jsx](PayTm/src/routes/login.jsx)** - User login page
55. **[PayTm/src/routes/register.jsx](PayTm/src/routes/register.jsx)** - User registration page
56. **[PayTm/src/routes/dashboard.jsx](PayTm/src/routes/dashboard.jsx)** - User dashboard
57. **[PayTm/src/routes/wallet.jsx](PayTm/src/routes/wallet.jsx)** - Wallet view
58. **[PayTm/src/routes/deposite.jsx](PayTm/src/routes/deposite.jsx)** - Deposit/add money page
59. **[PayTm/src/routes/withdraw.jsx](PayTm/src/routes/withdraw.jsx)** - Withdraw money page
60. **[PayTm/src/routes/sendMoney.jsx](PayTm/src/routes/sendMoney.jsx)** - Send money page
61. **[PayTm/src/routes/history.jsx](PayTm/src/routes/history.jsx)** - Transaction history
62. **[PayTm/src/routes/kyc.jsx](PayTm/src/routes/kyc.jsx)** - KYC verification page
63. **[PayTm/src/routes/profile.jsx](PayTm/src/routes/profile.jsx)** - User profile page
64. **[PayTm/src/routes/ProtectedRoute.jsx](PayTm/src/routes/ProtectedRoute.jsx)** - Route protection wrapper

### **Phase 11: Frontend Admin Section**
65. **[PayTm/src/admin/context/AdminAuthContext.jsx](PayTm/src/admin/context/AdminAuthContext.jsx)** - Admin authentication context
66. **[PayTm/src/admin/routes/AdminProtectedRoute.jsx](PayTm/src/admin/routes/AdminProtectedRoute.jsx)** - Admin route protection
67. **[PayTm/src/admin/layouts/AdminLayout.jsx](PayTm/src/admin/layouts/AdminLayout.jsx)** - Admin layout wrapper
68. **[PayTm/src/admin/pages/AdminLogin.jsx](PayTm/src/admin/pages/AdminLogin.jsx)** - Admin login page
69. **[PayTm/src/admin/pages/AdminDashboard.jsx](PayTm/src/admin/pages/AdminDashboard.jsx)** - Admin main dashboard
70. **[PayTm/src/admin/pages/AdminAnalytics.jsx](PayTm/src/admin/pages/AdminAnalytics.jsx)** - Analytics dashboard
71. **[PayTm/src/admin/pages/AdminUsers.jsx](PayTm/src/admin/pages/AdminUsers.jsx)** - User management
72. **[PayTm/src/admin/pages/AdminTransactions.jsx](PayTm/src/admin/pages/AdminTransactions.jsx)** - Transaction management
73. **[PayTm/src/admin/pages/AdminKyc.jsx](PayTm/src/admin/pages/AdminKyc.jsx)** - KYC management
74. **[PayTm/src/admin/pages/AdminKycDetail.jsx](PayTm/src/admin/pages/AdminKycDetail.jsx)** - KYC detail review
75. **[PayTm/src/admin/pages/AdminWithdrawals.jsx](PayTm/src/admin/pages/AdminWithdrawals.jsx)** - Withdrawal management
76. **[PayTm/src/admin/pages/AdminReports.jsx](PayTm/src/admin/pages/AdminReports.jsx)** - Reports section
77. **[PayTm/src/admin/pages/AdminSettings.jsx](PayTm/src/admin/pages/AdminSettings.jsx)** - Admin settings

### **Quick Navigation by Feature:**

**Want to understand Money Transfer?**
- Start with: Transaction Model → Transaction Controller → Transaction Routes → Frontend sendMoney page

**Want to understand KYC?**
- Start with: KYC Model → KYC Middleware (upload) → KYC Controller → KYC Routes → Frontend kyc page

**Want to understand Deposits?**
- Start with: Deposit Model → Deposit Controller → Wallet Routes → Razorpay Controller → Frontend deposite page

**Want to understand Admin Management?**
- Start with: Admin Model → Admin Auth Controller → Admin Controller → Admin Routes → Admin frontend pages

---

## Setup Instructions

### Prerequisites
- **Node.js**: v14 or higher
- **MongoDB**: Local or Atlas cloud database
- **Environment Variables**: Create `.env` files in both Backend and PayTm directories

### Backend Setup

1. **Navigate to Backend Directory**
   ```bash
   cd Backend
   npm install
   ```

2. **Configure Environment Variables**
   Create a `.env` file in the `Backend` directory:
   ```
   PORT=3000
   NODE_ENV=development
   
   MONGODB_URL=mongodb://localhost:27017
   DB_NAME=PayTm
   
   ACCESS_TOKEN_SECRET=your_access_token_secret_key_here
   ACCESS_TOKEN_EXPIRY=7d
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_key_here
   REFRESH_TOKEN_EXPIRY=30d
   
   ADMIN_ACCESS_TOKEN_SECRET=your_admin_access_token_secret_key_here
   ADMIN_ACCESS_TOKEN_EXPIRY=7d
   ADMIN_REFRESH_TOKEN_SECRET=your_admin_refresh_token_secret_key_here
   ADMIN_REFRESH_TOKEN_EXPIRY=30d
   
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_key_secret
   
   TWILIO_ACCOUNT_SID=your_twilio_account_sid
   TWILIO_AUTH_TOKEN=your_twilio_auth_token
   TWILIO_PHONE_NUMBER=your_twilio_phone_number
   
   CORS_ORIGIN=http://localhost:5173
   
   # Fraud Protection Settings (optional - have defaults)
   FRAUD_DUPLICATE_WINDOW_MS=120000
   WITHDRAWAL_COOLDOWN_MS=900000
   PAYMENT_ORDER_COOLDOWN_MS=600000
   FRAUD_HIGH_VALUE_THRESHOLD=50000
   ```

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Create Admin User** (Optional)
   ```bash
   npm run make-admin
   ```

5. **Start Backend Server**
   ```bash
   npm run dev
   ```
   Server will run on `http://localhost:3000`

### Frontend Setup

1. **Navigate to PayTm Directory**
   ```bash
   cd PayTm
   npm install
   ```

2. **Configure Environment Variables** (if needed)
   Create a `.env` file in the `PayTm` directory:
   ```
   VITE_API_URL=http://localhost:3000/api/v1
   ```

3. **Start Frontend Development Server**
   ```bash
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## API Documentation Overview

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/auth/profile` - Get user profile
- `POST /api/v1/auth/refresh-token` - Refresh access token
- `POST /api/v1/admin/auth/login` - Admin login
- `POST /api/v1/admin/auth/refresh-token` - Admin token refresh
- `GET /api/v1/admin/auth/me` - Get admin profile
- `POST /api/v1/admin/auth/logout` - Admin logout

### Wallet & Deposit Endpoints
- `GET /api/v1/wallet/balance` - Get wallet balance
- `POST /api/v1/wallet/add-balance` - Create deposit request
- `GET /api/v1/wallet/add-balance/requests` - Get user's deposits
- `POST /api/v1/wallet/add-balance/reconcile` - Reconcile deposit by reference
- `POST /api/v1/wallet/add-balance/webhook` - Payment webhook handler
- `GET /api/v1/wallet/add-balance/pending` - Get pending deposits (admin)
- `PATCH /api/v1/wallet/add-balance/:depositId/approve` - Approve deposit (admin)
- `PATCH /api/v1/wallet/add-balance/:depositId/reject` - Reject deposit (admin)

### Transaction Endpoints
- `POST /api/v1/transactions/send` - Send money to another user
- `GET /api/v1/transactions/history` - Get transaction history

### Withdrawal Endpoints
- `POST /api/v1/withdrawals/` - Create withdrawal request
- `GET /api/v1/withdrawals/my` - Get user's withdrawals
- `GET /api/v1/withdrawals/pending` - Get pending withdrawals (admin)
- `PATCH /api/v1/withdrawals/:withdrawalId/approve` - Approve withdrawal (admin)
- `PATCH /api/v1/withdrawals/:withdrawalId/reject` - Reject withdrawal (admin)

### KYC Endpoints
- `POST /api/v1/kyc/submit` - Submit KYC documents
- `PATCH /api/v1/kyc/:userId/review` - Review KYC submission (admin)

### Admin Endpoints
- `GET /api/v1/admin/dashboard/summary` - Get dashboard summary
- `GET /api/v1/admin/dashboard/pending-actions` - Get pending actions
- `GET /api/v1/admin/dashboard/fraud-events` - Get fraud events
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/users/:id` - Get user details
- `PATCH /api/v1/admin/users/:id/freeze` - Freeze user account
- `PATCH /api/v1/admin/users/:id/unfreeze` - Unfreeze user account
- `PATCH /api/v1/admin/users/:id/block` - Block user account
- `GET /api/v1/admin/kyc/pending` - Get pending KYC submissions
- `GET /api/v1/admin/kyc/:id` - Get KYC details
- `PATCH /api/v1/admin/kyc/:id/approve` - Approve KYC
- `PATCH /api/v1/admin/kyc/:id/reject` - Reject KYC
- `GET /api/v1/admin/transactions` - Get all transactions
- `GET /api/v1/admin/security-events` - Get security events
- `POST /api/v1/admin/notifications/send` - Send admin notification

### Notification Endpoints
- `GET /api/v1/notifications` - Get user notifications
- `PATCH /api/v1/notifications/:id/read` - Mark notification as read

### Razorpay Endpoints
- `POST /api/v1/razorpay/webhook` - Razorpay payment webhook handler

---

## Environment Variables

### Backend .env Requirements

**Database**
- `MONGODB_URL` - MongoDB connection string
- `DB_NAME` - Database name (default: PayTm)

**Server**
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (development/production)

**JWT Tokens - User**
- `ACCESS_TOKEN_SECRET` - User access token secret
- `ACCESS_TOKEN_EXPIRY` - User access token expiry (default: 7d)
- `REFRESH_TOKEN_SECRET` - User refresh token secret
- `REFRESH_TOKEN_EXPIRY` - User refresh token expiry (default: 30d)

**JWT Tokens - Admin**
- `ADMIN_ACCESS_TOKEN_SECRET` - Admin access token secret
- `ADMIN_ACCESS_TOKEN_EXPIRY` - Admin access token expiry (default: 7d)
- `ADMIN_REFRESH_TOKEN_SECRET` - Admin refresh token secret
- `ADMIN_REFRESH_TOKEN_EXPIRY` - Admin refresh token expiry (default: 30d)

**Cloudinary** (for KYC document uploads)
- `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary API secret

**Razorpay** (for payment processing)
- `RAZORPAY_KEY_ID` - Razorpay Key ID
- `RAZORPAY_KEY_SECRET` - Razorpay Key Secret

**Twilio** (for SMS notifications)
- `TWILIO_ACCOUNT_SID` - Twilio Account SID
- `TWILIO_AUTH_TOKEN` - Twilio Auth Token
- `TWILIO_PHONE_NUMBER` - Twilio Phone Number

**CORS**
- `CORS_ORIGIN` - Allowed origin(s) (default: http://localhost:5173)

**Fraud Protection** (Optional - have sensible defaults)
- `FRAUD_DUPLICATE_WINDOW_MS` - Duplicate transaction detection window (default: 120000ms = 2 minutes)
- `WITHDRAWAL_COOLDOWN_MS` - Cooldown between withdrawals (default: 900000ms = 15 minutes)
- `PAYMENT_ORDER_COOLDOWN_MS` - Cooldown for payment orders (default: 600000ms = 10 minutes)
- `FRAUD_HIGH_VALUE_THRESHOLD` - High-value transaction threshold (default: 50000)

---

## Database Models

### User Model
```javascript
{
  fullName: String,
  email: String (unique, optional),
  phoneNumber: String (unique, 10 digits),
  password: String (hashed),
  accessToken: String,
  refreshToken: String,
  upiId: String (unique, auto-generated),
  qrCode: String,
  profileImage: {
    url, publicId, mimeType, uploadedAt
  },
  kyc: {
    status, documentType, fullName, phoneNumber, address, ...
  },
  isVerified: Boolean,
  isAdmin: Boolean,
  createdAt, updatedAt
}
```

### Wallet Model
```javascript
{
  userId: ObjectId (ref: User),
  balance: Number,
  lockedBalance: Number,
  createdAt, updatedAt
}
```

### Transaction Model
```javascript
{
  type: "transfer" | "deposit" | "withdrawal",
  sender: ObjectId (ref: User),
  receiver: ObjectId (ref: User),
  userId: ObjectId (ref: User),
  amount: Number,
  status: "pending" | "success" | "failed",
  direction: "debit" | "credit" | "send" | "receive",
  razorpayOrderId: String,
  razorpayPaymentId: String,
  createdAt, updatedAt
}
```

### Deposit Model
```javascript
{
  userId: ObjectId (ref: User),
  amount: Number,
  status: "pending" | "success" | "failed",
  paymentRef: String (unique),
  paidToUpiId: String,
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  rejectionReason: String,
  createdAt, updatedAt
}
```

### Withdrawal Model
```javascript
{
  userId: ObjectId (ref: User),
  amount: Number,
  upiId: String,
  status: "pending" | "approved" | "rejected",
  reviewedBy: ObjectId (ref: User),
  reviewedAt: Date,
  rejectionReason: String,
  createdAt, updatedAt
}
```

### Notification Model
```javascript
{
  userId: ObjectId (ref: User),
  title: String,
  message: String,
  type: "transfer" | "deposit" | "withdrawal" | "payment",
  isRead: Boolean,
  metadata: Mixed,
  createdAt, updatedAt
}
```

### Admin Model
```javascript
{
  fullName: String,
  email: String (unique),
  password: String (hashed),
  role: "super_admin" | "support_admin" | "finance_admin" | "fraud_admin",
  permissions: [String],
  lastLogin: Date,
  isActive: Boolean,
  refreshToken: String,
  createdAt, updatedAt
}
```

---

## Key Concepts

### JWT Authentication Flow
1. User registers/logs in with credentials
2. Server generates access token (7d expiry) and refresh token (30d expiry)
3. Tokens are stored in HTTP-only cookies and returned to client
4. Client uses access token for subsequent requests (Authorization header)
5. When access token expires, client uses refresh token to get new access token
6. Same flow applies to admin authentication

### Wallet Management
- Each user has one wallet created on registration
- Initial balance: ₹500
- Locked balance tracks funds reserved for pending transactions
- Balance = Available Balance (can be transferred)
- Locked Balance = Reserved funds (for pending transactions)

### Transaction Flow
1. User initiates transfer to another user
2. System checks for duplicate transactions (within 2 minutes)
3. Fraud protection checks are performed
4. Rate limiting is enforced
5. Wallet balances are updated (locked for sender, pending for receiver)
6. Transaction record is created with pending status
7. Notification is sent to both users

### Deposit Flow (Add Money)
1. User initiates deposit request with amount and payment reference
2. User makes payment to provided UPI address
3. User provides payment reference number
4. System creates deposit record with "pending" status
5. Admin reviews and approves/rejects the deposit
6. On approval, wallet balance is updated
7. Notification is sent to user

### Withdrawal Flow (Cash Out)
1. User requests withdrawal with UPI ID and amount
2. System creates withdrawal request with "pending" status
3. Wallet balance is locked for the requested amount
4. Admin reviews and approves/rejects the withdrawal
5. On approval, funds are transferred to provided UPI ID
6. Wallet balance is deducted
7. Notification is sent to user

### KYC Verification
1. User uploads KYC document (Aadhaar or PAN)
2. Document is uploaded to Cloudinary
3. Admin reviews the document
4. Admin approves or rejects KYC
5. User receives notification
6. Approved KYC may unlock additional features

### Fraud Detection & Security
- **Duplicate Transaction Detection**: Prevents same transaction within 2-minute window
- **Rate Limiting**: Limits number of transactions per user
- **High-Value Transaction Monitoring**: Flags transactions exceeding threshold (₹50,000)
- **Withdrawal Cooldown**: 15 minutes between consecutive withdrawals
- **Payment Order Cooldown**: 10 minutes between payment orders
- **Security Events Logging**: All suspicious activities are logged
- **IP Address Tracking**: Monitors access from different locations
- **Account Status Monitoring**: Freeze/block users as needed

### Admin Role-Based Access Control
Different admin roles with different permissions:
- **super_admin**: Full system access
- **support_admin**: User support and dispute resolution
- **finance_admin**: Financial transaction management
- **fraud_admin**: Fraud detection and prevention
- All roles can view dashboard and analytics

---

## Workflow Diagrams

### User Registration & Login Workflow
```
User Input (name, phone, email, password)
         ↓
Validation (format, duplicates)
         ↓
Password Hashing (bcrypt)
         ↓
User Record Created in MongoDB
         ↓
Wallet Created with ₹500 initial balance
         ↓
JWT Tokens Generated (access + refresh)
         ↓
Tokens Returned to Client (cookies + response)
         ↓
User Successfully Registered/Logged In
```

### Money Transfer Workflow
```
User Clicks "Send Money"
         ↓
Enter recipient & amount
         ↓
Validation (recipient exists, balance sufficient)
         ↓
Duplicate Transaction Check (within 2 minutes)
         ↓
Fraud Detection Checks (rate limiting, high value alert)
         ↓
Security Event Logged if suspicious
         ↓
Sender Wallet Locked (amount deducted)
         ↓
Transaction Record Created (pending)
         ↓
Receiver Wallet Updated (amount added)
         ↓
Transaction Status: Success
         ↓
Notifications Sent to Both Users
         ↓
History Updated
```

### Deposit (Add Money) Workflow
```
User Initiates Deposit Request
         ↓
Enter Amount & Payment Reference
         ↓
System Returns UPI Address to Send Payment
         ↓
User Pays via Their Bank App
         ↓
User Submits Payment Reference in App
         ↓
Deposit Record Created (pending status)
         ↓
Admin Reviews Payment Reference
         ↓
Admin Approves/Rejects
         ↓
If Approved:
   ├─ Wallet Balance Updated
   ├─ Transaction Record Created
   └─ User Notification Sent
         ↓
If Rejected:
   └─ Rejection Reason Sent to User
```

### KYC Verification Workflow
```
User Clicks "Verify KYC"
         ↓
Select Document Type (Aadhaar/PAN)
         ↓
Upload Document Image
         ↓
Form Validation
         ↓
Cloudinary Upload
         ↓
KYC Record Created (pending status)
         ↓
Admin Review Dashboard Notification
         ↓
Admin Reviews Document
         ↓
Admin Approves/Rejects
         ↓
If Approved:
   ├─ KYC Status: Approved
   ├─ May Unlock Features
   └─ User Notification Sent
         ↓
If Rejected:
   ├─ Rejection Reason Sent
   └─ User Can Resubmit
```

### Admin Dashboard Workflow
```
Admin Logs In
         ↓
Authentication Verified
         ↓
Admin Dashboard Loads with:
   ├─ System Summary (users, transactions, volume)
   ├─ Pending Actions (KYCs, withdrawals, deposits)
   ├─ Fraud Events (suspicious activities)
   ├─ Top Metrics (transaction count, volume)
   └─ Recent Transactions
         ↓
Admin Can:
   ├─ Review & Approve KYCs
   ├─ Review & Approve Withdrawals/Deposits
   ├─ Manage Users (freeze, block)
   ├─ View Security Events
   ├─ View Transaction Details
   └─ View Analytics & Reports
```

---

## Best Practices & Development Guidelines

### Backend Development
1. **Error Handling**: Always use the custom `ApiError` class
2. **Async Operations**: Wrap controllers with `asyncHandler` to catch errors
3. **API Responses**: Use standardized `ApiResponse` wrapper
4. **Security**: Never expose sensitive data in responses (passwords, tokens)
5. **Validation**: Validate all inputs before processing
6. **Rate Limiting**: Use fraud protection utilities for rate limiting
7. **Logging**: Log security events and errors for audit trail
8. **Database**: Use indexes for frequently queried fields

### Frontend Development
1. **State Management**: Use Redux for global state
2. **Context API**: Use for authentication context
3. **API Calls**: Use Axios interceptors for automatic token refresh
4. **Error Handling**: Show user-friendly error messages
5. **Loading States**: Always show loading indicators for async operations
6. **Protected Routes**: Wrap sensitive routes with ProtectedRoute component
7. **Responsive Design**: Use Tailwind CSS utilities for responsive layouts
8. **Accessibility**: Follow accessibility best practices

### Security Best Practices
1. **CORS**: Configured to allow only specified origins
2. **HTTPS**: Always use in production
3. **JWT**: Tokens stored in HTTP-only cookies
4. **Password**: Hashed with bcrypt (salt rounds: 10)
5. **SQL Injection**: Protected by using Mongoose ORM
6. **XSS**: Protected by React's built-in sanitization
7. **CSRF**: Protected by SameSite cookie policy
8. **Rate Limiting**: Implemented at application level

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**
- Check MongoDB is running
- Verify `MONGODB_URL` in .env
- Ensure MongoDB server is accessible

**2. CORS Error**
- Verify frontend URL matches `CORS_ORIGIN` in .env
- Check if browser is sending requests with credentials

**3. File Upload Fails**
- Verify Cloudinary credentials in .env
- Check file size doesn't exceed limit
- Ensure file is in supported format

**4. Razorpay Integration Issues**
- Verify Razorpay credentials in .env
- Check if using correct payment gateway (test/production)
- Verify webhook URL is configured in Razorpay dashboard

**5. Token Expired Error**
- Frontend should automatically refresh token
- Check if refresh token endpoint is working
- Verify token expiry times in .env

---

## Performance Optimization

### Backend Optimization
- Database indexes on frequently queried fields
- Connection pooling via Mongoose
- Query optimization with lean() for read-only operations
- Webhook handling is asynchronous
- Rate limiting prevents abuse

### Frontend Optimization
- Code splitting via Vite
- Component lazy loading
- Redux for state caching
- Axios request/response interceptors
- CSS optimization with Tailwind CSS

---

## Deployment Considerations

### Backend Deployment
- Use environment variables for all configuration
- Enable HTTPS in production
- Set `NODE_ENV=production`
- Use MongoDB Atlas or managed database service
- Enable logging and monitoring
- Set up automated backups
- Use PM2 or similar for process management

### Frontend Deployment
- Build with `npm run build`
- Deploy to Vercel, Netlify, or similar
- Set correct API endpoint in environment variables
- Enable gzip compression
- Cache static assets
- Use CDN for static files

---

## Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [React Documentation](https://react.dev/)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Razorpay Integration Guide](https://razorpay.com/docs/)
- [Cloudinary API Documentation](https://cloudinary.com/documentation)

---

## Support & Contribution

For issues, questions, or contributions:
1. Create an issue on GitHub
2. Follow the existing code style and patterns
3. Test changes locally before submitting
4. Write clear commit messages
5. Update documentation as needed

---

**Project Author**: Abhishek Mishra  
**License**: ISC  
**Version**: 1.0.0

---

*Last Updated: May 2026*
