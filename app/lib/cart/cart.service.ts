import {
  clearUserCart,
  countUserCartItems,
  createCartItem,
  createUserCart,
  deleteCartItem,
  findCartItem,
  findCartItemByProduct,
  findProductForCart,
  findProductVariantForCart,
  findUserCart,
  updateCartItemQuantity,
} from "./cart.repository";

const DEFAULT_CART_PAGE_SIZE = 20;
const MAX_CART_PAGE_SIZE = 20;
const MAX_CART_ITEMS = 100;

export async function getUserCart(
  userId: number,
  options?: {
    cursor?: number;
    limit?: number;
  }
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  const limit =
    options?.limit ?? DEFAULT_CART_PAGE_SIZE;

  if (
    !Number.isInteger(limit) ||
    limit <= 0 ||
    limit > MAX_CART_PAGE_SIZE
  ) {
    throw new Error(
      `Cart page size must be between 1 and ${MAX_CART_PAGE_SIZE}`
    );
  }

  const cursor = options?.cursor;

  if (
    cursor !== undefined &&
    (!Number.isInteger(cursor) || cursor <= 0)
  ) {
    throw new Error("Invalid cart cursor");
  }

  let cart = await findUserCart(userId, {
    cursor,
    limit,
  });

  if (!cart && cursor === undefined) {
    await createUserCart(userId);

    cart = await findUserCart(userId, {
      limit,
    });
  }

  if (!cart) {
    return {
      id: 0,
      items: [],
      totalItems: 0,
      nextCursor: null,
      hasMore: false,
    };
  }

  return cart;
}

export async function addProductToCart(
  userId: number,
  productId: number,
  quantity = 1,
  variantId: number | null = null
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error("Invalid product ID");
  }

  if (
    variantId !== null &&
    (!Number.isInteger(variantId) ||
      variantId <= 0)
  ) {
    throw new Error("Invalid variant ID");
  }

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than zero"
    );
  }

  /*
   * Make sure the product exists and
   * is available for purchase.
   */
  const product =
    await findProductForCart(productId);

  if (!product) {
    throw new Error("Product not found");
  }

  if (!product.isActive) {
    throw new Error(
      "This product is not available"
    );
  }

  /*
   * Products with variants must use a valid
   * active variant.
   */
  const hasVariants =
    product.variants.length > 0;

  if (hasVariants && variantId === null) {
    throw new Error(
      "Please select a product variant"
    );
  }

  /*
   * Products without variants cannot receive
   * a variant ID.
   */
  if (!hasVariants && variantId !== null) {
    throw new Error(
      "This product does not have variants"
    );
  }

  let availableStock: number;

  if (variantId !== null) {
    const variant =
      await findProductVariantForCart(
        productId,
        variantId
      );

    if (!variant) {
      throw new Error(
        "Product variant not found"
      );
    }

    availableStock = variant.count;

    if (availableStock <= 0) {
      throw new Error(
        "This product variant is out of stock"
      );
    }
  } else {
    availableStock = product.count;

    if (availableStock <= 0) {
      throw new Error(
        "This product is out of stock"
      );
    }
  }

  /*
   * The requested quantity can never exceed
   * the available stock of the selected
   * product/variant.
   */
  if (quantity > availableStock) {
    throw new Error(
      "Requested quantity exceeds available stock"
    );
  }

  /*
   * Get or create the user's cart.
   */
  const cart = await getUserCart(userId);

  /*
   * A cart item is unique by:
   *
   * product + variant
   *
   * This allows the same product to have
   * different colors in the cart.
   */
  const existingItem =
    await findCartItemByProduct(
      userId,
      productId,
      variantId
    );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity + quantity;

    if (newQuantity > availableStock) {
      throw new Error(
        "Requested quantity exceeds available stock"
      );
    }

    return updateCartItemQuantity({
      userId,
      itemId: existingItem.id,
      quantity: newQuantity,
    });
  }

  /*
   * Limit the number of different cart items.
   */
  const currentItemCount =
    await countUserCartItems(userId);

  if (currentItemCount >= MAX_CART_ITEMS) {
    throw new Error(
      `Your cart can contain a maximum of ${MAX_CART_ITEMS} different products`
    );
  }

  return createCartItem(
    {
      userId,
      productId,
      variantId,
      quantity,
    },
    cart.id
  );
}

export async function updateCartItem(
  userId: number,
  itemId: number,
  quantity: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (
    !Number.isInteger(itemId) ||
    itemId <= 0
  ) {
    throw new Error("Invalid cart item ID");
  }

  if (
    !Number.isInteger(quantity) ||
    quantity <= 0
  ) {
    throw new Error(
      "Quantity must be greater than zero"
    );
  }

  const item =
    await findCartItem(
      userId,
      itemId
    );

  if (!item) {
    throw new Error(
      "Cart item not found"
    );
  }

  if (!item.product.isActive) {
    throw new Error(
      "This product is no longer available"
    );
  }

  let availableStock: number;

  /*
   * If this cart item belongs to a variant,
   * validate and use that variant's stock.
   */
  if (item.variantId !== null) {
    if (!item.variant) {
      throw new Error(
        "Product variant not found"
      );
    }

    if (
      !item.variant.isActive ||
      item.variant.productId !==
        item.productId
    ) {
      throw new Error(
        "This product variant is no longer available"
      );
    }

    availableStock =
      item.variant.count;

    if (availableStock <= 0) {
      throw new Error(
        "This product variant is out of stock"
      );
    }
  } else {
    /*
     * Products without variants use the
     * product-level stock.
     */
    availableStock =
      item.product.count;

    if (availableStock <= 0) {
      throw new Error(
        "This product is out of stock"
      );
    }
  }

  if (quantity > availableStock) {
    throw new Error(
      "Requested quantity exceeds available stock"
    );
  }

  return updateCartItemQuantity({
    userId,
    itemId,
    quantity,
  });
}

export async function removeProductFromCart(
  userId: number,
  itemId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  if (
    !Number.isInteger(itemId) ||
    itemId <= 0
  ) {
    throw new Error("Invalid cart item ID");
  }

  const item =
    await findCartItem(
      userId,
      itemId
    );

  if (!item) {
    throw new Error(
      "Cart item not found"
    );
  }

  return deleteCartItem(itemId);
}

export async function clearCart(
  userId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  return clearUserCart(userId);
}