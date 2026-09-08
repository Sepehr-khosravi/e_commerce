import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

export default function CategorySkeleton() {
  return (
    <div
      dir="rtl"
      className="
        -mx-4
        flex
        flex-nowrap
        items-start
        justify-start
        gap-5
        overflow-hidden
        px-4
        pb-3
        sm:gap-7
        md:mx-0
        md:justify-center
        md:gap-10
        md:px-0
      "
    >
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="
            flex
            shrink-0
            flex-col
            items-center
            gap-2.5
          "
        >
          {/* Circle */}

          <Skeleton
            circle
            width={56}
            height={56}
          />

          {/* Category name */}

          <Skeleton
            width={55 + (index % 2) * 15}
            height={10}
            borderRadius={5}
          />
        </div>
      ))}
    </div>
  );
}