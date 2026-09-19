# Contact Management API

Backend API for managing users, contacts, and addresses built with Bun, Express, Prisma, and PostgreSQL.

## Prerequisites

- [Bun](https://bun.sh/) (v1.1 or later)
- PostgreSQL

## Getting Started

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your database credentials and JWT secrets:

```env
PORT=3000
DATABASE_URL="postgresql://username:password@localhost:5432/contact_management?schema=public"
NODE_ENV="development"
ACCESS_TOKEN_SECRET="your_access_token_secret"
REFRESH_TOKEN_SECRET="your_refresh_token_secret"
ACCESS_EXPIRES_IN="15m"
REFRESH_EXPIRES_IN="1d"
```

### 3. Run database migrations

Apply Prisma migrations and generate the client:

```bash
bunx prisma migrate dev
bunx prisma generate
```

## Running the Application

### Development mode

Starts the server with hot-reloading:

```bash
bun dev
```

The server runs on `http://localhost:3000`.

### Production mode

Build and start the production bundle:

```bash
bun run build
bun start
```

## Running Tests

Run all integration tests:

```bash
bun test
```

Run specific test files:

```bash
bun test test/user.test.ts
bun test test/contact.test.ts
bun test test/address.test.ts
bun test test/middleware.test.ts
```

## API Documentation

Endpoint specifications and request/response contracts are documented in the `docs/` directory:

- [User & Auth API](docs/user.md)
- [Contact API](docs/contact.md)
- [Address API](docs/address.md)
