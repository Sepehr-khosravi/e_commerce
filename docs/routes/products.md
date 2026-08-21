# Product Routes

Base path:

`/api/products`

Products are public unless the route explicitly belongs to `/api/admin`.

## GET /api/products

Searches and paginates active products.

Query parameters:

| Parameter | Purpose |
|---|---|
| `query` | Search product titles |
| `categoryId` | Filter by category |
| `minPrice` | Minimum price |
| `maxPrice` | Maximum price |
| `sort` | Sorting method |
| `cursor` | Cursor for the next page |
| `limit` | Number of products |

Sorting:

```text
newest
oldest
price_asc
price_desc
popular
```

Example:

```text
GET /api/products?query=phone&limit=20
```

Cursor pagination response:

```json
{
  "products": [],
  "nextCursor": 42,
  "hasNextPage": true
}
```

For infinite scrolling, the frontend requests the next page with `cursor=42`.

## GET /api/products/[id]

Returns a product by numeric ID.

## GET /api/products/slug/[slug]

Returns a product using its slug.

## Product administration

Administrators can create, edit, deactivate and permanently remove products through the admin routes.

A normal product deletion should normally be a soft deletion (`isActive=false`) so historical order records remain valid.

## Product fields

The current product design includes:

```text
id
title
slug
price
offer
images
description
categoryId
count
purchaseCount
isFeatured
isActive
createdAt
updatedAt
```
