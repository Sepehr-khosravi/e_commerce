export interface CreateCategoryData {
  name: string;
  slug: string;
  description : string | null;
}

export interface UpdateCategoryData {
  name?: string;
  slug?: string;
}

export interface CategorySearchOptions {
  query?: string;
  cursor?: number;
  limit?: number;
}