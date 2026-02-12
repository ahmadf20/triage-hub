# AI Support Triage Hub

A full-stack application that intelligently ingests, triages, and drafts responses for customer support tickets using Google Gemini AI.

## Features

- **Ticket Ingestion**: API endpoint to submit new support tickets with optional customer email (validated with Zod).
- **AI Triage**: Asynchronously analyzes tickets using Google Gemini for:
  - **Category** (Billing, Technical, Feature Request)
  - **Urgency** (High, Medium, Low)
  - **Sentiment** (1-10 scale)
  - **Draft Response**: Polite, context-aware email draft
- **Robust Worker**: BullMQ worker with rate limiting (10 jobs/minute, 5 concurrent) and automatic failure handling.
- **Ticket Dashboard**: Next.js frontend to view, filter, sort, and manage tickets with URL-based state.
- **Real-time Updates**: WebSocket-based instant notifications and auto-refresh data via Socket.IO when tickets are processed or fail.
- **Manual Override**: Edit ticket details (category, urgency, draft) directly in the UI, even for failed AI processing.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React Query, Tailwind CSS, Shadcn/UI, Socket.IO Client
- **Backend**: Node.js, Express, TypeScript, Socket.IO Server
- **Database**: PostgreSQL (via Docker)
- **Queue**: BullMQ + Redis (via Docker)
- **AI**: Google Gemini (gemini-3-flash-preview)
- **Validation**: Zod
- **Containerization**: Docker Compose

## Prerequisites

- Docker & Docker Compose
- Node.js 18+ (for local dev)
- NPM
- Google Gemini API Key

## Development

**Best for**: Coding, debugging, and testing features with hot-reloading.

1.  **Configure Environment**:
    Run the setup script to create `.env` files from examples:

    ```bash
    node scripts/setup-env.js
    ```

    Then, update `backend/.env` with your `GEMINI_API_KEY`.

2.  **Start Infrastructure** (DB & Redis only):

    ```bash
    docker-compose up -d postgres redis
    ```

3.  **Start Backend** (with hot-reload):

    ```bash
    cd backend
    npm install
    npx prisma migrate dev --name init
    npm run dev
    ```

    _Open a second terminal for the worker (with hot-reload):_

    ```bash
    cd backend
    npm run dev:worker
    ```

4.  **Start Frontend** (with hot-reload):

    ```bash
    cd frontend
    npm install
    npm run dev
    ```

5.  **Access the App**:
    - Dashboard: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:3001](http://localhost:3001)

## Production

**Best for**: Deployment simulation, stability, and running the full backend stack in isolated containers.

1.  **Configure Environment**:
    Run the setup script to create `.env` files from examples:
    ```bash
    node scripts/setup-env.js
    ```
    Then, update `backend/.env` with your `GEMINI_API_KEY`.
2.  **Run Full Stack** (Frontend + Backend + Worker + DB + Redis):

    ```bash
    docker-compose up --build
    ```

    _Note: Both backend and frontend will run in production mode. Changes require a rebuild._

3.  **Access the App**:
    - Dashboard: [http://localhost:3000](http://localhost:3000)
    - Backend API: [http://localhost:3001](http://localhost:3001)

## API Endpoints

- `POST /tickets`: Create a ticket.
- `GET /tickets`: List tickets with pagination and filtering.
- `GET /tickets/:id`: Get a single ticket by ID.
- `PATCH /tickets/:id`: Update ticket details.

## Utility Scripts

- **`scripts/setup-env.js`**: Automatically copies all `.env.example` files to their respective `.env` destinations.

  ```bash
  node scripts/setup-env.js
  ```

- **`backend/scripts/list_models.js`**: Lists available Gemini models for your API key.
  ```bash
  cd backend && node scripts/list_models.js
  ```

## NPM Scripts

Available scripts in `backend/package.json`:

- `npm run dev`: Starts the backend API in development mode with hot-reloading (nodemon).
- `npm run dev:worker`: Starts the background worker in development mode with hot-reloading.
- `npm run build`: Generates Prisma client and compiles TypeScript to JavaScript for production.
- `npm run start`: Runs the compiled production build (`dist/index.js`).
- `npm run start:prod`: Runs production migrations and then starts the server.
- `npm run start:worker`: Runs the compiled production worker (`dist/worker.js`).
- `npm run worker`: Runs the worker from source using `ts-node` (good for ad-hoc usage).
- `npm run migrate`: Runs Prisma migrations to update the database schema.

## Architecture

### Frontend

- **Next.js 14** with App Router and TypeScript
- **React Query**: Client-side state management and caching
- **Socket.IO Client**: Real-time WebSocket connection for instant updates
- **URL-based state**: Filters and selected ticket ID stored in query parameters
- **Cache invalidation**: `SocketListener` component invalidates React Query cache on `ticket:update` events
- **Suspense boundaries**: Proper handling of async components with `useSearchParams`

### Backend

- **Express API**: RESTful endpoints for CRUD operations
- **BullMQ + Redis**: Job queue for async AI processing with rate limiting
- **Socket.IO Server**: Broadcasts `ticket:update` events on job completion/failure
- **Prisma ORM**: Type-safe database access with PostgreSQL
- **Google Gemini AI**: Ticket triage (category, urgency, sentiment, draft response)

### Real-time Flow

1. User creates ticket → API stores in DB → Job queued in BullMQ
2. Worker processes job → AI analyzes ticket → Updates DB
3. BullMQ `QueueEvents` emits `completed`/`failed` → Backend broadcasts via Socket.IO
4. Frontend `SocketListener` receives event → Invalidates React Query cache → UI auto-updates

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── index.ts      # Express API + Socket.IO server
│   │   ├── worker.ts     # BullMQ worker for AI processing
│   │   ├── ai.ts         # Google Gemini integration
│   │   └── db.ts         # Prisma client
│   ├── scripts/          # Utility scripts (list_models.ts, etc.)
│   └── prisma/           # Database schema and migrations
├── frontend/
│   └── src/
│       ├── app/          # Next.js App Router pages
│       ├── components/   # React components (SocketListener, etc.)
│       ├── module/       # Feature modules (tickets hooks/services)
│       └── lib/          # Utilities (socket.ts, httpService.ts)
├── scripts/              # Project-level scripts (setup-env.js)
└── docker-compose.yml    # Infrastructure orchestration
```
