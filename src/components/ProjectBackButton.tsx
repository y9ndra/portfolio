"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ArrowLeft = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    <path d="M10 3L5 8l5 5" />
  </svg>
);

interface ProjectBackButtonProps {
  className?: string;
  label?: string;
}

export function ProjectBackButton({
  className = "proj-detail-back",
  label = "Back to Projects",
}: ProjectBackButtonProps) {
  const router = useRouter();
  const [backUrl, setBackUrl] = useState<string>("/projects");
  const [canGoBack, setCanGoBack] = useState<boolean>(false);

  useEffect(() => {
    try {
      // If user arrived from an external site, fallback cleanly to /projects
      if (document.referrer) {
        try {
          const refHost = new URL(document.referrer).host;
          if (refHost !== window.location.host) {
            setBackUrl("/projects");
            setCanGoBack(false);
            return;
          }
        } catch {
          // ignore parsing error
        }
      }

      // Check where user came from within the portfolio
      const savedUrl = sessionStorage.getItem("projects_back_url");
      if (savedUrl) {
        setBackUrl(savedUrl);
        setCanGoBack(true);
      } else if (document.referrer) {
        try {
          const refPath = new URL(document.referrer).pathname;
          if (refPath === "/projects") {
            setBackUrl("/projects");
            setCanGoBack(true);
          } else if (refPath === "/" || refPath === "") {
            setBackUrl("/#projects");
            setCanGoBack(true);
          } else {
            setBackUrl("/projects");
            setCanGoBack(false);
          }
        } catch {
          setBackUrl("/projects");
          setCanGoBack(false);
        }
      } else {
        // Direct link or fresh tab: default to /projects
        setBackUrl("/projects");
        setCanGoBack(false);
      }
    } catch {
      setBackUrl("/projects");
      setCanGoBack(false);
    }
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Allow browser default for modifier clicks (e.g. Cmd/Ctrl + click to open in new tab)
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) {
      return;
    }

    e.preventDefault();

    if (canGoBack && typeof window !== "undefined" && window.history.length > 1) {
      let navigated = false;
      const onPopState = () => {
        navigated = true;
      };
      window.addEventListener("popstate", onPopState, { once: true });

      router.back();

      // Failsafe in case history traversal does not proceed
      setTimeout(() => {
        window.removeEventListener("popstate", onPopState);
        if (!navigated) {
          router.push(backUrl);
        }
      }, 350);
    } else {
      router.push(backUrl);
    }
  };

  return (
    <Link href={backUrl} onClick={handleClick} className={className}>
      <ArrowLeft /> <span className="btn-label">{label}</span>
    </Link>
  );
}
