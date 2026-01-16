import { notFound } from "next/navigation";

// This is a dynamic route that will handle /eras/[eraId]
// Individual era pages are implemented separately

export default function EraPage({ params }: { params: { eraId: string } }) {
  // This route is handled by individual era pages in their own directories
  // e.g., /eras/pompeii/page.tsx handles /eras/pompeii

  // If era doesn't exist, show 404
  const validEras = ["pompeii", "medieval", "renaissance", "victorian"];

  if (!validEras.includes(params.eraId)) {
    notFound();
  }

  // This page shouldn't be reached directly
  // Era-specific pages handle their own content
  return notFound();
}
