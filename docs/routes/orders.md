# Order Routes

Base path:

`/api/orders`

Orders require authentication.

## GET /api/orders

Returns the authenticated user's orders.

Typical query parameters:

```text
page
limit
```

Orders should be returned newest first.

## GET /api/orders/[id]

Returns one order belonging to the authenticated user.

A user must never be allowed to access another user's order simply by changing the ID.

## Order status

```text
PENDING
PROCESSING
SHIPPED
DELIVERED
CANCELLED
REFUNDED
```

Typical lifecycle:

```text
PENDING
   |
   v
PROCESSING
   |
   v
SHIPPED
   |
   v
DELIVERED
```

Cancellation/refund paths depend on payment and fulfillment state.

## Order snapshots

An order should preserve the shipping information used at checkout and the price/title of purchased items.

This prevents later profile or product changes from modifying historical orders.
