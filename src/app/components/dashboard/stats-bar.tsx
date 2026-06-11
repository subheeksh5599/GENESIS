"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "12,847", label: "Contracts Deployed", change: "+12%", up: true },
  { value: "$24.7M", label: "Total Value Locked", change: "+8.4%", up: true },
  { value: "99.97%", label: "Verification Rate", change: "±0.01%", up: true },
  { value: "1,203", label: "Active Agents", change: "+24%", up: true },
];

export function StatsBar() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {STATS.map((s, i) => (
        <motion.div
          key={i}
          className="bg-white border border-border p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 * i, duration: 0.5, ease: "easeOut" }}
        >
          <div className="font-display font-semibold text-[1.8rem] leading-none mb-2">
            {s.value}
          </div>
          <div className="font-mono text-[0.52rem] tracking-[0.18em] uppercase text-ink-soft mb-1">
            {s.label}
          </div>
          <span
            className={`font-mono text-[0.52rem] tracking-[0.08em] ${
              s.up ? "text-[#4ade80]" : "text-[#f87171]"
            }`}
          >
            {s.change}
          </span>
        </motion.div>
      ))}
    </div>
  );
}
