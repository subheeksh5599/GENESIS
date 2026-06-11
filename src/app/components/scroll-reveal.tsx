"use client";

import { motion } from "framer-motion";
import { type ReactNode, useRef } from "react";

export function ScrollReveal({
  children,
  className = "",
  delay = 0,
  direction = "up",
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right" | "none";
}) {
  const ref = useRef(null);

  const dirMap = {
    up: { y: 48 },
    left: { x: -48 },
    right: { x: 48 },
    none: {},
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, ...dirMap[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 0.9,
        delay,
        ease: [0.25, 0.1, 0.0, 1.0],
      }}
    >
      {children}
    </motion.div>
  );
}
