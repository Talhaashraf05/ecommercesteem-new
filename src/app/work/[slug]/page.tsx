import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/json-ld";
import { caseStudies, getCaseStudy } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd } from "@/lib/structured-data";
import { CaseStudyView } from "@/views/case-study";

export const dynamicParams = false;
export const generateStaticParams = () => caseStudies.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const cs = getCaseStudy(slug);
  return cs
    ? pageMetadata({ title: cs.client, description: `${cs.client}: ${cs.headlineMetric.value} ${cs.headlineMetric.label}`, path: `/work/${slug}` })
    : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  return (
    <>
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }, { name: study.client, path: `/work/${slug}` }])} />
      <CaseStudyView study={study} />
    </>
  );
}
