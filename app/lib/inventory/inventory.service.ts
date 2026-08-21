import {
  getLowStockProducts,
  getOutOfStockProducts,
  setProductStock,
} from "./inventory.repository";

export async function getLowStock(
  threshold = 5
) {
  if (
    !Number.isInteger(threshold) ||
    threshold < 0
  ) {
    throw new Error(
      "Invalid stock threshold"
    );
  }

  return getLowStockProducts(
    threshold
  );
}

export async function getOutOfStock() {
  return getOutOfStockProducts();
}

export async function updateInventory(
  productId: number,
  count: number
) {
  if (
    !Number.isInteger(productId) ||
    productId <= 0
  ) {
    throw new Error(
      "Invalid product ID"
    );
  }

  if (
    !Number.isInteger(count) ||
    count < 0
  ) {
    throw new Error(
      "Invalid stock count"
    );
  }

  return setProductStock(
    productId,
    count
  );
}