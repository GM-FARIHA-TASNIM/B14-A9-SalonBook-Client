import { Suspense } from "react";
import type { Metadata } from "next";
import CustomerDashboard from "@/components/CustomerDashboard";

export const metadata: Metadata = {
  title: "Customer Dashboard | SalonBook",
  description: "Manage your SalonBook appointments and profile.",
};

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-[#FFFCF9] px-6 py-20 text-center text-[#984E59]">
          Loading dashboard...
        </main>
      }
    >
      <CustomerDashboard />
    </Suspense>
  );
}
