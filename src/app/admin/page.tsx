import type { Metadata } from "next";
import AdminDashboard from "@/components/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard | SalonBook",
  description: "Manage salon services, users, and appointments.",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
