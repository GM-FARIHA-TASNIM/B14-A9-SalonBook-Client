import ServiceDetailsClient from "@/components/ServiceDetailsClient";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ServiceDetailsPage({ params }: Props) {
  const { id } = await params;

  return <ServiceDetailsClient serviceId={id} />;
}
