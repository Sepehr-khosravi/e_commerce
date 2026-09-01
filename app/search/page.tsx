import Navbar from "@/components/navbar/Navbar";
import SearchFilters from "@/components/search/SearchFilters";
import SearchResults from "@/components/search/SearchResults";

import { getCategories } from "@/app/lib/categories/category.service";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
    sort?: string;
    categoryId?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
};

type Category = {
  id: number;
  name: string;
};

export default async function SearchPage({
  searchParams,
}: SearchPageProps) {
  const params = await searchParams;

  const query =
    typeof params.q === "string"
      ? params.q.trim()
      : "";

  const sort =
    typeof params.sort === "string"
      ? params.sort
      : "newest";

  const categoryId =
    typeof params.categoryId === "string"
      ? params.categoryId
      : "";

  const minPrice =
    typeof params.minPrice === "string"
      ? params.minPrice
      : "";

  const maxPrice =
    typeof params.maxPrice === "string"
      ? params.maxPrice
      : "";

  let categories: Category[] = [];
  
  try {
    const result = await getCategories();
  
    categories = result.categories.map((category) => ({
      id: category.id,
      name: category.name,
    }));
  } catch (error) {
    console.error(
      "Failed to fetch categories:",
      error
    );
  }

  return (
    <main className="min-h-screen bg-white">

      <section className="mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-6 lg:px-8">

        <div className="mb-10">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            Search
          </span>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-black sm:text-4xl">
            نتایج جستجو
          </h1>

          {query && (
            <p className="mt-3 text-sm text-neutral-500">
              نتایج جستجو برای
              <span className="mr-1 font-bold text-black">
                «{query}»
              </span>
            </p>
          )}
        </div>

        <div className="mb-8">
          <SearchFilters
            categories={categories}
          />
        </div>

        {query ? (
          <SearchResults
            query={query}
            sort={sort}
            categoryId={categoryId}
            minPrice={minPrice}
            maxPrice={maxPrice}
          />
        ) : (
          <div className="rounded-3xl bg-neutral-50 px-6 py-20 text-center">
            <p className="text-sm font-semibold text-neutral-500">
              برای جستجو، عبارت موردنظر خود را وارد کنید.
            </p>
          </div>
        )}

      </section>
    </main>
  );
}