"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";

const NAV_ITEMS = [
  { label: "Overview", icon: "○", href: "/dashboard", active: true },
  { label: "Agents", icon: "⬡", href: "/dashboard/agents", active: false },
  { label: "Deploy", icon: "⊕", href: "/dashboard/deploy", active: false },
  { label: "Strategies", icon: "⊡", href: "/dashboard/strategies", active: false },
  { label: "Analytics", icon: "◈", href: "/dashboard/analytics", active: false },
  { label: "Docs", icon: "↗", href: "/dashboard/docs", active: false },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      className="fixed left-0 top-0 h-full bg-charcoal text-white flex flex-col z-50 border-r border-white/[0.04]"
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.0, 1.0] }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.05] shrink-0">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="font-bold font-mono text-[0.7rem] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors shrink-0"
        >
          GEN
        </button>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-display italic text-sm tracking-[0.04em] text-white/40 whitespace-nowrap"
          >
            Genesis
          </motion.span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-6 px-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-[0.62rem] tracking-[0.12em] transition-all group ${
              item.active
                ? "bg-white/[0.06] text-white"
                : "text-white/30 hover:text-white/70 hover:bg-white/[0.03]"
            }`}
          >
            <span className="text-[0.8rem] w-5 text-center">{item.icon}</span>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap">
                {item.label}
              </motion.span>
            )}
            {item.active && !collapsed && (
              <motion.div
                layoutId="active-nav"
                className="w-1 h-1 rounded-full bg-accent ml-auto"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-5 py-5 border-t border-white/[0.05]"
        >
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center text-[0.55rem] font-mono text-white">
              G
            </div>
            <div className="min-w-0">
              <div className="font-mono text-[0.58rem] text-white/70 truncate">
                Agent #8471
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#4ade80]" />
                <span className="font-mono text-[0.48rem] text-white/30 tracking-[0.1em] uppercase">
                  Connected
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </motion.aside>
  );
}
