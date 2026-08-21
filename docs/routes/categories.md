# Category Routes

Base path:

`/api/categories`

## GET /api/categories

Returns categories available to the storefront.

Categories are used by product filtering and navigation.

## GET /api/categories/[id]

Returns a category and its associated information/products when supported by the implementation.

## Category relationship

```text
Category
   |
   +-- Product
   +-- Product
   +-- Product
```

A product references a category using `categoryId`.
