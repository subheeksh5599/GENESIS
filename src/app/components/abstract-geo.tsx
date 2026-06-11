"use client";

import { motion } from "framer-motion";

export function AbstractGeo() {
  return (
    <motion.svg
      viewBox="0 0 600 600"
      className="w-full h-full max-w-[540px]"
      initial="hidden"
      animate="visible"
    >
      {/* Outer ring */}
      <motion.circle
        cx="300"
        cy="300"
        r="240"
        fill="none"
        stroke="#0a0a0a"
        strokeWidth="0.5"
        strokeDasharray="8 4"
        variants={{
          hidden: { pathLength: 0, opacity: 0 },
          visible: {
            pathLength: 1,
            opacity: 0.12,
            transition: { duration: 2.5, ease: "easeInOut" },
          },
        }}
      />

      {/* Orbit arcs */}
      {[0, 120, 240].map((rot, i) => (
        <motion.ellipse
          key={i}
          cx="300"
          cy="300"
          rx={180 + i * 20}
          ry={100 + i * 15}
          fill="none"
          stroke="#8b1a1a"
          strokeWidth="0.8"
          strokeDasharray="3 6"
          transform={`rotate(${rot} 300 300)`}
          variants={{
            hidden: { opacity: 0, pathLength: 0 },
            visible: {
              opacity: [0, 0.3, 0.14],
              pathLength: [0, 1],
              transition: {
                duration: 2,
                delay: 0.8 + i * 0.3,
                ease: "easeInOut",
              },
            },
          }}
        />
      ))}

      {/* Core nodes */}
      {[
        { x: 300, y: 300, r: 6 },
        { x: 200, y: 180, r: 3.5 },
        { x: 420, y: 200, r: 3 },
        { x: 180, y: 420, r: 3.5 },
        { x: 400, y: 400, r: 3 },
        { x: 300, y: 100, r: 2.5 },
        { x: 300, y: 500, r: 2.5 },
      ].map((n, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={n.x}
          cy={n.y}
          r={n.r}
          fill={i === 0 ? "#8b1a1a" : "#0a0a0a"}
          variants={{
            hidden: { scale: 0, opacity: 0 },
            visible: {
              scale: 1,
              opacity: i === 0 ? 1 : 0.2,
              transition: {
                duration: 0.7,
                delay: 1 + i * 0.12,
                ease: "backOut",
              },
            },
          }}
        />
      ))}

      {/* Connection lines */}
      {[
        [200, 180, 300, 300],
        [420, 200, 300, 300],
        [180, 420, 300, 300],
        [400, 400, 300, 300],
        [300, 100, 300, 300],
        [300, 500, 300, 300],
        [200, 180, 420, 200],
        [180, 420, 400, 400],
      ].map(([x1, y1, x2, y2], i) => (
        <motion.line
          key={`line-${i}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke="#0a0a0a"
          strokeWidth="0.3"
          variants={{
            hidden: { pathLength: 0, opacity: 0 },
            visible: {
              pathLength: 1,
              opacity: 0.07,
              transition: {
                duration: 1.2,
                delay: 1.4 + i * 0.08,
                ease: "easeInOut",
              },
            },
          }}
        />
      ))}

      {/* Floating dot on orbit */}
      <motion.circle
        r="3"
        fill="#8b1a1a"
        initial={{ offsetDistance: "0%" }}
        animate={{ offsetDistance: "100%" }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ offsetPath: "path('M 120 300 A 180 100 0 1 1 480 300 A 180 100 0 1 1 120 300')" }}
      />
    </motion.svg>
  );
}
