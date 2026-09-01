import { Suspense } from "react";
import VerifyPageContent from "./VerifyPageContent";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <VerifyPageContent />
    </Suspense>
  );
}