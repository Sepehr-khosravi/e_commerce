# Favorites Routes

Base path:

`/api/favorites`

All favorite operations require an authenticated session.

## GET /api/favorites

Returns the user's favorite products.

## POST /api/favorites

Adds a product to favorites.

Typical request:

```json
{
  "productId": 15
}
```

## DELETE /api/favorites/[productId]

Removes a product from favorites.

Favorites are independent from the shopping cart:

```text
Favorite = products the user wants to remember
Cart     = products the user intends to purchase
```
