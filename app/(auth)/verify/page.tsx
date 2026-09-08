import { Suspense } from "react";

import VerifyPageContent from "./VerifyPageContent";

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-1 items-center justify-center bg-neutral-50 px-4 py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-200 border-t-black" />
        </div>
      }
    >
      <VerifyPageContent />
    </Suspense>
  );
}