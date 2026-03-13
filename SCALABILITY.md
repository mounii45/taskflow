# Scalability & Architecture Notes

## Current Architecture

```
Client (React SPA)
       │  HTTPS
       ▼
   Nginx (reverse proxy + static serving)
       │
       ▼
  Express API  ──► MongoDB (replica set ready)
       │
       ▼
  Winston Logs
```

---

## Horizontal Scaling Path

### 1. Stateless API Design

JWT authentication is **stateless by design** — no session is stored server-side.
This means API instances can be scaled horizontally behind a load balancer
without sticky sessions.

```
              ┌──────────────────────┐
Client ──► Load Balancer (nginx/ALB)
              ├─── API Instance 1
              ├─── API Instance 2
              └─── API Instance N
                        │
                   MongoDB Atlas
                  (3-node replica set)
```

### 2. Caching Layer (Redis)

Add Redis for:

- **Rate limiting state** (replace in-memory `express-rate-limit` store)
- **JWT blocklist** (invalidated tokens on logout)
- **Hot query caching** (task stats, paginated results)

```javascript
// Example: cache task stats for 60s
const cached = await redis.get(`stats:${userId}`);
if (cached) return JSON.parse(cached);
const stats = await Task.aggregate([...]);
await redis.setEx(`stats:${userId}`, 60, JSON.stringify(stats));
```

### 3. Message Queue (Bull / RabbitMQ)

Move heavy operations off the request path:

- Email notifications on task due dates
- Batch report generation
- Audit log writes

### 4. Database Scaling

- **MongoDB Atlas** managed replica set (automatic failover)
- **Read replicas** for analytics queries
- **Compound indexes** already applied on `(owner, status)` and `(owner, priority)`
- Sharding by `owner` for multi-tenant scale

---

## Microservices Split (when needed)

When traffic justifies it, the monolith splits cleanly:

| Service        | Responsibility                  | Independent Scale Trigger |
| -------------- | ------------------------------- | ------------------------- |
| `auth-service` | JWT issue/verify, user accounts | Login volume              |
| `task-service` | CRUD + search                   | Task query volume         |
| `user-service` | Admin, RBAC                     | Admin operations          |
| `notify-svc`   | Email/webhook notifications     | Notification fan-out      |

Communication: REST internally, or event-driven via **RabbitMQ / Kafka** for
non-blocking fan-out (e.g., task completed → notify assignees).

---

### Managed Cloud (simplest)

- **Backend**: AWS ECS Fargate / Railway / Render
- **Frontend**: Vercel / Cloudfront + S3
- **Database**: MongoDB Atlas M10+
- **Cache**: AWS ElastiCache (Redis)

---

## Security Hardening Checklist

- [x] Helmet.js security headers
- [x] CORS whitelist
- [x] Rate limiting (global + per-route for auth)
- [x] bcrypt password hashing (rounds = 12)
- [x] JWT access + refresh token rotation
- [x] Refresh token reuse detection (invalidates on reuse)
- [x] Input validation + sanitization (express-validator)
- [x] Password change invalidates existing JWTs
- [x] Request size limits (10kb body)
- [x] Non-root Docker user
- [ ] HTTPS / TLS termination at load balancer
- [ ] Secrets management (AWS Secrets Manager / Vault)
- [ ] MongoDB field-level encryption for PII
- [ ] SIEM / centralized log aggregation
