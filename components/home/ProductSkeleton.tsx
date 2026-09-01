import Skeleton from "react-loading-skeleton";

export default function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-100 bg-white">
      <Skeleton
        height="100%"
        className="aspect-square rounded-none"
      />

      <div className="p-4 sm:p-5">
        <Skeleton width="80%" height={16} />
        <Skeleton
          width="60%"
          height={16}
          className="mt-1"
        />

        <div className="mt-5 flex items-center justify-between">
          <div>
            <Skeleton width={80} height={12} />
            <Skeleton
              width={120}
              height={16}
              className="mt-1"
            />
          </div>

          <Skeleton
            width={36}
            height={36}
            borderRadius={12}
          />
        </div>
      </div>
    </div>
  );
}