import { notFound } from "next/navigation";
import { getJob, jobs } from "@/content";
import { JobView } from "@/views/job";

export const dynamicParams = false;
export const generateStaticParams = () => jobs.map((j) => ({ id: j.id }));

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(id);
  return job ? { title: job.title, description: job.overview[0] } : {};
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = getJob(id);
  if (!job) notFound();
  return <JobView job={job} />;
}
