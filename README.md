# Mosque Web Application

A full-stack web application for managing mosque operations.

## Tech Stack
- **Frontend:** React, Axios, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT, bcryptjs, Google OAuth

## Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Git

## Local Setup

### 1. Clone the repository
```bash
git clone https://github.com/thouseeffstdev/Mosque-webapplication.git
cd Mosque-webapplication
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev
# Backend runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
# Frontend runs on http://localhost:3000
```

### 4. Seed Super Admin (first time only)
```bash
cd backend
node createSuperAdmin.js
# Creates: superadmin@example.com / password: 123
```

## Environment Variables
See `backend/.env.example` for required variables. Never commit `.env`.

## Git Branching Strategy
```
main         ← stable, production-ready
  └── develop ← active development integration
        ├── feature/announcements
        ├── feature/events
        └── feature/prayer-timings
```

## API Base URL
`http://localhost:5000/api/auth`

## Project Status
🚧 Under active development