import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WeddingSite } from "@/components/invitation";
import { demoWedding, findPublishedWedding } from "@/lib/wedding";

type WeddingPageProps = { params: Promise<{ slug: string }> };

function getPublishedWedding(slug: string) {
  return findPublishedWedding([demoWedding], slug);
}

export async function generateMetadata({ params }: WeddingPageProps): Promise<Metadata> {
  const { slug } = await params;
  const wedding = getPublishedWedding(slug);
  if (!wedding) return { title: "Invitation not found | LoveCraft", robots: { index: false, follow: false } };

  return {
    title: wedding.seo.title,
    description: wedding.seo.description,
    openGraph: {
      title: wedding.seo.title,
      description: wedding.seo.description,
      images: [{ url: wedding.seo.socialImage }],
      type: "website",
    },
  };
}

export default async function WeddingPage({ params }: WeddingPageProps) {
  const { slug } = await params;
  const wedding = getPublishedWedding(slug);
  if (!wedding) notFound();
  return <WeddingSite wedding={wedding} />;
}