# Checkout

Base path:

`/api/checkout`

Checkout is the bridge between cart, order and payment.

## POST /api/checkout

Requires an authenticated session.

Typical request:

```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "09123456789",
  "address": "Customer delivery address"
}
```

## Server-side checkout flow

```text
1. Authenticate user
       |
2. Load cart
       |
3. Load products from database
       |
4. Validate product availability
       |
5. Validate stock
       |
6. Calculate prices
       |
7. Apply offers
       |
8. Create order
       |
9. Create order items
       |
10. Decrease stock
       |
11. Clear cart
       |
12. Create payment
       |
13. Return payment information
```

These database mutations should eventually be performed in a Prisma transaction where appropriate.

## Never trust frontend prices

The frontend may display:

```json
{
  "price": 100
}
```

but checkout must calculate the real price from PostgreSQL.

The client is not trusted for:

- product price
- discount
- stock
- total amount
- payment status
