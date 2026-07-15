"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";

interface Chapter {
  title: string;
  subtitle?: string;
  content: string;
}

interface Blog {
  id: string;
  title: string;
  date: string;
  description: string;
  tags: string[];
  image: string;
  readTime: string;
  chapters?: Chapter[];
}

interface BlogReaderProps {
  blog: Blog;
  prevBlog: { id: string; title: string } | null;
  nextBlog: { id: string; title: string } | null;
}

const ArrowLeft = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M10 3L5 8l5 5" />
  </svg>
);

export default function BlogReader({ blog, prevBlog, nextBlog }: BlogReaderProps) {
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const chapterRefs = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    chapterRefs.current = chapterRefs.current.slice(0, blog.chapters?.length || 0);
  }, [blog]);

  useEffect(() => {
    const handleScroll = () => {
      // Calculate reading progress
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      } else {
        setScrollProgress(0);
      }

      // Determine active chapter based on scroll position
      const scrollPosition = window.scrollY + window.innerHeight * 0.35;
      let currentActive = 0;

      for (let i = 0; i < chapterRefs.current.length; i++) {
        const ref = chapterRefs.current[i];
        if (ref) {
          const top = ref.offsetTop;
          if (scrollPosition >= top) {
            currentActive = i;
          }
        }
      }
      setActiveChapter(currentActive);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [blog]);

  const scrollToChapter = (index: number) => {
    const ref = chapterRefs.current[index];
    if (ref) {
      ref.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <main className="blog-detail-main">
      {/* Scroll Progress Bar */}
      <div 
        className="blog-progress-bar" 
        style={{ width: `${scrollProgress}%` }} 
      />

      {/* Back button */}
      <div className="wrap">
        <div className="proj-detail-back-wrap a0">
          <Link href={`/blog/${blog.id.replace(/-part-\d+$/, "")}`} className="proj-detail-back">
            <ArrowLeft /> Back to Blog Overview
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

      {/* Header & Main grid layout */}
      <div className="wrap">
        <div className="blog-detail-grid">
          
          {/* Sticky Sidebar Table of Contents */}
          <aside className="blog-sidebar">
            <h3 className="blog-toc-title">Chapters</h3>
            <ul className="blog-toc-list">
              {blog.chapters?.map((ch, idx) => (
                <li 
                  key={idx} 
                  className={`blog-toc-item ${activeChapter === idx ? "active" : ""}`}
                >
                  <button onClick={() => scrollToChapter(idx)}>
                    {ch.title.split(":")[0] || `Chapter ${idx + 1}`}
                  </button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main content pane */}
          <article className="blog-content-container">
            {/* Blog Header Metadata */}
            <div className="proj-detail-header a2" style={{ marginBottom: "2rem" }}>
              <div className="proj-detail-title-row">
                <h1 className="proj-detail-title">{blog.title}</h1>
              </div>
              <div className="blog-meta" style={{ marginTop: "0.25rem", marginBottom: "0.75rem" }}>
                <span className="blog-meta-item">{blog.date}</span>
                <span className="blog-meta-item">{blog.readTime}</span>
              </div>
              <p className="proj-detail-desc">{blog.description}</p>
            </div>

            {/* Render chapters */}
            <div className="blog-content-body">
              {blog.chapters?.map((ch, idx) => (
                <section
                  key={idx}
                  ref={(el) => {
                    chapterRefs.current[idx] = el;
                  }}
                  className="blog-chapter-section"
                  id={`chapter-${idx + 1}`}
                >
                  <div className="blog-chapter-header">
                    <span className="blog-chapter-num">Chapter {idx + 1}</span>
                    <h2 className="blog-chapter-title">
                      {ch.title.includes(":") ? ch.title.split(":").slice(1).join(":").trim() : ch.title}
                    </h2>
                    {ch.subtitle && (
                      <p className="blog-chapter-subtitle">{ch.subtitle}</p>
                    )}
                  </div>
                  <div className="blog-chapter-content">
                    <p>{ch.content}</p>
                  </div>
                </section>
              ))}
            </div>

            {/* Pagination Navigation */}
            <div className="blog-pagination">
              {prevBlog ? (
                <Link href={`/blog/${prevBlog.id}`} className="blog-pagination-btn">
                  <span className="blog-pagination-label">
                    {prevBlog.id === blog.id.replace(/-part-\d+$/, "") ? "← Blog Overview" : "← Previous Part"}
                  </span>
                  <span className="blog-pagination-title">{prevBlog.title}</span>
                </Link>
              ) : (
                <div style={{ flex: 1 }} />
              )}
              {nextBlog ? (
                <Link href={`/blog/${nextBlog.id}`} className="blog-pagination-btn" style={{ textAlign: "right", alignItems: "flex-end" }}>
                  <span className="blog-pagination-label">Next Part →</span>
                  <span className="blog-pagination-title">{nextBlog.title}</span>
                </Link>
              ) : (
                <div style={{ flex: 1 }} />
              )}
            </div>

          </article>
        </div>
      </div>
    </main>
  );
}
