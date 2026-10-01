# Contact Management API

Backend API for managing users, contacts, and addresses built with Bun, Express, Prisma, and PostgreSQL.

## Prerequisites

- [Docker](https://www.docker.com/) & Docker Compose (Recommended)
- *Or* [Bun](https://bun.sh/) (v1.1 or later) & PostgreSQL for local setup without Docker.

---

## Option 1: Running with Docker (Recommended)

Running with Docker does not require installing Bun or `node_modules` on your host machine.

### 1. Configure environment variables

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Start all containers

Start the backend API, PostgreSQL database, and pgAdmin panel:

```bash
docker compose up -d --build
```

### 3. Run database migrations inside container

Execute Prisma migration deploy directly inside the `backend-contact-management` container (no local `node_modules` required):

```bash
docker container exec -it backend-contact-management bunx prisma migrate deploy
```

The services will be available at:
- **API**: `http://localhost:3000`
- **PostgreSQL**: `localhost:5433`
- **pgAdmin 4**: `http://localhost:8080` (Email: `admin@admin.com`, Password: `admin`)

---

## Option 2: Local Development Setup (Without Docker)

### 1. Install dependencies

```bash
bun install
```

### 2. Configure environment variables

Copy and adjust `.env`:

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

Apply Prisma migrations and generate the client locally:

```bash
bunx prisma migrate dev
bunx prisma generate
```

### 4. Running the Application

#### Development mode (with hot-reloading):

```bash
bun dev
```

The server runs on `http://localhost:3000`.

#### Production mode:

```bash
bun run build
bun start
```

---

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

