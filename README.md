# Auth API

A secure REST API for user authentication and task management, built with Node.js, Express, and PostgreSQL.

## Live Demo
API Base URL: `https://auth-api-2zd0.onrender.com`

## Features
- User registration and login with bcrypt password hashing
- JWT-based authentication with role support (admin / user)
- Google OAuth 2.0 login via Passport.js
- Full task CRUD — create, read, update, delete
- Role-based access control — admins manage all tasks, users manage their own
- 13 automated unit tests with Jest and Supertest
- CI/CD via GitHub Actions — tests run on every push to main
- Dockerised for consistent local development

## Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL (raw pg queries)
- **Auth:** JWT, bcrypt, Passport.js, Google OAuth 2.0
- **Testing:** Jest, Supertest
- **CI/CD:** GitHub Actions
- **Deployment:** Render

## Project Structure.

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register a new user |
| POST | `/api/auth/login` | Public | Login and receive JWT |
| GET | `/api/auth/profile` | Protected | Get current user profile |
| GET | `/api/auth/google` | Public | Google OAuth login |

### Tasks
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/tasks` | Protected | Get tasks (admin: all, user: own) |
| POST | `/api/tasks` | Protected | Create a task |
| PUT | `/api/tasks/:id` | Protected | Update a task |
| DELETE | `/api/tasks/:id` | Protected | Delete a task |
| GET | `/api/tasks/admin/summary` | Admin only | Task counts per user |

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- Docker (optional)

### Local Setup
```bash
# Clone the repo
git clone https://github.com/Hanc2004/auth-api.git
cd auth-api

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Fill in your DB credentials and secrets

# Create database tables
psql -U postgres -d authdb -f schema.sql

# Start the server
npm run dev
```

### Environment Variables

### Running Tests
```bash
npm test
```

## CI/CD
GitHub Actions runs all 13 tests automatically on every push to `main`. The workflow spins up a PostgreSQL service container, creates the required tables, and runs the full test suite.

## Deployment
The API is deployed on Render with a managed PostgreSQL database. Environment variables are configured via the Render dashboard.