import { notFound } from "next/navigation";
import ServiceDetailsClient from "@/components/ServiceDetailsClient";
import { services } from "@/data/services";

type Props = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return services.map((service) => ({
    id: service.id,
  }));
}

export default async function ServiceDetailsPage({ params }: Props) {
  const { id } = await params;

  const service = services.find((item) => item.id === id);

  if (!service) {
    notFound();
  }

  return <ServiceDetailsClient service={service} />;
}
