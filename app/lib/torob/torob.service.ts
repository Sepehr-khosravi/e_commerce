
import { TorobRepository } from "./torob.repository";

import type {
  TorobRequest,
  TorobProduct,
  TorobProductsResponse,
} from "./torob.types";

const PAGE_SIZE = 100;

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export class TorobService {
  constructor(
    private readonly repository: TorobRepository,
  ) {}

  // =========================
  // PRODUCT URL
  // =========================

  private buildProductUrl(slug: string): string {
    return `${SITE_URL}/products/${slug}`;
  }

  // =========================
  // IMAGE URL
  // =========================

  private buildImageUrl(image: string): string {
    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${SITE_URL}${
      image.startsWith("/") ? "" : "/"
    }${image}`;
  }

  // =========================
  // MAP PRODUCT
  // =========================

  private mapProduct(product: {
    id: number;
    title: string;
    slug: string;
    price: unknown;
    offer: unknown;
    images: string[];
    description: string;
    count: number;
    createdAt: Date;
    updatedAt: Date;
    category: {
      name: string;
    };
  }): TorobProduct {
    const price = Number(product.price);

    const offer =
      product.offer !== null &&
      product.offer !== undefined
        ? Number(product.offer)
        : null;

    const availability = product.count > 0;

    // ---------------------------------
    // Calculate final price
    //
    // offer = percentage discount
    // ---------------------------------

    let currentPrice = price;

    if (offer !== null && offer > 0) {
      currentPrice =
        price - (price * offer) / 100;
    }

    // Torob requires current_price = 0
    // when product is unavailable.
    if (!availability) {
      currentPrice = 0;
    }

    const hasOffer =
      availability &&
      offer !== null &&
      offer > 0;

    const oldPrice = hasOffer
      ? Math.round(price)
      : undefined;

    // ---------------------------------
    // Images
    // ---------------------------------

    const imageLinks = Array.isArray(product.images)
      ? product.images
          .filter(
            (image): image is string =>
              typeof image === "string" &&
              image.length > 0,
          )
          .map((image) =>
            this.buildImageUrl(image),
          )
      : [];

    // ---------------------------------
    // Short description
    // ---------------------------------

    const shortDescription =
      product.description
        ? product.description.slice(0, 500)
        : undefined;

    // ---------------------------------
    // Torob product
    // ---------------------------------

    return {
      page_unique: String(product.id),

      page_url: this.buildProductUrl(
        product.slug,
      ),

      product_group_id: String(product.id),

      title: product.title,

      current_price: Math.round(
        currentPrice,
      ),

      ...(oldPrice !== undefined
        ? {
            old_price: oldPrice,
          }
        : {}),

      availability,

      category_name:
        product.category?.name,

      image_links: imageLinks,

      // Your Product model currently
      // doesn't have product specifications.
      spec: {},

      short_desc: shortDescription,

      date_added:
        product.createdAt.toISOString(),

      date_updated:
        product.updatedAt.toISOString(),
    };
  }

  // =========================
  // PAGE URL -> SLUG
  // =========================

  private extractSlugFromUrl(
    url: string,
  ): string | null {
    try {
      const parsedUrl = new URL(url);

      const parts = parsedUrl.pathname
        .split("/")
        .filter(Boolean);

      return parts.at(-1) ?? null;
    } catch {
      return null;
    }
  }

  // =========================
  // GET PRODUCTS
  // =========================

  async getProducts(
    request: TorobRequest,
  ): Promise<TorobProductsResponse> {
    // =====================================================
    // 1. PAGE URLS
    // =====================================================

    if ("page_urls" in request) {
      if (!Array.isArray(request.page_urls)) {
        throw new Error(
          "page_urls must be an array",
        );
      }

      const slugs = request.page_urls
        .map((url) =>
          this.extractSlugFromUrl(url),
        )
        .filter(
          (slug): slug is string =>
            Boolean(slug),
        );

      const products =
        await this.repository.getProductsBySlugs(
          slugs,
        );

      return {
        api_version: "torob_api_v3",

        current_page: 1,

        total: products.length,

        max_pages: 1,

        next_cursor: null,

        products: products.map((product) =>
          this.mapProduct(product),
        ),
      };
    }

    // =====================================================
    // 2. PAGE UNIQUES
    // =====================================================

    if ("page_uniques" in request) {
      if (!Array.isArray(request.page_uniques)) {
        throw new Error(
          "page_uniques must be an array",
        );
      }

      const ids = request.page_uniques
        .map((value) => Number(value))
        .filter((id) =>
          Number.isInteger(id),
        );

      const products =
        await this.repository.getProductsByIds(
          ids,
        );

      return {
        api_version: "torob_api_v3",

        current_page: 1,

        total: products.length,

        max_pages: 1,

        next_cursor: null,

        products: products.map((product) =>
          this.mapProduct(product),
        ),
      };
    }

    // =====================================================
    // 3. CURSOR PAGINATION
    // =====================================================

    if (
      "sort" in request &&
      request.sort === "product_id_desc"
    ) {
      const result =
        await this.repository.getProductsByCursor(
          request.cursor,
        );

      return {
        api_version: "torob_api_v3",

        current_page: 1,

        total: null,

        max_pages: null,

        next_cursor: result.nextCursor,

        products: result.products.map(
          (product) =>
            this.mapProduct(product),
        ),
      };
    }

    // =====================================================
    // 4. NORMAL PAGE PAGINATION
    // =====================================================

    if ("page" in request) {
      const page = request.page;

      let products;

      if (
        request.sort ===
        "date_updated_desc"
      ) {
        products =
          await this.repository.getProductsByUpdatedPage(
            page,
          );
      } else {
        products =
          await this.repository.getProductsByPage(
            page,
          );
      }

      const total =
        await this.repository.countProducts();

      const maxPages = Math.ceil(
        total / PAGE_SIZE,
      );

      return {
        api_version: "torob_api_v3",

        current_page: page,

        total,

        max_pages: maxPages,

        next_cursor: null,

        products: products.map((product) =>
          this.mapProduct(product),
        ),
      };
    }

    // =====================================================
    // SHOULD NEVER HAPPEN
    // =====================================================

    throw new Error(
      "Invalid Torob request",
    );
  }
}
