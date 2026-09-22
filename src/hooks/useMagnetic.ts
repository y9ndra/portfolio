"use client";

import { useRef } from "react";

export interface MagneticOptions {
  strength?: number;
  innerStrength?: number;
  maxDisplacement?: number;
}

/**
 * useMagnetic hook currently inactive per user request to evaluate button animations clearly.
 */
export function useMagnetic<T extends HTMLElement = HTMLElement>(_options: MagneticOptions = {}) {
  const ref = useRef<T>(null);
  return ref;
}
