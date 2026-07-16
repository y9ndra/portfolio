"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BLOGS } from "@/data/portfolio";

interface MetaTags {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export default function OGTestingPage() {
  const [selectedId, setSelectedId] = useState(BLOGS[0]?.id || "");
  const [loading, setLoading] = useState(false);
  const [metaTags, setMetaTags] = useState<MetaTags>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedId) return;

    const fetchMeta = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/blog/${selectedId}`);
        if (!res.ok) {
          throw new Error(`Failed to fetch /blog/${selectedId} (Status: ${res.status})`);
        }
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");

        const getMeta = (query: string) => {
          const el = doc.querySelector(query);
          return el ? el.getAttribute("content") || undefined : undefined;
        };

        const extracted: MetaTags = {
          title: doc.title || undefined,
          description: getMeta('meta[name="description"]'),
          ogTitle: getMeta('meta[property="og:title"]'),
          ogDescription: getMeta('meta[property="og:description"]'),
          ogImage: getMeta('meta[property="og:image"]'),
          twitterCard: getMeta('meta[name="twitter:card"]'),
          twitterTitle: getMeta('meta[name="twitter:title"]'),
          twitterDescription: getMeta('meta[name="twitter:description"]'),
          twitterImage: getMeta('meta[name="twitter:image"]'),
        };

        setMetaTags(extracted);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "An error occurred while fetching page metadata.");
      } finally {
        setLoading(false);
      }
    };

    fetchMeta();
  }, [selectedId]);

  return (
    <main className="section" style={{ minHeight: "100vh", padding: "4rem 2rem", background: "var(--bg)" }}>
      <div className="wrap" style={{ maxWidth: "1000px" }}>
        
        {/* Navigation back */}
        <div style={{ marginBottom: "2rem" }}>
          <Link href="/#blog" style={{ color: "var(--t2)", textDecoration: "none", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            ← Back to Portfolio
          </Link>
        </div>

        {/* Head */}
        <div style={{ marginBottom: "3rem" }}>
          <h1 style={{ fontFamily: "var(--font-sans-alt)", fontSize: "2.2rem", fontWeight: 700, color: "var(--t1)", marginBottom: "0.5rem" }}>
            OpenGraph Preview Sandbox
          </h1>
          <p style={{ color: "var(--t2)", fontSize: "0.95rem" }}>
            Select a blog post below to scrape and preview its OpenGraph tags and card design in real time on localhost.
          </p>
        </div>

        {/* Dropdown Selector */}
        <div style={{ marginBottom: "2.5rem", display: "flex", gap: "1rem", alignItems: "center" }}>
          <label htmlFor="blog-select" style={{ fontFamily: "var(--font-mono)", fontSize: "0.85rem", color: "var(--t1)" }}>
            Select Blog Page:
          </label>
          <select
            id="blog-select"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            style={{
              padding: "0.5rem 1rem",
              background: "var(--bg-2)",
              color: "var(--t1)",
              border: "1px solid var(--border)",
              borderRadius: "6px",
              fontFamily: "var(--font-sans-alt)",
              fontSize: "0.9rem",
              cursor: "pointer",
            }}
          >
            {BLOGS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.title} ({b.id})
              </option>
            ))}
          </select>
        </div>

        {loading && (
          <div style={{ padding: "2rem", color: "var(--t2)", fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
            Scraping local page metadata...
          </div>
        )}

        {error && (
          <div style={{ padding: "1.5rem", background: "rgba(255, 100, 100, 0.05)", border: "1px solid rgba(255, 100, 100, 0.2)", borderRadius: "8px", color: "#ff6b6b", marginBottom: "2rem", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            <strong>Error:</strong> {error}
            <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: "var(--t3)" }}>
              Make sure your Next.js local development server is running on localhost!
            </div>
          </div>
        )}

        {!loading && !error && selectedId && (
          <div style={{ display: "flex", flexDirection: "column", gap: "3.5rem" }}>
            
            {/* Visual Previews Row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "2rem" }}>
              
              {/* WhatsApp Mockup */}
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "1.5rem", background: "var(--bg-2)" }}>
                <h3 style={{ fontFamily: "var(--font-sans-alt)", fontSize: "1.1rem", color: "var(--t1)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                  WhatsApp Share Card Preview
                </h3>
                
                {/* Simulated Chat Window */}
                <div style={{ background: "#0b141a", padding: "1.5rem", borderRadius: "8px", maxWidth: "450px" }}>
                  <div style={{ background: "#202c33", padding: "0.75rem", borderRadius: "8px", color: "#e9edef" }}>
                    {metaTags.ogImage && (
                      <div style={{ position: "relative", width: "100%", aspectRatio: "1.91/1", overflow: "hidden", borderRadius: "4px", marginBottom: "0.5rem", background: "#111b21" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={metaTags.ogImage}
                          alt="WhatsApp og:image"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </div>
                    )}
                    <div style={{ padding: "0 0.25rem" }}>
                      <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.2rem", color: "#e9edef" }}>
                        {metaTags.ogTitle || "No Title Tag Found"}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#8696a0", marginBottom: "0.3rem", lineHeight: "1.3" }}>
                        {metaTags.ogDescription || "No Description Tag Found"}
                      </div>
                      <div style={{ fontSize: "0.72rem", color: "#8696a0", textTransform: "lowercase", fontFamily: "var(--font-mono)" }}>
                        yugendhra.me
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#8696a0", textAlign: "right", marginTop: "0.25rem" }}>
                    15:42 ✓
                  </div>
                </div>
              </div>

              {/* Twitter Mockup */}
              <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "1.5rem", background: "var(--bg-2)" }}>
                <h3 style={{ fontFamily: "var(--font-sans-alt)", fontSize: "1.1rem", color: "var(--t1)", marginBottom: "1rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                  Twitter / X Preview Card (Summary Large Image)
                </h3>
                
                {/* Simulated Post Card */}
                <div style={{ background: "#000000", border: "1px solid #2f3336", borderRadius: "16px", overflow: "hidden", maxWidth: "500px" }}>
                  {metaTags.twitterImage && (
                    <div style={{ width: "100%", aspectRatio: "1.91/1", position: "relative", borderBottom: "1px solid #2f3336" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={metaTags.twitterImage}
                        alt="Twitter Preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                    </div>
                  )}
                  <div style={{ padding: "0.75rem 1rem", color: "#e7e9ea", fontFamily: "var(--font-sans-alt)" }}>
                    <div style={{ fontSize: "0.75rem", color: "#71767b", marginBottom: "0.25rem", textTransform: "lowercase" }}>
                      yugendhra.me
                    </div>
                    <div style={{ fontSize: "0.88rem", fontWeight: 600, marginBottom: "0.25rem" }}>
                      {metaTags.twitterTitle || metaTags.ogTitle || "No Title Found"}
                    </div>
                    <div style={{ fontSize: "0.82rem", color: "#71767b", lineHeight: "1.3" }}>
                      {metaTags.twitterDescription || metaTags.ogDescription || "No Description Found"}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Scraped Metadata Table */}
            <div style={{ border: "1px solid var(--border)", borderRadius: "10px", padding: "1.5rem", background: "var(--bg-2)" }}>
              <h3 style={{ fontFamily: "var(--font-sans-alt)", fontSize: "1.1rem", color: "var(--t1)", marginBottom: "1.2rem", borderBottom: "1px solid var(--border)", paddingBottom: "0.5rem" }}>
                Raw Extracted Metadata Tags
              </h3>
              
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "0.8rem" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border)", textAlign: "left" }}>
                      <th style={{ padding: "0.75rem", color: "var(--t1)" }}>Tag Property / Name</th>
                      <th style={{ padding: "0.75rem", color: "var(--t1)" }}>Scraped Content Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>og:title</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)" }}>{metaTags.ogTitle || "—"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>og:description</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)" }}>{metaTags.ogDescription || "—"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>og:image</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)", wordBreak: "break-all" }}>{metaTags.ogImage || "—"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>twitter:card</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)" }}>{metaTags.twitterCard || "—"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>twitter:title</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)" }}>{metaTags.twitterTitle || "—"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>twitter:image</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)", wordBreak: "break-all" }}>{metaTags.twitterImage || "—"}</td>
                    </tr>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>title (document)</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)" }}>{metaTags.title || "—"}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "0.75rem", color: "var(--accent)" }}>description</td>
                      <td style={{ padding: "0.75rem", color: "var(--t2)" }}>{metaTags.description || "—"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </div>
    </main>
  );
}
