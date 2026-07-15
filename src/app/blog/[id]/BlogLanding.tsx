"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogPart {
  id: string;
  title: string;
  description: string;
  chapterPreviews: string[];
}

interface Blog {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  image: string;
  readTime: string;
  parts?: BlogPart[];
}

interface BlogLandingProps {
  blog: Blog;
}

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 3L5 8l5 5" />
  </svg>
);

export default function BlogLanding({ blog }: BlogLandingProps) {
  return (
    <main className="blog-detail-main">
      {/* Back button */}
      <div className="wrap">
        <div className="proj-detail-back-wrap a0">
          <Link href="/#blog" className="proj-detail-back">
            <ArrowLeft /> Back to Blogs
          </Link>
        </div>
      </div>

      {/* Banner image */}
      {blog.image && (
        <div className="wrap a1">
          <div className="proj-detail-banner">
            <Image
              src={blog.image}
              alt={blog.title}
              fill
              style={{ objectFit: "contain" }}
              priority
            />
            <div className="proj-detail-banner-overlay" />
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="wrap">
        <div className="proj-detail-header a2" style={{ marginBottom: "3rem", marginTop: "2rem" }}>
          <div className="proj-detail-title-row">
            <h1 className="proj-detail-title">{blog.title}</h1>
          </div>
          <div className="blog-meta" style={{ marginTop: "0.25rem", marginBottom: "0.75rem" }}>
            <span className="blog-meta-item">{blog.date}</span>
            <span className="blog-meta-item">{blog.readTime}</span>
          </div>
          <p className="proj-detail-desc" style={{ maxWidth: "800px" }}>{blog.description}</p>
        </div>

        {/* Parts Section */}
        <div className="blog-landing-section">
          <h2 className="blog-landing-section-title">Table of Contents</h2>
          
          <div className="blog-landing-grid">
            {blog.parts?.map((part, idx) => (
              <Link 
                key={part.id} 
                href={`/blog/${part.id}`} 
                className="blog-landing-card corner-box"
              >
                <div className="blog-landing-card-header">
                  <span className="blog-landing-part-tag">Part {idx + 1}</span>
                  <h3 className="blog-landing-card-title">{part.title}</h3>
                </div>
                
                <p className="blog-landing-card-desc">{part.description}</p>
                
                <span className="blog-landing-read-more">Read Part {idx + 1} →</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
