export interface FavoriteProductInput {
  userId: number;
  productId: number;
}

export interface GetFavoritesOptions {
  cursor?: number;
  limit?: number;
}