# News API Backend Implementation

Welcome to the News API Backend! This project is a production-ready RESTful API built with Node.js, TypeScript, and Prisma. It features role-based access control, high-frequency read tracking, and a background analytics engine.

## Tech Stack
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Validation**: Zod
- **Auth**: JWT + Argon2
- **Job Queue**: BullMQ (requires Redis)

## Getting Started

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Redis (for Analytics Engine)

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and provide your `DATABASE_URL`, `JWT_SECRET`, and Redis connection details.

4. Initialize the database:
   ```bash
   npx prisma migrate dev --name init
   npx prisma generate
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

### Running Tests
```bash
npm test
```

## Environment Variables
- `PORT`: Server port (default: 3000)
- `DATABASE_URL`: PostgreSQL connection string (SQL recommended)
- `JWT_SECRET`: Secret key for JWT signing
- `JWT_EXPIRES_IN`: JWT expiration time (e.g., "24h")
- `REDIS_HOST`: Redis host for BullMQ
- `REDIS_PORT`: Redis port for BullMQ
- `SALT_ROUNDS`: Argon2 salt rounds

## Technology Choices & Trade-offs
- **Prisma**: Chosen for its type-safety and excellent developer experience with TypeScript.
- **BullMQ**: Used for the Analytics Engine to ensure high-frequency events (read logs) don't block the main application and can be processed reliably in the background.
- **Zod**: Ensures all incoming requests are strictly validated before hitting the service layer.
- **Argon2**: Used for industry-standard password hashing, providing better security than standard BCrypt.
- **Refresh Spam Prevention**: Implemented a 1-hour "cooldown" per user-article pair in the read tracking service to prevent artificial view count inflation.

## API Response Format
All responses follow the specified "Base Response" or "Paginated Response" structures.

### Base Response
```json
{
  "Success": boolean,
  "Message": string,
  "Object": object | null,
  "Errors": array | null
}
```

### Paginated Response
```json
{
  "Success": boolean,
  "Message": string,
  "Object": [list of objects],
  "PageNumber": number,
  "PageSize": number,
  "TotalSize": number,
  "Errors": null
}
```
