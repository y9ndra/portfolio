"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

interface BlogPart {
  id: string;
  title: string;
  description: string;
  readTime: string;
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

const EyeIcon = () => (
  <svg 
    width="13" 
    height="13" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    style={{ display: "inline-block", verticalAlign: "-0.15em", marginRight: "4px" }}
    aria-hidden
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

function ShareButton({ title, description }: { title: string; description: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description, url });
      } catch {
        // user dismissed
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <button className="blog-share-btn" onClick={handleShare} aria-label="Share this post">
      {copied ? (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </>
      )}
    </button>
  );
}

function PartCard({ part, idx }: { part: BlogPart; idx: number }) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Fetch views count for this specific blog part
    fetch(`/api/views?id=${encodeURIComponent(part.id)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.views === "number") {
          setViews(data.views);
        }
      })
      .catch((err) => console.error("Error fetching part card views:", err));
  }, [part.id]);

  return (
    <Link 
      href={`/blog/${part.id}`} 
      className="blog-landing-card corner-box"
    >
      <span className="blog-landing-part-tag">0{idx + 1}</span>
      
      <div className="blog-landing-card-content">
        <div className="blog-landing-card-header">
          <h3 className="blog-landing-card-title">{part.title}</h3>
          <div className="blog-landing-card-meta">
            <span>{part.readTime}</span>
            <span style={{ margin: "0 0.4rem", opacity: 0.5 }}>•</span>
            <span style={{ whiteSpace: "nowrap" }}>
              <EyeIcon />
              {views !== null ? views.toLocaleString() : "—"}
            </span>
          </div>
        </div>
        
        <p className="blog-landing-card-desc">{part.description}</p>
        
        <span className="blog-landing-read-more">Read →</span>
      </div>
    </Link>
  );
}

export default function BlogLanding({ blog }: BlogLandingProps) {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    // Record view of the overall series landing page
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: blog.id }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.views === "number") {
          setViews(data.views);
        }
      })
      .catch((err) => console.error("Error recording overall view:", err));
  }, [blog.id]);

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
        <div className="proj-detail-header a2" style={{ marginBottom: "2.5rem", marginTop: "2rem" }}>
          <div className="proj-detail-title-row">
            <h1 className="proj-detail-title">{blog.title}</h1>
          </div>

          <div className="blog-detail-meta" style={{ marginTop: "0.5rem", marginBottom: "1rem" }}>
            <div className="blog-detail-meta-left">
              <span className="blog-meta-item">{blog.date}</span>
              <span className="blog-meta-item">
                {views !== null ? `${views.toLocaleString()} views` : "— views"}
              </span>
            </div>
            <ShareButton title={blog.title} description={blog.description} />
          </div>

          <p className="proj-detail-desc" style={{ maxWidth: "800px" }}>{blog.description}</p>
        </div>

        {/* Parts Section */}
        <div className="blog-landing-section">
          <h2 className="blog-landing-section-title">Table of Contents</h2>
          
          <div className="blog-landing-grid">
            {blog.parts?.map((part, idx) => (
              <PartCard key={part.id} part={part} idx={idx} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
