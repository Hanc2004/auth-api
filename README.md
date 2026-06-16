# Auth API

A secure authentication REST API built with Node.js, Express, and PostgreSQL — featuring JWT authentication, Google OAuth 2.0, and full Docker containerization.

## Features

- User registration with bcrypt password hashing
- Login with JWT token generation
- Protected routes secured by custom JWT middleware
- Google OAuth 2.0 login via Passport.js
- PostgreSQL database with parameterized queries (SQL injection safe)
- Fully Dockerized with Docker Compose (app + database)

## Tech Stack

- **Backend:** Node.js, Express
- **Database:** PostgreSQL
- **Auth:** JWT, bcrypt, Passport.js (Google OAuth 2.0)
- **DevOps:** Docker, Docker Compose

## API Endpoints

| Method | Endpoint                  | Description                  | Auth Required |
|--------|----------------------------|-------------------------------|----------------|
| POST   | `/api/auth/register`       | Register a new user           | No             |
| POST   | `/api/auth/login`          | Login and receive a JWT token | No             |
| GET    | `/api/auth/profile`        | Get logged-in user's profile  | Yes (Bearer)   |
| GET    | `/api/auth/google`         | Start Google OAuth login      | No             |
| GET    | `/api/auth/google/callback`| Google OAuth callback         | No             |

## Getting Started

### Prerequisites

- Docker and Docker Compose installed

### Setup

1. Clone the repository
```bash
   git clone https://github.com/Hanc2004/auth-api.git
   cd auth-api
```

2. Create a `.env` file in the root directory:

3. Run with Docker Compose
```bash
   docker-compose up --build
```

4. Create the database table (first time only)
```bash
   docker exec -it auth-api-db-1 psql -U postgres -d authdb
```
   Then run:
```sql
   CREATE TABLE users (
     id        SERIAL PRIMARY KEY,
     name      VARCHAR(100),
     email     VARCHAR(150) UNIQUE NOT NULL,
     password  VARCHAR(255),
     provider  VARCHAR(20) DEFAULT 'local',
     created_at TIMESTAMP DEFAULT NOW()
   );
```

5. The API is now running at `http://localhost:5000`

## Security Notes

- Passwords are hashed using bcrypt before storage — never stored in plain text
- JWT tokens expire after 7 days
- All database queries use parameterized statements to prevent SQL injection
- Environment variables keep all secrets out of source control

## Author

Built by [Hellena Aman Nzellu] as part of a hands-on backend development project.