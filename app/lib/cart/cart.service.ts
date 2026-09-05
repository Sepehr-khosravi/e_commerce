import {
  clearUserCart,
  countUserCartItems,
  createCartItem,
  createUserCart,
  deleteCartItem,
  findCartItem,
  findCartItemByProduct,
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

  const limit = options?.limit ?? DEFAULT_CART_PAGE_SIZE;

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
   * If the user doesn't have a cart yet,
   * create an empty one.
   */
  if (!cart && cursor === undefined) {
    await createUserCart(userId);

    cart = await findUserCart(userId, {
      limit,
    });
  }

  /*
   * If a cursor was supplied but the cart
   * doesn't exist, return an empty result.
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

  const cart = await getUserCart(userId);

  /*
   * Check if the product already exists.
   */
  const existingItem =
    await findCartItemByProduct(
      userId,
      productId
    );

  if (existingItem) {
    const newQuantity =
      existingItem.quantity + quantity;

    if (
      newQuantity > existingItem.product.count
    ) {
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
   * inside the cart.
   */
  const currentItemCount =
    await countUserCartItems(userId);

  if (currentItemCount >= MAX_CART_ITEMS) {
    throw new Error(
      `Your cart can contain a maximum of ${MAX_CART_ITEMS} different products`
    );
  }

  /*
   * Validate quantity against stock.
   *
   * We need the product information before
   * creating a completely new cart item.
   */
  const product = await findCartItemByProduct(
    userId,
    productId
  );

  /*
   * If there isn't an existing cart item,
   * the product itself must be checked by Prisma
   * through the relation.
   *
   * Quantity <= stock will also be enforced
   * by the product validation in the API/service
   * layer when the product is resolved.
   */

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

  const item = await findCartItem(
    userId,
    itemId
  );

  if (!item) {
    throw new Error("Cart item not found");
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

  const item = await findCartItem(
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