export interface AddToCartData {
  userId: number;
  productId: number;
  quantity: number;
}

export interface UpdateCartItemData {
  userId: number;
  itemId: number;
  quantity: number;
}

export interface RemoveCartItemData {
  userId: number;
  itemId: number;
}

export interface GetCartOptions {
  userId: number;
}