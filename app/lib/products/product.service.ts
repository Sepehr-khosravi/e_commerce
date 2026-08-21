import {
  createProduct,
  deleteProduct,
  findFeaturedProducts,
  findNewestProducts,
  findPopularProducts,
  findProductById,
  findProductBySlug,
  findProducts,
  incrementPurchaseCount,
  permanentlyDeleteProduct,
  setProductFeatured,
  updateProduct,
  updateProductStock,
} from "./product.repository";

import type {
  CreateProductData,
  SearchProductsOptions,
  UpdateProductData,
} from "./product.types";

export async function getProductById(id: number) {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Invalid product ID");
  }

  const product = await findProductById(id);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function getProductBySlug(
  slug: string
) {
  if (!slug || slug.trim().length === 0) {
    throw new Error("Product slug is required");
  }

  const product = await findProductBySlug(slug);

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
}

export async function searchProducts(
  options: SearchProductsOptions
) {
  const limit = Math.min(
    Math.max(options.limit ?? 20, 1),
    100
  );

  return findProducts({
    ...options,
    limit,
  });
}

export async function getPopularProducts(
  limit = 10
) {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findPopularProducts(safeLimit);
}

export async function getFeaturedProducts(
  limit = 10
) {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findFeaturedProducts(safeLimit);
}

export async function getNewestProducts(
  limit = 10
) {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findNewestProducts(safeLimit);
}

export async function createNewProduct(
  data: CreateProductData
) {
  if (!data.title.trim()) {
    throw new Error("Product title is required");
  }

  if (!data.slug.trim()) {
    throw new Error("Product slug is required");
  }

  if (data.price < 0) {
    throw new Error("Product price cannot be negative");
  }

  if (data.offer !== undefined && data.offer !== null) {
    if (data.offer < 0) {
      throw new Error(
        "Product offer cannot be negative"
      );
    }

    if (data.offer > data.price) {
      throw new Error(
        "Offer price cannot be greater than product price"
      );
    }
  }

  if (!data.description.trim()) {
    throw new Error(
      "Product description is required"
    );
  }

  if (data.images.length === 0) {
    throw new Error(
      "At least one product image is required"
    );
  }

  if (data.count !== undefined && data.count < 0) {
    throw new Error(
      "Product stock cannot be negative"
    );
  }

  return await createProduct(data);
}

export async function editProduct(
  id: number,
  data: UpdateProductData
) {
  await getProductById(id);

  if (
    data.title !== undefined &&
    !data.title.trim()
  ) {
    throw new Error("Product title cannot be empty");
  }

  if (
    data.slug !== undefined &&
    !data.slug.trim()
  ) {
    throw new Error("Product slug cannot be empty");
  }

  if (
    data.price !== undefined &&
    data.price < 0
  ) {
    throw new Error(
      "Product price cannot be negative"
    );
  }

  if (
    data.offer !== undefined &&
    data.offer !== null &&
    data.offer < 0
  ) {
    throw new Error(
      "Product offer cannot be negative"
    );
  }

  if (
    data.price !== undefined &&
    data.offer !== undefined &&
    data.offer !== null &&
    data.offer > data.price
  ) {
    throw new Error(
      "Offer price cannot be greater than product price"
    );
  }

  if (
    data.count !== undefined &&
    data.count < 0
  ) {
    throw new Error(
      "Product stock cannot be negative"
    );
  }

  return updateProduct(id, data);
}

export async function deactivateProduct(
  id: number
) {
  await getProductById(id);

  return deleteProduct(id);
}

export async function permanentlyRemoveProduct(
  id: number
) {
  return permanentlyDeleteProduct(id);
}

export async function featureProduct(
  id: number
) {
  await getProductById(id);

  return setProductFeatured(id, true);
}

export async function unfeatureProduct(
  id: number
) {
  await getProductById(id);

  return setProductFeatured(id, false);
}

export async function changeProductStock(
  id: number,
  count: number
) {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error("Invalid stock value");
  }

  await getProductById(id);

  return updateProductStock(id, count);
}

export async function recordProductPurchase(
  id: number,
  amount = 1
) {
  if (!Number.isInteger(amount) || amount <= 0) {
    throw new Error(
      "Purchase amount must be greater than zero"
    );
  }

  return incrementPurchaseCount(id, amount);
}