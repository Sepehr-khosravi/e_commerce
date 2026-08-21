import {
  clearUserCart,
  createCartItem,
  createUserCart,
  deleteCartItem,
  findCartItem,
  findCartItemByProduct,
  findUserCart,
  updateCartItemQuantity,
} from "./cart.repository";

export async function getUserCart(
  userId: number
) {
  if (!Number.isInteger(userId) || userId <= 0) {
    throw new Error("Invalid user ID");
  }

  let cart = await findUserCart(userId);

  if (!cart) {
    cart = await createUserCart(userId);
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
   * Check if the product already exists in the cart.
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
   * We need to retrieve the product through the
   * existing cart item lookup if it exists.
   *
   * For a new item, Prisma will enforce the
   * product relation. Stock validation will be
   * handled by the product lookup in the next
   * refinement of the repository.
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