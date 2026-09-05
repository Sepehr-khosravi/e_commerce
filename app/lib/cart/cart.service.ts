import {
  clearUserCart,
  countUserCartItems,
  createCartItem,
  createUserCart,
  deleteCartItem,
  findCartItem,
  findCartItemByProduct,
  findProductForCart,
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

  /*
   * Create an empty cart for the user
   * if they don't have one yet.
   */
  if (!cart && cursor === undefined) {
    await createUserCart(userId);

    cart = await findUserCart(userId, {
      limit,
    });
  }

  /*
   * A cursor was supplied but the user
   * doesn't have a cart.
   */
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
  quantity = 1
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

  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      "Quantity must be greater than zero"
    );
  }

  /*
   * Make sure the product actually exists
   * and is available for purchase.
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

  if (product.count <= 0) {
    throw new Error(
      "This product is out of stock"
    );
  }

  /*
   * The requested quantity can never be
   * greater than the available stock.
   */
  if (quantity > product.count) {
    throw new Error(
      "Requested quantity exceeds available stock"
    );
  }

  /*
   * Get or create the user's cart.
   */
  const cart = await getUserCart(userId);

  /*
   * Check whether this product is already
   * inside the cart.
   */
  const existingItem =
    await findCartItemByProduct(
      userId,
      productId
    );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity + quantity;

    /*
     * Make sure the total quantity in the
     * cart doesn't exceed current stock.
     */
    if (newQuantity > product.count) {
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
   * Limit the number of different products
   * in the cart.
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

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid cart item ID");
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
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
    throw new Error("Cart item not found");
  }

  if (!item.product.isActive) {
    throw new Error(
      "This product is no longer available"
    );
  }

  if (quantity > item.product.count) {
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

  if (!Number.isInteger(itemId) || itemId <= 0) {
    throw new Error("Invalid cart item ID");
  }

  const item =
    await findCartItem(
      userId,
      itemId
    );

  if (!item) {
    throw new Error("Cart item not found");
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