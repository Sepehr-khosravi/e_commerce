# Admin Routes

Base path:

`/api/admin`

Every admin route requires:

1. A valid authenticated session.
2. An administrator role.

A normal customer must receive `401` or `403` and must never be able to execute admin operations.

## Users

### GET /api/admin/users

Returns a paginated list of users.

Useful future filters:

```text
page
limit
query
role
verified
```

### GET /api/admin/users/[id]

Returns a specific user's administrative information.

The response should avoid exposing secrets or authentication internals.

## Products

### GET /api/admin/products

Returns products for administration, including inactive products when useful.

### POST /api/admin/products

Creates a product.

Example:

```json
{
  "title": "Example Product",
  "slug": "example-product",
  "price": 100,
  "offer": 80,
  "images": [],
  "description": "Example description",
  "categoryId": 1,
  "count": 50
}
```

### PATCH /api/admin/products/[id]

Updates product information.

### DELETE /api/admin/products/[id]

Normally performs a soft delete/deactivation.

Permanent deletion should be restricted because products can be referenced by historical orders.

## Orders

### GET /api/admin/orders

Returns orders across the store.

Useful filters:

```text
page
limit
status
query
```

### GET /api/admin/orders/[id]

Returns a complete order for administration.

### PATCH /api/admin/orders/[id]

Changes order status.

Example:

```json
{
  "status": "SHIPPED"
}
```

## Admin order workflow

```text
Customer
   |
   v
PAID / PENDING
   |
   v
Admin
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

## Admin security

Authorization must happen on the server.

Do not rely on:

```text
/admin
```

being hidden in the frontend.

Do not rely on a frontend variable such as:

```js
isAdmin === true
```

The API itself must verify the session and role.
