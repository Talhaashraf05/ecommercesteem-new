import { notFound } from "next/navigation";
import { caseStudies, getCaseStudy } from "@/content";
import { CaseStudyView } from "@/views/case-study";

export const dynamicParams = false;
export const generateStaticParams = () => caseStudies.map((c) => ({ slug: c.slug }));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  return study ? { title: study.client, description: `${study.headlineMetric.value} ${study.headlineMetric.label}` } : {};
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  return <CaseStudyView study={study} />;
}
