# API Routes Documentation

This directory documents the HTTP API of the e-commerce application.

## Architecture

```text
Frontend
   |
   v
API Route
   |
   v
Authentication / Authorization
   |
   v
Service
   |
   v
Repository
   |
   v
Prisma
   |
   v
PostgreSQL
```

## Route groups

- `auth.md` — phone/OTP authentication and sessions
- `products.md` — product browsing, search, pagination and product details
- `categories.md` — category browsing
- `cart.md` — shopping cart
- `favorites.md` — favorite products
- `orders.md` — customer orders
- `checkout.md` — checkout and order creation flow
- `payments.md` — development payment abstraction
- `admin.md` — administrator operations

## Authentication

Customer routes use the authenticated session.

Admin routes additionally require an administrator role.

During development, OTP codes are logged by the server instead of being sent by SMS.

## Important rule

The frontend should not access Prisma directly. It communicates with API routes. API routes call services, and services call repositories.
