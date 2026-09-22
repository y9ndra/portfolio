"use client";

import React from "react";

interface MagneticProps {
  children: React.ReactNode;
  strength?: number;
  innerStrength?: number;
  maxDisplacement?: number;
  className?: string;
  as?: React.ElementType;
}

/**
 * Magnetic component currently inactive per user request to evaluate button animations clearly.
 */
export function Magnetic({ children }: MagneticProps) {
  return <>{children}</>;
}

export default Magnetic;
