# Shopping Cart Routes

Base path:

`/api/cart`

Cart operations require an authenticated session.

## GET /api/cart

Returns the current user's cart and its items.

## POST /api/cart

Adds a product to the current user's cart.

Typical request:

```json
{
  "productId": 15,
  "quantity": 2
}
```

The service should validate:

- product exists
- product is active
- quantity is positive
- requested quantity does not exceed available stock

## PATCH /api/cart/[productId]

Changes the quantity of a cart item.

Example:

```json
{
  "quantity": 3
}
```

## DELETE /api/cart/[productId]

Removes a product from the cart.

## Important

The cart is not the order.

```text
Cart
  |
  | checkout
  v
Order
  |
  v
Payment
```

Prices must be re-read from the database during checkout.
