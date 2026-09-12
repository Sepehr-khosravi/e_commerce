import {
  createProduct,
  deleteProduct,
  findAdminProducts,
  findFeaturedProducts,
  findNewestProducts,
  findPopularProducts,
  findProductById,
  findProductBySlug,
  findProductVariantById,
  findProducts,
  incrementPurchaseCount,
  permanentlyDeleteProduct,
  setProductFeatured,
  updateProduct,
  updateProductVariantStock,
} from "./product.repository";

import type {
  CreateProductData,
  SearchProductsOptions,
  UpdateProductData,
} from "./product.types";

/* =========================================================
   GET PRODUCT
   ========================================================= */

export async function getProductById(
  id: number
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  const product =
    await findProductById(id);

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return product;
}

export async function getProductBySlug(
  slug: string
) {
  if (
    !slug ||
    slug.trim().length === 0
  ) {
    throw new Error(
      "Product slug is required"
    );
  }

  const product =
    await findProductBySlug(
      slug.trim()
    );

  if (!product) {
    throw new Error(
      "Product not found"
    );
  }

  return product;
}

/* =========================================================
   ADMIN PRODUCTS
   ========================================================= */

export async function getAdminProducts(
  options: {
    query?: string;
    categoryId?: number;
    cursor?: string;
    limit?: number;
    sort?: "newest" | "oldest";
  } = {}
) {
  const limit = Math.min(
    Math.max(
      options.limit ?? 10,
      1
    ),
    50
  );

  return findAdminProducts({
    ...options,
    limit,
  });
}

/* =========================================================
   SEARCH PRODUCTS
   ========================================================= */

export async function searchProducts(
  options: SearchProductsOptions
) {
  const limit = Math.min(
    Math.max(
      options.limit ?? 20,
      1
    ),
    100
  );

  return findProducts({
    ...options,
    limit,
  });
}

/* =========================================================
   SPECIAL PRODUCTS
   ========================================================= */

export async function getPopularProducts(
  limit = 10
) {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findPopularProducts(
    safeLimit
  );
}

export async function getFeaturedProducts(
  limit = 10
) {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findFeaturedProducts(
    safeLimit
  );
}

export async function getNewestProducts(
  limit = 10
) {
  const safeLimit = Math.min(
    Math.max(limit, 1),
    100
  );

  return findNewestProducts(
    safeLimit
  );
}

/* =========================================================
   CREATE PRODUCT
   ========================================================= */

export async function createNewProduct(
  data: CreateProductData
) {
  if (
    !data.title ||
    !data.title.trim()
  ) {
    throw new Error(
      "Product title is required"
    );
  }

  if (
    !data.slug ||
    !data.slug.trim()
  ) {
    throw new Error(
      "Product slug is required"
    );
  }

  if (
    !Number.isFinite(data.price) ||
    data.price < 0
  ) {
    throw new Error(
      "Product price cannot be negative"
    );
  }

  if (
    data.offer !== undefined &&
    data.offer !== null
  ) {
    if (
      !Number.isFinite(data.offer) ||
      data.offer < 0
    ) {
      throw new Error(
        "Product offer cannot be negative"
      );
    }

    if (
      data.offer > data.price
    ) {
      throw new Error(
        "Offer price cannot be greater than product price"
      );
    }
  }

  if (
    !data.description ||
    !data.description.trim()
  ) {
    throw new Error(
      "Product description is required"
    );
  }

  validateProductVariants(
    data.variants
  );

  return createProduct({
    ...data,

    title: data.title.trim(),

    slug: data.slug.trim(),

    description:
      data.description.trim(),

    variants:
      normalizeProductVariants(
        data.variants
      ),
  });
}

/* =========================================================
   UPDATE PRODUCT
   ========================================================= */

export async function editProduct(
  id: number,
  data: UpdateProductData
) {
  await getProductById(id);

  if (
    data.title !== undefined &&
    !data.title.trim()
  ) {
    throw new Error(
      "Product title cannot be empty"
    );
  }

  if (
    data.slug !== undefined &&
    !data.slug.trim()
  ) {
    throw new Error(
      "Product slug cannot be empty"
    );
  }

  if (
    data.price !== undefined &&
    (
      !Number.isFinite(
        data.price
      ) ||
      data.price < 0
    )
  ) {
    throw new Error(
      "Product price cannot be negative"
    );
  }

  if (
    data.offer !== undefined &&
    data.offer !== null
  ) {
    if (
      !Number.isFinite(
        data.offer
      ) ||
      data.offer < 0
    ) {
      throw new Error(
        "Product offer cannot be negative"
      );
    }

    /*
     * If price is not being updated,
     * compare the offer with the existing price.
     */

    const effectivePrice =
      data.price ??
      Number((await getProductById(id)).price);
    
    if (
      data.offer > effectivePrice
    ) {
      throw new Error(
        "Offer price cannot be greater than product price"
      );
    }
  }

  if (
    data.description !== undefined &&
    !data.description.trim()
  ) {
    throw new Error(
      "Product description cannot be empty"
    );
  }

  if (
    data.variants !== undefined
  ) {
    validateProductVariants(
      data.variants
    );
  }

  return updateProduct(id, {
    ...data,

    ...(data.title !== undefined
      ? {
          title:
            data.title.trim(),
        }
      : {}),

    ...(data.slug !== undefined
      ? {
          slug:
            data.slug.trim(),
        }
      : {}),

    ...(data.description !==
    undefined
      ? {
          description:
            data.description.trim(),
        }
      : {}),

    ...(data.variants !== undefined
      ? {
          variants:
            normalizeProductVariants(
              data.variants
            ),
        }
      : {}),
  });
}

/* =========================================================
   PRODUCT STATUS
   ========================================================= */

export async function deactivateProduct(
  id: number
) {
  await getProductById(id);

  return deleteProduct(id);
}

export async function permanentlyRemoveProduct(
  id: number
) {
  if (
    !Number.isInteger(id) ||
    id <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  return permanentlyDeleteProduct(
    id
  );
}

export async function featureProduct(
  id: number
) {
  await getProductById(id);

  return setProductFeatured(
    id,
    true
  );
}

export async function unfeatureProduct(
  id: number
) {
  await getProductById(id);

  return setProductFeatured(
    id,
    false
  );
}

/* =========================================================
   VARIANT STOCK
   ========================================================= */

export async function changeProductVariantStock(
  variantId: number,
  count: number
) {
  if (
    !Number.isInteger(variantId) ||
    variantId <= 0
  ) {
    throw new Error(
      "Invalid variant ID"
    );
  }

  if (
    !Number.isInteger(count) ||
    count < 0
  ) {
    throw new Error(
      "Invalid stock value"
    );
  }

  const variant =
    await findProductVariantById(
      variantId
    );

  if (!variant) {
    throw new Error(
      "Product variant not found"
    );
  }

  return updateProductVariantStock(
    variantId,
    count
  );
}

/* =========================================================
   PURCHASE COUNT
   ========================================================= */

export async function recordProductPurchase(
  id: number,
  amount = 1
) {
  if (
    !Number.isInteger(amount) ||
    amount <= 0
  ) {
    throw new Error(
      "Purchase amount must be greater than zero"
    );
  }

  await getProductById(id);

  return incrementPurchaseCount(
    id,
    amount
  );
}

/* =========================================================
   VARIANT VALIDATION
   ========================================================= */

function validateProductVariants(
  variants:
    | Array<{
        id?: number;
        color?: string | null;
        count: number;
      }>
    | undefined
) {
  /*
   * Every product must have at least
   * one variant.
   */

  if (
    !variants ||
    !Array.isArray(variants) ||
    variants.length === 0
  ) {
    throw new Error(
      "Product must have at least one variant"
    );
  }

  const colors = new Set<string>();

  let hasColorlessVariant = false;

  for (const variant of variants) {
    if (
      variant.id !== undefined &&
      (
        !Number.isInteger(
          variant.id
        ) ||
        variant.id <= 0
      )
    ) {
      throw new Error(
        "Invalid product variant ID"
      );
    }

    if (
      !Number.isInteger(
        variant.count
      ) ||
      variant.count < 0
    ) {
      throw new Error(
        "Product variant stock cannot be negative"
      );
    }

    /*
     * No color.
     */

    if (
      variant.color === null ||
      variant.color === undefined
    ) {
      if (
        hasColorlessVariant
      ) {
        throw new Error(
          "A product can have only one colorless variant"
        );
      }

      hasColorlessVariant =
        true;

      continue;
    }

    if (
      typeof variant.color !==
      "string"
    ) {
      throw new Error(
        "Product variant color must be a string"
      );
    }

    const color =
      variant.color.trim();

    const hexColorRegex =
      /^#(?:[0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

    if (
      !hexColorRegex.test(color)
    ) {
      throw new Error(
        `Invalid product color: ${variant.color}`
      );
    }

    /*
     * Store colors case-insensitively.
     */

    const normalizedColor =
      color.toUpperCase();

    if (
      colors.has(
        normalizedColor
      )
    ) {
      throw new Error(
        `Duplicate product color: ${color}`
      );
    }

    colors.add(
      normalizedColor
    );
  }

  /*
   * A colorless product has exactly
   * one default variant.
   *
   * It cannot simultaneously have
   * colored variants.
   */

  if (
    hasColorlessVariant &&
    variants.length > 1
  ) {
    throw new Error(
      "A colorless product cannot have colored variants"
    );
  }
}

/* =========================================================
   VARIANT NORMALIZATION
   ========================================================= */

function normalizeProductVariants<
  T extends {
    id?: number;
    color?: string | null;
    count: number;
  }
>(variants: T[]) {
  return variants.map(
    (variant) => ({
      ...(variant.id !== undefined
        ? {
            id: variant.id,
          }
        : {}),

      color:
        variant.color === null ||
        variant.color === undefined
          ? null
          : variant.color
              .trim()
              .toUpperCase(),

      count: variant.count,
    })
  );
}