export default function SearchSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-3xl bg-white"
          >
            {/* Image */}
            <div className="aspect-square animate-pulse rounded-3xl bg-neutral-100" />

            {/* Content */}
            <div className="space-y-3 px-2 py-4">

              <div className="h-4 w-3/4 animate-pulse rounded-full bg-neutral-100" />

              <div className="h-3 w-1/2 animate-pulse rounded-full bg-neutral-100" />

              <div className="h-5 w-1/3 animate-pulse rounded-full bg-neutral-100" />

            </div>
          </div>
        )
      )}
    </div>
  );
}