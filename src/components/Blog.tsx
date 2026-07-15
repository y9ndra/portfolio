"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { BLOGS } from "@/data/portfolio";

type BlogCardProps = (typeof import("@/data/portfolio").BLOGS)[number] & { delay: string };

function BlogCard({ id, title, description, tags, image, date, readTime, delay }: BlogCardProps) {
  const [imgErr, setImgErr] = useState(false);
  const showImg = !!image && !imgErr;

  return (
    <Link
      href={`/blog/${id}`}
      className="blog-card-link"
      aria-label={`Read ${title}`}
    >
      <article
        id={`blog-${id}`}
        className="blog-item corner-box"
        data-reveal
        data-delay={delay}
      >
        {/* Left: image */}
        <div className="blog-img-col">
          {showImg ? (
            <div className="blog-img-wrap">
              <Image
                src={image}
                alt={title}
                fill
                style={{ objectFit: "contain" }}
                onError={() => setImgErr(true)}
              />
            </div>
          ) : (
            <div className="blog-img-wrap blog-img-empty">
              <span className="blog-img-placeholder">No Preview</span>
            </div>
          )}
        </div>

        {/* Right: content */}
        <div className="blog-body">
          <div className="blog-row">
            <h3 className="blog-name">{title}</h3>
            <div className="blog-meta">
              <span className="blog-meta-item">{date}</span>
              <span className="blog-meta-item">{readTime}</span>
            </div>
          </div>
          <p className="blog-desc">{description}</p>
          <div className="blog-tags-section">
            <div className="blog-tags">
              {tags.map((t) => <span key={t} className="blog-tag">{t}</span>)}
            </div>
          </div>
          <span className="blog-read-more">Read post →</span>
        </div>
      </article>
    </Link>
  );
}

export default function Blog() {
  return (
    <section id="blog" className="section" aria-label="Blog">
      <div className="wrap">

        <div className="section-head" data-reveal>
          <span className="section-title">Blog</span>
          <div className="section-rule" />
        </div>

        <div className="blog-list">
          {BLOGS.filter(b => b.id === "node-js-the-accidental-backend").map((b, i) => (
            <BlogCard key={b.id} {...b} delay={String((i % 3) + 1)} />
          ))}
        </div>

      </div>
    </section>
  );
}
