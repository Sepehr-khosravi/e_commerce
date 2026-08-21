export interface InventoryUpdate {
  productId: number;
  count: number;
}

export interface InventoryAdjustment {
  productId: number;
  amount: number;
}