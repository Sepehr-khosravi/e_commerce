
// =========================
// REQUEST
// =========================

export type TorobRequest =
  // Get products by exact product URLs
  | {
      page_urls: string[];
    }

  // Get products by page_unique
  | {
      page_uniques: string[];
    }

  // Normal pagination
  | {
      page: number;
      sort: "date_added_desc" | "date_updated_desc";
    }

  // Cursor pagination
  | {
      sort: "product_id_desc";
      cursor?: string;
    };

// =========================
// PRODUCT
// =========================

export interface TorobProduct {
  page_unique: string;

  page_url: string;

  product_group_id?: string;

  title: string;

  subtitle?: string;

  current_price: number;

  old_price?: number;

  availability: boolean;

  category_name?: string;

  image_links: string[];

  spec: Record<string, string>;

  guarantee?: string;

  short_desc?: string;

  date_added: string;

  date_updated?: string;
}

// =========================
// RESPONSE
// =========================

export interface TorobProductsResponse {
  api_version: "torob_api_v3";

  current_page: number;

  total: number | null;

  max_pages: number | null;

  next_cursor?: string | null;

  products: TorobProduct[];
}
