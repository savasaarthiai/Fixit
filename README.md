# FixIt — Campus Cleaning Complaint Portal

A full-stack campus complaint management system for college maintenance issues.

## Tech Stack

- **Frontend**: React 18 + Vite + React Router + Recharts + Lucide Icons
- **Backend**: Express.js + MongoDB (Mongoose) + JWT Auth + Multer
- **Styling**: Custom CSS with dark glassmorphic design system

## Prerequisites

- **Node.js** 18+
- **MongoDB** running locally or MongoDB Atlas URI

## Quick Start

### 1. Clone & Install

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/fixit
JWT_SECRET=your-secret-key-change-this
ADMIN_PASSWORD=admin123
PORT=5000
```

### 3. Seed Admin User

```bash
cd server
npm run seed
```

This creates admin credentials:
- **Email**: `admin@fixit.edu`
- **Password**: `admin123`

### 4. Start the Application

**Terminal 1 — Backend:**
```bash
cd server
npm start
```

**Terminal 2 — Frontend:**
```bash
cd client
npm run dev
```

Open **http://localhost:5173** in your browser.

### 5. Build for Production

```bash
cd client
npm run build
npm run preview
```

## Features

### Student Portal
- 📝 Report issues with photos, GPS location, and priority
- 🔍 Track reports by unique FIX-XXXX IDs
- 📊 Personal dashboard with report stats
- 🔔 Real-time notifications on status changes
- 🔎 Search and filter reports

### Admin Dashboard
- 📈 Analytics: charts, trends, resolution metrics
- 🔄 Status management: Reported → In Progress → Resolved → Closed
- 💬 Add notes & resolution photos
- 🗃️ Full issue management with filters

### Issue Categories
Water/Leakage | Garbage | Washroom | Classroom | Corridor | Electrical | Furniture | Other

## Project Structure

```
FixIt/
├── server/                 # Express.js backend
│   ├── config/db.js       # MongoDB connection
│   ├── middleware/auth.js  # JWT middleware
│   ├── models/            # Mongoose schemas
│   ├── routes/            # API endpoints
│   ├── scripts/           # Admin seeder
│   ├── uploads/           # Photo storage
│   └── server.js          # Entry point
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Shared components
│   │   ├── context/       # Auth context
│   │   ├── pages/         # Page components
│   │   ├── services/      # API layer
│   │   └── index.css      # Design system
│   └── index.html
└── README.md
```
