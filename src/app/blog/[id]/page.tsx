import type { Metadata } from "next";
import { BLOGS } from "@/data/portfolio";
import { notFound } from "next/navigation";
import BlogReader from "./BlogReader";
import BlogLanding from "./BlogLanding";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://yugendhra.me";

export async function generateStaticParams() {
  return BLOGS.map((b) => ({ id: b.id }));
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const blog = BLOGS.find((b) => b.id === id);

  if (!blog) return {};

  const imageUrl = blog.image
    ? `${BASE_URL}${blog.image}`
    : `${BASE_URL}/assets/images/profile+v6.png`;

  return {
    title: `${blog.title} — Yugendhra E`,
    description: blog.description,
    openGraph: {
      title: blog.title,
      description: blog.description,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: blog.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description: blog.description,
      images: [imageUrl],
    },
  };
}

export default async function BlogDetailPage({ params }: PageProps) {
  const { id } = await params;
  const blogIndex = BLOGS.findIndex((b) => b.id === id);

  if (blogIndex === -1) {
    notFound();
  }

  const blog = BLOGS[blogIndex];

  // If the blog has parts, render the Series Landing Page
  if ("parts" in blog && blog.parts) {
    return <BlogLanding blog={blog} />;
  }

  // Otherwise, render the Reading View (chapters)
  const prevBlog = blogIndex > 0 ? BLOGS[blogIndex - 1] : null;
  const nextBlog = blogIndex < BLOGS.length - 1 ? BLOGS[blogIndex + 1] : null;

  // We only pass prev/next routing metadata if they exist
  return (
    <BlogReader 
      blog={blog} 
      prevBlog={prevBlog ? { id: prevBlog.id, title: prevBlog.title } : null}
      nextBlog={nextBlog ? { id: nextBlog.id, title: nextBlog.title } : null}
    />
  );
}
