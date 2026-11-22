"use client";

import { useState } from "react";
import { apiRequest } from "@/lib/salon-api";

type Props = {
  appointmentId: string;
};

export default function PayNowButton({ appointmentId }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handlePayment() {
    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const result = await apiRequest<{ url: string }>(
        "/api/payments/checkout",
        {
          method: "POST",
          body: JSON.stringify({ appointmentId }),
        },
      );

      const checkoutURL = new URL(result.url);

      if (
        checkoutURL.protocol !== "https:" ||
        checkoutURL.hostname !== "checkout.stripe.com"
      ) {
        throw new Error("Invalid Stripe Checkout URL");
      }

      window.location.assign(result.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start payment");

      setLoading(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className="bg-[#984E59] px-6 py-3 text-xs font-semibold uppercase tracking-wider text-white disabled:opacity-60"
      >
        {loading ? "Redirecting..." : "Pay Now"}
      </button>

      {error && (
        <p role="alert" className="mt-2 text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
