"use client";

import { useEffect } from "react";

export function useScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );

    // Observe initial elements
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach((el) => io.observe(el));

    // Observe dynamic elements (handles hot-reloads and client-side rendering)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute("data-reveal")) {
              io.observe(node);
            }
            node.querySelectorAll("[data-reveal]").forEach((el) => {
              io.observe(el);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      observer.disconnect();
    };
  }, []);
}
