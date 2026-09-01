export default function CartSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-neutral-100 p-4 sm:p-5">

      <div className="flex gap-4">

        <div className="h-24 w-24 shrink-0 rounded-2xl bg-neutral-100 sm:h-28 sm:w-28" />

        <div className="flex flex-1 flex-col">

          <div className="h-4 w-2/3 rounded bg-neutral-100" />

          <div className="mt-3 h-3 w-1/3 rounded bg-neutral-100" />

          <div className="mt-auto flex items-end justify-between pt-6">

            <div className="h-4 w-24 rounded bg-neutral-100" />

            <div className="h-9 w-24 rounded-xl bg-neutral-100" />

          </div>

        </div>

      </div>

    </div>
  );
}