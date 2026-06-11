# Backend API

Express + SQLite backend for the Karteikarten-System.

## Run locally

1. Install dependencies:
   npm install
2. Create env file:
   cp .env.example .env
3. Start server:
   npm run dev

Default base URL: http://localhost:3000

## Main endpoints

- GET /api/health
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me (Bearer token)
- POST /api/auth/logout (Bearer token)
- POST /api/learning-sets (Bearer token)
- GET /api/learning-sets (Bearer token)
- GET /api/learning-sets/:setId (Bearer token)
- PUT /api/learning-sets/:setId (Bearer token)
- DELETE /api/learning-sets/:setId (Bearer token)
- POST /api/learning-sets/:setId/flashcards (Bearer token)
- GET /api/learning-sets/:setId/flashcards (Bearer token)
- PUT /api/flashcards/:flashcardId (Bearer token)
- DELETE /api/flashcards/:flashcardId (Bearer token)
