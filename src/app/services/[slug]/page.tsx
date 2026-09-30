import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/json-ld";
import { getService, services } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, serviceLd } from "@/lib/structured-data";
import { ServiceView } from "@/views/service";

export const dynamicParams = false;
export const generateStaticParams = () => services.map((s) => ({ slug: s.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  return service ? pageMetadata({ title: service.name, description: service.summary, path: `/services/${slug}` }) : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();
  return (
    <>
      <JsonLd data={serviceLd(service)} />
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }, { name: service.name, path: `/services/${slug}` }])} />
      <ServiceView service={service} />
    </>
  );
}
