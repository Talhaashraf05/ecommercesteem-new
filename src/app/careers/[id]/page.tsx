import { notFound } from "next/navigation";
import { JsonLd } from "@/components/common/json-ld";
import { getJob, jobs } from "@/content";
import { pageMetadata } from "@/lib/seo";
import { breadcrumbLd, jobPostingLd } from "@/lib/structured-data";
import { JobView } from "@/views/job";

export const dynamicParams = false;
export const generateStaticParams = () => jobs.map((j) => ({ id: j.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) return {};
  const meta = pageMetadata({ title: job.title, description: job.overview[0], path: `/careers/${id}` });
  // Closed roles stay reachable (old links) but drop out of the index.
  return job.active ? meta : { ...meta, robots: { index: false, follow: true } };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();
  return (
    <>
      {job.active && <JsonLd data={jobPostingLd(job)} />}
      <JsonLd data={breadcrumbLd([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }, { name: job.title, path: `/careers/${id}` }])} />
      <JobView job={job} />
    </>
  );
}
