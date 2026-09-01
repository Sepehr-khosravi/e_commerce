export type ProductCategory = {
  id: number;
  name: string;
  slug: string;
};

export type Product = {
  id: number;
  title: string;
  slug: string;

  price: number | string;
  offer?: number | string | null;

  images: string[];

  count: number;

  isFeatured: boolean;
  isActive: boolean;

  category?: ProductCategory | null;
};