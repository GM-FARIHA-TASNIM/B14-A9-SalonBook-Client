import type { Metadata } from "next";
import CustomerDashboard from "@/components/CustomerDashboard";

export const metadata: Metadata = {
  title: "Customer Dashboard | SalonBook",
  description: "Manage your SalonBook appointments and profile.",
};

export default function DashboardPage() {
  return <CustomerDashboard />;
}
