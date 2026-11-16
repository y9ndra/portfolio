"use client";

import { useEffect } from "react";
import { isHomeReturnNavigation } from "@/lib/homeReturn";

// Keep already-viewed sections revealed when navigating within this document.
const revealedInDocument = new Set<string>();
const HOME_REVEALS_KEY = "portfolio-home-reveals";
let homeRevealsInitialized = false;

function initializeHomeReveals() {
  if (homeRevealsInitialized || window.location.pathname !== "/") return;
  homeRevealsInitialized = true;
  try {
    if (isHomeReturnNavigation()) {
      const saved: unknown = JSON.parse(sessionStorage.getItem(HOME_REVEALS_KEY) || "[]");
      if (Array.isArray(saved)) saved.filter((key): key is string => typeof key === "string" && key.startsWith("/:")).forEach(key => revealedInDocument.add(key));
    } else {
      sessionStorage.removeItem(HOME_REVEALS_KEY);
    }
  } catch { /* Reveal state is optional when storage is unavailable. */ }
}

export function hasSeenHomeSection(section: string) {
  initializeHomeReveals();
  return Array.from(revealedInDocument).some(key => key.startsWith(`/:${section}:`));
}

function revealKey(element: Element) {
  const section = element.closest("section");
  if (!section) return null;
  const name = section.id || section.getAttribute("aria-label");
  if (!name) return null;
  const index = Array.from(section.querySelectorAll("[data-reveal]")).indexOf(element);
  return index < 0 ? null : `${window.location.pathname}:${name}:${index}`;
}

export function useScrollReveal() {
  useEffect(() => {
    initializeHomeReveals();
    const reveal: IntersectionObserverCallback = (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            const key = revealKey(entry.target);
            if (key) {
              revealedInDocument.add(key);
              if (key.startsWith("/:")) {
                try { sessionStorage.setItem(HOME_REVEALS_KEY, JSON.stringify(Array.from(revealedInDocument).filter(item => item.startsWith("/:")))); } catch { /* Storage is optional. */ }
              }
            }
            observer.unobserve(entry.target);
          }
        });
      };
    const io = new IntersectionObserver(reveal, { threshold: 0.1, rootMargin: "0px 0px -40px 0px" });
    const quoteObserver = new IntersectionObserver(reveal, { threshold: 0.65, rootMargin: "0px 0px -40px 0px" });

    // Observe initial elements
    const observe = (el: Element) => {
      const key = revealKey(el);
      if (key && revealedInDocument.has(key)) {
        el.classList.add("visible", "reveal-restored");
      } else {
        (el.classList.contains("quote-break-free") ? quoteObserver : io).observe(el);
      }
    };
    const els = document.querySelectorAll("[data-reveal]");
    els.forEach(observe);

    // Observe dynamic elements (handles hot-reloads and client-side rendering)
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute("data-reveal")) {
              observe(node);
            }
            node.querySelectorAll("[data-reveal]").forEach((el) => {
              observe(el);
            });
          }
        });
      });
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      quoteObserver.disconnect();
      observer.disconnect();
    };
  }, []);
}
