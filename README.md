# Evergreen - Mobile Carpool Organization App

A sustainability-focused mobile carpool application that connects users for ride sharing.

## Features

- Request and offer rides
- Real-time notifications for new requests/offers
- Edit ride offers
- Invite friends to join

## Tech Stack

- **Language**: TypeScript
- **Frontend**: Expo Go (React Native)
- **Backend**: Node.js + Express
- **Database**: MongoDB Atlas
- **Monorepo**: npm workspaces

## Project Structure

```
SFHacks-2026/
├── apps/
│   ├── mobile/              # Expo Go mobile app
│   └── backend/             # Express API server
├── packages/
│   └── shared-types/        # Shared TypeScript types
├── package.json
├── README.md
└── AGENTS.md
```

## Prerequisites

- Node.js (v18+)
- npm
- MongoDB Atlas account (for production)
- Expo Go app (for mobile development)

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create `.env` files in each app directory:

**apps/backend/.env:**
```env
PORT=3000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
```

**apps/mobile/.env:**
```env
API_URL=http://localhost:3000
```

### 3. Start Development

```bash
# Start backend
npm run backend

# In a new terminal, start mobile
npm run mobile
```

## Available Scripts

- `npm run mobile` - Start Expo development server
- `npm run backend` - Start backend development server
- `npm run build` - Build all packages
- `npm run test` - Run all tests
- `npm run lint` - Lint all packages

## Team

Built for SF Hacks 2026
