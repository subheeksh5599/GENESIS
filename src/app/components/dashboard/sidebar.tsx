"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

const NAV_ITEMS: { label: string; icon: string; href: string; upcoming?: boolean }[] = [
  { label: "Overview", icon: "○", href: "/dashboard" },
  { label: "Protocols", icon: "⬡", href: "/dashboard/agents" },
  { label: "Synthesize", icon: "⊕", href: "/dashboard/deploy" },
  { label: "Strategies", icon: "⊡", href: "/dashboard/strategies" },
  { label: "Analytics", icon: "◈", href: "/dashboard/analytics" },
  { label: "Wallet", icon: "◇", href: "/dashboard/wallet" },
  { label: "History", icon: "↗", href: "/dashboard/history" },
  { label: "Business", icon: "◆", href: "/dashboard/tokenomics", upcoming: true },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const sidebarContent = (
    <>
      <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.05] shrink-0">
        <Link href="/dashboard" className="font-bold font-mono text-[0.7rem] tracking-[0.25em] uppercase text-white/70 hover:text-white transition-colors shrink-0">GEN</Link>
        {!collapsed && (
          <span className="font-display italic text-sm tracking-[0.04em] text-white/50 whitespace-nowrap">Genesis</span>
        )}
      </div>
      <nav className="flex-1 py-6 px-2 flex flex-col gap-1">
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
              <Link
                key={item.label}
                href={item.upcoming ? "#" : item.href}
                onClick={(e) => {
                  if (item.upcoming) e.preventDefault();
                  setMobileOpen(false);
                }}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-[0.62rem] tracking-[0.12em] transition-all group ${
                active ? "bg-white/[0.08] text-white" : item.upcoming ? "text-white/25 cursor-default" : "text-white/55 hover:text-white hover:bg-white/[0.05]"
              }`}
            >
              <span className="text-[0.8rem] w-5 text-center">{item.icon}</span>
              {!collapsed && (
                <span className="whitespace-nowrap">
                  {item.label}
                  {item.upcoming && (
                    <span className="text-[0.45rem] text-white/25 ml-1">(soon)</span>
                  )}
                </span>
              )}
              {active && !collapsed && (
                <motion.div layoutId="active-nav" className="w-1 h-1 rounded-full bg-accent ml-auto" transition={{ type: "spring", stiffness: 400, damping: 30 }} />
              )}
            </Link>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="px-5 py-5 border-t border-white/[0.05]">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-accent/80 flex items-center justify-center text-[0.55rem] font-mono text-white">G</div>
            <div className="min-w-0">
              <div className="font-mono text-[0.58rem] text-white/80 truncate">Genesis Engine</div>
              <div className="font-mono text-[0.48rem] text-white/40 tracking-[0.1em] uppercase mt-0.5">Mantle L2</div>
            </div>
          </div>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-[250] lg:hidden font-mono text-[0.7rem] bg-charcoal text-white px-3 py-2 tracking-[0.2em]"
      >
        {mobileOpen ? "×" : "≡"}
      </button>
      {/* Mobile overlay */}
      {mobileOpen && <div className="fixed inset-0 bg-ink/40 z-[240] lg:hidden" onClick={() => setMobileOpen(false)} />}
      {/* Mobile sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-full bg-charcoal text-white flex flex-col z-[245] border-r border-white/[0.04] lg:hidden"
        animate={{ x: mobileOpen ? 0 : -260 }}
        transition={{ duration: 0.25 }}
        style={{ width: 260 }}
      >
        {sidebarContent}
      </motion.aside>
      {/* Desktop sidebar */}
      <motion.aside
        className="fixed left-0 top-0 h-full bg-charcoal text-white flex flex-col z-50 border-r border-white/[0.04] hidden lg:flex"
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.0, 1.0] }}
      >
        <div className="flex items-center gap-3 px-5 h-[72px] border-b border-white/[0.05] shrink-0">
          <button onClick={() => setCollapsed(!collapsed)} className="font-bold font-mono text-[0.7rem] tracking-[0.25em] uppercase text-white/70 hover:text-white transition-colors shrink-0">GEN</button>
          {!collapsed && <span className="font-display italic text-sm tracking-[0.04em] text-white/50 whitespace-nowrap">Genesis</span>}
        </div>
        <nav className="flex-1 py-6 px-2 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link key={item.label} href={item.upcoming ? "#" : item.href} onClick={item.upcoming ? (e) => e.preventDefault() : undefined} className={`flex items-center gap-3 px-4 py-2.5 rounded-sm font-mono text-[0.62rem] tracking-[0.12em] transition-all group ${active ? "bg-white/[0.08] text-white" : item.upcoming ? "text-white/25 cursor-default" : "text-white/55 hover:text-white hover:bg-white/[0.05]"}`}>
                <span className="text-[0.8rem] w-5 text-center">{item.icon}</span>
                {!collapsed && (
                <span className="whitespace-nowrap">
                  {item.label}
                  {item.upcoming && (
                    <span className="text-[0.45rem] text-white/25 ml-1">(soon)</span>
                  )}
                </span>
              )}
                {active && !collapsed && <motion.div layoutId="active-nav" className="w-1 h-1 rounded-full bg-accent ml-auto" transition={{ type: "spring", stiffness: 400, damping: 30 }} />}
              </Link>
            );
          })}
        </nav>
        {!collapsed && (
          <div className="px-5 py-5 border-t border-white/[0.05]">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-accent/80 flex items-center justify-center text-[0.55rem] font-mono text-white">G</div>
              <div className="min-w-0"><div className="font-mono text-[0.58rem] text-white/80 truncate">Genesis Engine</div><div className="font-mono text-[0.48rem] text-white/40 tracking-[0.1em] uppercase mt-0.5">Mantle L2</div></div>
            </div>
          </div>
        )}
      </motion.aside>
    </>
  );
}
