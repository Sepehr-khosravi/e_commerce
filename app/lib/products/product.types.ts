import type { Prisma } from "@/generated/prisma/client";

export type ProductSort =
  | "newest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "popular";

export type SearchProductsOptions = {
  query?: string;
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  sort?: ProductSort;
  cursor?: string;
  limit?: number;
  includeInactive?: boolean;
};

export type ProductWithRelations = Prisma.ProductGetPayload<{
  include: {
    category: true;
    variants: true;
  };
}>;

export interface ProductPagination {
  products: ProductWithRelations[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface CreateProductVariantData {
  /**
   * HEX color.
   *
   * null = product has no color variants.
   */
  color?: string | null;

  /**
   * Stock for this specific variant/color.
   */
  count: number;
}

export interface UpdateProductVariantData {
  /**
   * Existing variant ID.
   *
   * If omitted, a new variant will be created.
   */
  id?: number;

  /**
   * HEX color.
   *
   * null = colorless/default variant.
   */
  color?: string | null;

  /**
   * Stock for this specific variant/color.
   */
  count: number;
}

export interface CreateProductData {
  title: string;

  slug: string;

  price: number;

  offer?: number | null;

  images: string[];

  description: string;

  categoryId: number;

  /**
   * Every product must have at least one variant.
   *
   * Colorless product:
   *
   * [
   *   {
   *     color: null,
   *     count: 10
   *   }
   * ]
   *
   * Colored product:
   *
   * [
   *   {
   *     color: "#FFFFFF",
   *     count: 3
   *   },
   *   {
   *     color: "#000000",
   *     count: 7
   *   }
   * ]
   */
  variants: CreateProductVariantData[];

  isFeatured?: boolean;

  isActive?: boolean;
}

export interface UpdateProductData {
  title?: string;

  slug?: string;

  price?: number;

  offer?: number | null;

  images?: string[];

  description?: string;

  categoryId?: number;

  /**
   * If provided, the complete desired variant list.
   *
   * Existing variants should contain their id.
   * New variants don't need an id.
   */
  variants?: UpdateProductVariantData[];

  isFeatured?: boolean;

  isActive?: boolean;
}