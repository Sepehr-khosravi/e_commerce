export default function OrderSkeleton() {
  return (
    <div className="animate-pulse rounded-3xl border border-neutral-100 p-6">

      <div className="flex items-center justify-between">

        <div>
          <div className="h-2.5 w-12 rounded bg-neutral-100" />
          <div className="mt-2 h-4 w-20 rounded bg-neutral-100" />
        </div>

        <div className="h-8 w-28 rounded-full bg-neutral-100" />

      </div>

      <div className="mt-6 flex gap-3">

        <div className="h-14 w-14 rounded-2xl bg-neutral-100" />

        <div className="flex-1">
          <div className="h-3 w-40 rounded bg-neutral-100" />
          <div className="mt-2 h-2.5 w-24 rounded bg-neutral-100" />
        </div>

      </div>

      <div className="mt-6 flex items-center justify-between border-t border-neutral-100 pt-5">

        <div>
          <div className="h-2.5 w-24 rounded bg-neutral-100" />
          <div className="mt-2 h-4 w-28 rounded bg-neutral-100" />
        </div>

        <div className="h-11 w-28 rounded-xl bg-neutral-100" />

      </div>

    </div>
  );
}