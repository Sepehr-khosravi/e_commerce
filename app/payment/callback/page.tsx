"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

export default function PaymentCallbackPage() {
  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    success,
    setSuccess,
  ] = useState(false);

  const [
    message,
    setMessage,
  ] = useState(
    "Verifying payment..."
  );

  useEffect(() => {
    async function verify() {
      const authority =
        searchParams.get(
          "Authority"
        );

      const status =
        searchParams.get(
          "Status"
        );

      if (!authority) {
        setSuccess(false);

        setMessage(
          "Invalid payment information."
        );

        setLoading(false);

        return;
      }

      try {
        const response =
          await fetch(
            `/api/payment/verify?Authority=${encodeURIComponent(
              authority
            )}&Status=${encodeURIComponent(
              status || ""
            )}`,
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        if (
          !response.ok ||
          !data.success
        ) {
          throw new Error(
            data.error ||
              data.message ||
              "Payment verification failed"
          );
        }

        setSuccess(true);

        setMessage(
          "Your payment was completed successfully."
        );
      } catch (error) {
        setSuccess(false);

        setMessage(
          error instanceof Error
            ? error.message
            : "Payment verification failed"
        );
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [searchParams]);

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center px-6">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-neutral-200 border-t-[#FF5858]" />

          <h1 className="mt-6 text-2xl font-bold">
            Verifying payment
          </h1>

          <p className="mt-2 text-neutral-500">
            Please wait...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl border border-neutral-200 bg-white p-8 text-center shadow-sm">
        <div className="text-5xl">
          {success ? "✓" : "×"}
        </div>

        <h1 className="mt-5 text-2xl font-bold">
          {success
            ? "Payment successful"
            : "Payment failed"}
        </h1>

        <p className="mt-3 text-neutral-500">
          {message}
        </p>

        <button
          type="button"
          onClick={() =>
            router.push(
              success
                ? "/dashboard/orders"
                : "/cart"
            )
          }
          className="mt-7 w-full rounded-xl bg-[#FF5858] px-5 py-3.5 font-semibold text-white"
        >
          {success
            ? "View my orders"
            : "Back to cart"}
        </button>
      </div>
    </main>
  );
}