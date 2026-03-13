# TaskFlow — Scalable REST API + React UI

A full-stack application featuring JWT authentication, role-based access control,
and a complete task management system. Built as a backend internship assignment.

---

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Backend    | Node.js · Express.js · MongoDB (Mongoose)       |
| Auth       | JWT (access + refresh tokens) · bcryptjs        |
| Validation | express-validator · Helmet · express-rate-limit |
| Frontend   | React 18 · React Router v6 · Axios              |
| Logging    | Winston                                         |

---

## Features

### Backend

- **User auth**: register, login, logout, JWT refresh token rotation
- **RBAC**: `user` and `admin` roles with middleware-enforced access
- **Tasks CRUD**: create, read, update, delete with pagination, filtering, sorting, full-text search
- **API versioning**: all routes under `/api/v1/`
- **Error handling**: centralized error handler, consistent JSON responses
- **Validation**: field-level validation with clear error messages
- **Security**: helmet headers, CORS whitelist, rate limiting, bcrypt, JWT invalidation on password change
- **Logging**: structured Winston logs to console + files
- **API docs**: Swagger UI at `/api-docs`

### Frontend

- Register & login with client-side validation + password strength meter
- Protected dashboard with task statistics and charts
- Full task management: create / edit / delete / filter / search / paginate
- Admin panel: user list, promote, deactivate
- Admin analytics: platform stats with visual breakdowns
- Toast notifications for all API responses
- JWT auto-refresh via Axios interceptors

---

## Quick Start

### Option A — Docker Compose (recommended)

```bash
git clone <repo-url>
cd taskflow

# Copy env and set secrets
cp backend/.env.example backend/.env

docker compose up --build
```

Open:

- Frontend: http://localhost
- API docs: http://localhost:5000/api-docs
- Health check: http://localhost:5000/health

---

### Option B — Local Development

**Prerequisites**: Node.js 20+, MongoDB running locally

**Backend**

```bash
cd backend
npm install
npm run dev                  # Starts on :5000 with nodemon
```

**Frontend**

```bash
cd frontend
npm install
npm run dev                  # Starts on :3000, proxies /api → :5000
```

---

## Environment Variables

| Variable                 | Description                              | Default                              |
| ------------------------ | ---------------------------------------- | ------------------------------------ |
| `PORT`                   | API server port                          | `5000`                               |
| `MONGODB_URI`            | MongoDB connection string                | `mongodb://localhost:27017/taskflow` |
| `JWT_SECRET`             | Access token signing secret (32+ chars)  | —                                    |
| `JWT_EXPIRES_IN`         | Access token TTL                         | `7d`                                 |
| `JWT_REFRESH_SECRET`     | Refresh token signing secret (32+ chars) | —                                    |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL                        | `30d`                                |
| `BCRYPT_ROUNDS`          | bcrypt work factor                       | `12`                                 |
| `ALLOWED_ORIGINS`        | Comma-separated CORS origins             | `http://localhost:3000`              |

---

## API Reference

Full interactive docs available at **http://localhost:5000/api-docs**

### Auth Endpoints

| Method | Path                    | Auth | Description          |
| ------ | ----------------------- | ---- | -------------------- |
| POST   | `/api/v1/auth/register` | —    | Register new user    |
| POST   | `/api/v1/auth/login`    | —    | Login, get tokens    |
| POST   | `/api/v1/auth/refresh`  | —    | Refresh access token |
| POST   | `/api/v1/auth/logout`   | ✓    | Invalidate tokens    |
| GET    | `/api/v1/auth/me`       | ✓    | Get current user     |

### Task Endpoints

| Method | Path                  | Auth | Role        | Description            |
| ------ | --------------------- | ---- | ----------- | ---------------------- |
| GET    | `/api/v1/tasks`       | ✓    | any         | List tasks (paginated) |
| POST   | `/api/v1/tasks`       | ✓    | any         | Create task            |
| GET    | `/api/v1/tasks/stats` | ✓    | any         | Task statistics        |
| GET    | `/api/v1/tasks/:id`   | ✓    | owner/admin | Get task               |
| PATCH  | `/api/v1/tasks/:id`   | ✓    | owner/admin | Update task            |
| DELETE | `/api/v1/tasks/:id`   | ✓    | owner/admin | Delete task            |

### User Endpoints (Admin)

| Method | Path                           | Role  | Description         |
| ------ | ------------------------------ | ----- | ------------------- |
| GET    | `/api/v1/users`                | admin | List all users      |
| GET    | `/api/v1/users/admin/stats`    | admin | Platform statistics |
| PATCH  | `/api/v1/users/:id`            | admin | Update user         |
| PATCH  | `/api/v1/users/:id/promote`    | admin | Promote to admin    |
| PATCH  | `/api/v1/users/:id/deactivate` | admin | Deactivate user     |

---

## Database Schema

### User

```
_id, name, email (unique), password (hashed), role (user|admin),
isActive, refreshToken, lastLogin, passwordChangedAt, createdAt, updatedAt
```

### Task

```
_id, title, description, status (todo|in_progress|done),
priority (low|medium|high), dueDate, tags[], owner (→ User),
createdAt, updatedAt
```

Indexes: `(owner, status)`, `(owner, priority)`, full-text on `(title, description)`

---

## Project Structure

````
taskflow/
├── backend/
│   ├── src/
│   │   ├── config/         # DB, Swagger config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth, validation
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/v1/      # Versioned routes with JSDoc
│   │   ├── utils/          # JWT, logger, ApiResponse
│   │   └── validators/     # express-validator chains
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/            # Axios client + endpoint functions
│   │   ├── components/     # UI primitives, Layout, Sidebar
│   │   ├── context/        # AuthContext, ToastContext
│   │   ├── pages/          # Login, Register, Dashboard, Tasks, Admin
│   │   └── styles/         # Global CSS design system
│   ├
│   └── vite.config.js
├
├── SCALABILITY.md
└── README.md
```tr

---

## Postman Collection

Import `TaskFlow.postman_collection.json` (in `/backend/docs/`) or use the
Swagger UI for interactive testing. Set the `{{baseUrl}}` variable to
`http://localhost:5000/api/v1` and `{{token}}` to a JWT from login.

---


````
