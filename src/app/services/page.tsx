import type { Metadata } from "next";
import ServicesClient from "@/components/ServicesClient";

export const metadata: Metadata = {
  title: "Our Services | SalonBook",
  description:
    "Explore premium hair, facial, nail, makeup and spa services at SalonBook.",
};

export default function ServicesPage() {
  return <ServicesClient />;
}
