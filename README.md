# AI Support Triage Hub

A full-stack application that intelligently ingests, triages, and drafts responses for customer support tickets using Google Gemini AI.

## Features

- **Ticket Ingestion**: API endpoint to submit new support tickets (Validated with Zod).
- **AI Triage**: Asynchronously analyzes tickets for:
  - **Category** (Billing, Technical, Feature Request)
  - **Urgency** (High, Medium, Low)
  - **Sentiment** (0-10 score)
- **AI Response Drafting**: Automatically generates a polite, context-aware email draft.
- **Robust Worker**: Handles AI rate limits with exponential backoff and marks tickets as `FAILED` after max retries.
- **Ticket Dashboard**: Next.js frontend to view, filter, and manage tickets.
- **Real-time Polls**: Dashboard auto-refreshes to show latest AI results.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn/UI
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL (via Docker)
- **Queue**: BullMQ + Redis (via Docker)
- **AI**: Google Gemini
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
  - Body: `{ "content": "..." (min 10 chars), "customerEmail": "..." (email format) }`
- `GET /tickets`: List tickets with pagination and filtering.
  - Query: `?status=PENDING&urgency=HIGH&page=1&limit=10&sortBy=createdAt&sortOrder=desc`
- `GET /tickets/:id`: Get a single ticket by ID.
  - Returns: Ticket object or 404 if not found
- `PATCH /tickets/:id`: Update ticket.
  - Body: `{ "status": "RESOLVED" | "FAILED", "aiDraft": "..." }`

## Utility Scripts

The `backend/scripts` directory contains helper scripts for development:

- `list_models.ts`: Lists available Gemini models for your API key.
  ```bash
  cd backend && npx ts-node scripts/list_models.ts
  ```
- `migrate.js`: Wrapper for Prisma migrations.
- `test_*.js`: Various API and validation test scripts.

## NPM Scripts

Detailed explanation of the available scripts in `backend/package.json`:

- `npm run dev`: Starts the backend API in development mode with hot-reloading (nodemon).
- `npm run dev:worker`: Starts the background worker in development mode with hot-reloading.
- `npm run build`: Generates Prisma client and compiles TypeScript to JavaScript for production.
- `npm run start`: Runs the compiled production build (`dist/index.js`).
- `npm run start:prod`: Runs production migrations and then starts the server.
- `npm run start:worker`: Runs the compiled production worker (`dist/worker.js`).
- `npm run worker`: Runs the worker from source using `ts-node` (good for ad-hoc usage).
- `npm run migrate`: Runs Prisma migrations to update the database schema.

## Frontend Architecture

The dashboard uses a component-based architecture with **self-contained data fetching**:

### Key Design Patterns

- **URL as Single Source of Truth**: Selected ticket ID and filters are stored in URL query parameters
- **Independent Data Fetching**: Both list and detail components manage their own React Query hooks
- **Real-time Updates**: Components auto-refresh every 5 seconds to show latest AI results
- **Optimistic Cache Invalidation**: Updates trigger refetches of both list and detail views

This architecture enables:

- Direct URL access to specific tickets (shareable links)
- Browser back/forward navigation
- Always-fresh data in detail view
- Detail view works even if ticket isn't on current list page

## Project Structure

- `/backend`: Express API, Worker logic, and Scripts.
  - `/src`: Source code.
  - `/scripts`: Maintenance and test scripts.
- `/frontend`: Next.js application.
- `/docker-compose.yml`: Infrastructure orchestration.
