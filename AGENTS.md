# Evergreen Agents Guidelines

Guidelines for AI assistants working on the Evergreen codebase.

## Tech Stack Overview

- **Language**: TypeScript
- **Frontend**: Expo SDK (React Native)
- **Backend**: Express.js
- **Database**: MongoDB Atlas with Mongoose ODM
- **Monorepo**: npm workspaces

## Directory Structure

```
apps/
  mobile/          # Expo React Native app
  backend/         # Express API
packages/
  shared-types/    # TypeScript types (shared between apps)
```

## Development Guidelines

### General Principles

1. **Keep it simple** - Hackathon project, prioritize speed and functionality over complex abstractions
2. **Type safety** - Use TypeScript strict mode; avoid `any`
3. **Shared types** - Put all types/interfaces in `packages/shared-types`, import where needed
4. **Consistent naming** - camelCase for variables/functions, PascalCase for classes/types

### Backend (Express + MongoDB)

#### File Organization
```
backend/
  src/
    models/        # Mongoose schemas
    routes/        # Express route handlers
    controllers/   # Business logic (optional separation)
    middleware/    # Auth, validation, error handling
    utils/         # Helper functions
    types/         # Backend-specific types (extending shared-types)
    app.ts         # Express app setup
    server.ts      # Server entry point
```

#### API Design
- RESTful endpoints under `/api/v1/`
- Use async/await with proper error handling
- Implement centralized error handling middleware
- Validate request bodies before processing
- Return consistent response format:
  ```typescript
  { success: boolean, data?: T, error?: string }
  ```

#### MongoDB/Mongoose
- Define schemas in `models/` directory
- Use Mongoose validation for required fields
- Create indexes for frequently queried fields
- Handle connection errors gracefully

#### Security
- Never commit secrets (use .env files)
- Sanitize user inputs
- Use helmet middleware for security headers
- Implement rate limiting for auth endpoints

### Mobile (Expo)

#### File Organization
```
mobile/
  src/
    components/    # Reusable UI components
    screens/       # Screen components
    navigation/    # Navigation setup
    hooks/         # Custom React hooks
    services/      # API calls, async storage
    utils/         # Helper functions
    constants/     # App constants, colors, etc.
    types/         # Mobile-specific types
    App.tsx        # Entry point
```

#### Component Guidelines
- Use functional components with hooks
- Extract reusable components to `components/`
- Keep screens focused on layout and navigation
- Use React Native's built-in components where possible

#### API Integration
- Create a centralized API client in `services/api.ts`
- Use environment variables for API URL
- Handle loading states and errors in UI
- Implement request/response interceptors for auth tokens

#### Expo Specific
- Use Expo SDK features when available (notifications, location, etc.)
- Test on both iOS and Android via Expo Go
- Handle permissions properly for location/contacts

### Shared Types Package

All shared TypeScript interfaces and types go here.

#### Structure
```
shared-types/
  src/
    user.ts        # User-related types
    ride.ts        # Ride request/offer types
    notification.ts # Notification types
    index.ts       # Re-exports
```

#### Guidelines
- Export all types from `index.ts`
- Use explicit exports (avoid `export *`)
- Keep types backend-agnostic when possible
- Document complex types with JSDoc comments

## Code Style

### TypeScript
- Enable strict mode in all tsconfig.json files
- Always specify return types for functions
- Use interfaces for object shapes, types for unions/complex types
- Avoid `any` - use `unknown` if type is truly unknown

### Imports
- Group imports: external → internal → relative
- Use absolute imports with path aliases when configured
- Clean up unused imports

### Error Handling
- Use try/catch for async operations
- Log errors with context
- Return user-friendly error messages
- Don't swallow errors silently

### Comments
- Use JSDoc for function documentation
- Explain "why" not "what" (code should be self-documenting)
- Comment complex business logic

## Testing

- Write tests for critical business logic
- Test happy paths and edge cases
- Mock external dependencies (API, database)
- Use descriptive test names: `it('should return user when valid token provided')`

## Git Workflow

- Create feature branches from main
- Use descriptive commit messages
- No commits should include:
  - `.env` files
  - `node_modules/`
  - Build artifacts
  - IDE files

## Environment Variables

Required for backend:
```
PORT=3000
MONGODB_URI=...
JWT_SECRET=...
```

Required for mobile:
```
API_URL=...
```

## Common Commands

```bash
# Install dependencies
npm install

# Start backend
npm run backend

# Start mobile
npm run mobile

# Type check
npx tsc --noEmit
```
