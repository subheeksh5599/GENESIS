"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { useRouter } from "next/navigation";
import { AbstractGeo } from "./components/abstract-geo";
import { ScrollReveal } from "./components/scroll-reveal";
import { CountUp } from "./components/count-up";

/* ─────────────────────────────────────────────────
   Constants
   ───────────────────────────────────────────────── */
const WORD_DELAY = 0.1;

/* ─────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────── */
export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const router = useRouter();

  return (
    <>
      <div className="grain-overlay" />

      {/* Navigation */}
      <nav className="fixed top-0 inset-x-0 z-[200] mix-blend-difference text-white px-9 py-10 flex justify-between items-center font-mono text-[0.68rem] tracking-[0.22em] uppercase">
        <span className="font-bold tracking-[0.28em] text-[0.75rem]">
          GENESIS
        </span>
        <span
          onClick={() => router.push("/dashboard")}
          className="font-display italic normal-case tracking-[0.04em] text-[0.9rem] cursor-pointer hover:opacity-60 transition-opacity"
        >
          Enter
        </span>
      </nav>

      {/* ═══════════════ HERO ═══════════════ */}
      <section
        ref={heroRef}
        className="min-h-screen flex items-center px-9 relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center w-full max-w-[1400px] mx-auto pt-16">
          {/* Left: Typography */}
          <div>


            <h1 className="font-display font-semibold text-[clamp(3rem,7vw,7rem)] leading-[0.95] tracking-[-0.025em] mb-10">
              {[
                ["Code", false],
                ["that", false],
                ["writes", true],
                ["itself.", true],
              ].map(([word, italic], i) => (
                <span key={i} className="inline-block overflow-hidden align-top mr-[0.25em]">
                  <motion.span
                    className={`inline-block ${italic ? "italic text-accent" : ""}`}
                    initial={{ y: "120%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.9,
                      delay: 0.25 + i * WORD_DELAY,
                      ease: [0.32, 0.0, 0.0, 1.0],
                    }}
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              className="font-mono text-[0.62rem] tracking-[0.1em] uppercase text-ink-soft max-w-[360px] leading-[2.2]"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.8, ease: "easeOut" }}
            >
              An autonomous AI engine that generates, formally verifies, and
              deploys Solidity contracts on Mantle. No human review. No audit.
              No fear.
            </motion.p>
          </div>

          {/* Right: Abstract Geometry */}
          <motion.div
            className="flex justify-center lg:justify-end"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
          >
            <AbstractGeo />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-9 flex items-center gap-3 font-mono text-[0.52rem] tracking-[0.28em] uppercase text-muted"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
        >
          <motion.div
            className="w-1 h-1 bg-accent rounded-full"
            animate={{ y: [0, 8, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          Scroll
        </motion.div>


      </section>

      {/* Horizontal rule */}
      <motion.div
        className="mx-9 h-px bg-border origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* ═══════════════ HOW IT WORKS ═══════════════ */}
      <section className="px-9 py-32 lg:py-40">
        <div className="max-w-[1400px] mx-auto">
          {[
            {
              num: "01",
              label: "Intent",
              title: "Speak the strategy.",
              desc: "Describe your DeFi intent in natural language. The engine parses complexity, risk targets, and protocol constraints — translating human language into machine-executable strategy across Mantle's DeFi surface.",
              visual: (
                <div className="w-full max-w-[420px] mx-auto bg-white border border-border p-10">
                  <div className="space-y-4 font-mono text-[0.7rem] text-ink-soft leading-relaxed">
                    <span className="text-accent text-[0.55rem] tracking-[0.2em] uppercase block mb-6">
                      Natural Language Input
                    </span>
                    <div className="text-ink font-medium">
                      allocate <span className="text-accent">60%</span> to mETH staking
                    </div>
                    <div className="text-ink font-medium">
                      deploy <span className="text-accent">40%</span> to Agni mETH/USDC
                    </div>
                    <div className="text-ink font-medium">
                      rebalance <span className="text-accent">weekly</span>
                    </div>
                    <div className="text-ink">
                      slippage <span className="text-accent font-medium">0.3%</span> / stop-loss{" "}
                      <span className="text-accent font-medium">15%</span>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              num: "02",
              label: "Forge",
              title: "Compile the contract.",
              desc: "The engine writes production Solidity inline. Foundry tests execute in real-time. Halmos symbolic execution proves correctness — mathematical certainty, not human hope.",
              visual: (
                <div className="w-full max-w-[420px] mx-auto bg-charcoal p-10 relative">
                  <div className="font-mono text-[0.58rem] leading-[2] text-[#60a5fa]">
                    <div className="text-[#4a4a4a] mb-3">Strategy.sol</div>
                    <div>
                      <span className="text-[#60a5fa]">contract</span>{" "}
                      <span className="text-[#fbbf24]">MantleVault</span>{" "}
                      <span className="text-[#60a5fa]">is</span>{" "}
                      <span className="text-[#fbbf24]">ERC4626</span>
                    </div>
                    <div>
                      {"  "}
                      <span className="text-[#60a5fa]">using</span> SafeERC20{" "}
                      <span className="text-[#60a5fa]">for</span> IERC20;
                    </div>
                    <div>
                      {"  "}
                      <span className="text-[#60a5fa]">uint256</span>{" "}
                      <span className="text-[#60a5fa]">public</span> share ={" "}
                      <span className="text-[#fbbf24]">6000</span>;
                    </div>
                    <div>
                      {"  "}
                      <span className="text-[#60a5fa]">function</span>{" "}
                      <span className="text-[#fbbf24]">rebalance</span>(){" "}
                      <span className="text-[#60a5fa]">external</span> {"{"}
                    </div>
                    <div>
                      {"    "}
                      <span className="text-[#4a4a4a]">// compound + redistribute</span>
                    </div>
                    <div>
                      {"    "}mETH.claimRewards(
                      <span className="text-[#60a5fa]">address</span>(
                      <span className="text-[#60a5fa]">this</span>));
                    </div>
                    <div>
                      {"  "}
                      {"}"}
                    </div>
                  </div>
                  <div className="absolute -top-3 -right-3 bg-accent text-white font-mono text-[0.48rem] tracking-[0.18em] uppercase px-3 py-1.5">
                    Formally Verified
                  </div>
                </div>
              ),
            },
            {
              num: "03",
              label: "Deploy",
              title: "Launch on Mantle.",
              desc: "The verified contract deploys to Mantle Network. An ERC-8004 identity NFT is minted — an on-chain record of creation, verification, and strategy — immutable and trustless.",
              visual: (
                <div className="w-full max-w-[420px] mx-auto bg-charcoal p-10">
                  <div className="font-mono text-[0.6rem] leading-[2.4]">
                    <div className="text-[#4ade80]">✓ Solidity 0.8.26</div>
                    <div className="text-[#4ade80]">✓ Foundry: 47 tests passed</div>
                    <div className="text-[#4ade80]">✓ Halmos: SAT (no violations)</div>
                    <div className="text-[#4ade80]">✓ Gas: 241,800</div>
                    <div className="text-[#4ade80]">✓ Deploy: 0x7a3f...b29c</div>
                    <div className="text-[#4ade80]">✓ ERC-8004 Agent: #8471</div>
                    <div className="text-[#fbbf24] mt-5">▶ Strategy live on Mantle</div>
                  </div>
                </div>
              ),
            },
          ].map((step, i) => (
            <div
              key={i}
              className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-32 lg:mb-40 last:mb-0"
            >
              <ScrollReveal className={`${i % 2 === 0 ? "" : "lg:order-2"}`}>
                <span className="font-mono text-[0.54rem] tracking-[0.35em] uppercase text-accent mb-6 block">
                  {step.num} — {step.label}
                </span>
                <h2 className="font-display font-semibold text-[clamp(1.8rem,3.5vw,3.2rem)] leading-[1.12] tracking-[-0.015em] mb-6">
                  {step.title.split(" ").map((w, j) =>
                    j === 0 ? (
                      <em key={j} className="not-italic text-accent italic inline mr-[0.25em]">
                        {w}
                      </em>
                    ) : (
                      <span key={j} className="inline mr-[0.2em]">
                        {w}
                      </span>
                    )
                  )}
                </h2>
                <p className="font-mono text-[0.62rem] leading-[2.2] text-ink-soft tracking-[0.06em] max-w-[400px]">
                  {step.desc}
                </p>
              </ScrollReveal>
              <ScrollReveal
                delay={0.15}
                className={i % 2 === 0 ? "" : "lg:order-1"}
              >
                {step.visual}
              </ScrollReveal>
            </div>
          ))}
        </div>
      </section>

      <motion.div
        className="mx-9 h-px bg-border origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* ═══════════════ TRUST ═══════════════ */}
      <section className="bg-ink text-white py-32 lg:py-40 relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-accent/4 rounded-full blur-[120px] translate-x-1/4 -translate-y-1/4" />
        </div>

        <div className="px-9 max-w-[1400px] mx-auto relative z-10">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-20 lg:mb-28">
              <h2 className="font-display font-semibold text-[clamp(2.2rem,4vw,4rem)] leading-[1.08] tracking-[-0.015em]">
                Why it{" "}
                <em className="italic text-accent not-italic">doesn&apos;t</em>{" "}
                break.
              </h2>
              <p className="font-mono text-[0.56rem] tracking-[0.15em] uppercase text-white/25 leading-[2]">
                Three layers of mathematical certainty.
                <br />
                Zero layers of human trust.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-white/[0.07]">
            {[
              {
                icon: "⊢",
                label: "01 · Correctness",
                title: "Formal Verification",
                desc: "Halmos symbolic execution and Foundry fuzz testing. Mathematical proof that every execution path is safe. Not an audit — a theorem.",
              },
              {
                icon: "⬡",
                label: "02 · Identity",
                title: "ERC-8004 Protocol",
                desc: "Every agent receives a permanent on-chain identity. Reputation registry, validation proofs, and cryptographic origin — all recorded on Mantle.",
              },
              {
                icon: "◈",
                label: "03 · Settlement",
                title: "Mantle ZK Finality",
                desc: "ZK validity proofs secure every state transition. $4B+ in community-owned assets. Institutional-grade settlement for autonomous agent execution.",
              },
            ].map((item, i) => (
              <ScrollReveal key={i} delay={i * 0.12}>
                <div className="p-10 lg:p-12 border-r border-white/[0.06] border-b md:border-b-0 last:border-r-0 hover:bg-white/[0.02] transition-colors duration-500 group">
                  <div className="text-2xl mb-6 opacity-30 group-hover:opacity-70 transition-opacity duration-500">
                    {item.icon}
                  </div>
                  <div className="font-mono text-[0.5rem] tracking-[0.32em] uppercase text-white/20 mb-4">
                    {item.label}
                  </div>
                  <h3 className="font-display font-semibold text-xl mb-4 leading-tight">
                    {item.title}
                  </h3>
                  <p className="font-mono text-[0.58rem] leading-[2] text-white/35 tracking-[0.05em]">
                    {item.desc}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════ STATS ═══════════════ */}
      <section className="px-9 py-32 lg:py-40">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <ScrollReveal>
            <CountUp
              target={12847}
              className="font-display font-semibold text-[clamp(5rem,12vw,12rem)] leading-[0.88] tracking-[-0.03em]"
            />
            <p className="font-mono text-[0.54rem] tracking-[0.28em] uppercase text-ink-soft mt-4">
              Autonomous contracts deployed
            </p>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <div className="grid grid-cols-2 gap-10">
              {[
                { n: "$24.7M", l: "Total Value Locked" },
                { n: "99.97%", l: "Verification Pass Rate" },
                { n: "3.2s", l: "Average Generation" },
                { n: "6", l: "Protocol Integrations" },
              ].map((s, i) => (
                <div key={i} className="border-t border-border pt-7">
                  <div className="font-display font-semibold text-[2.5rem] leading-none mb-2">
                    {s.n}
                  </div>
                  <div className="font-mono text-[0.5rem] tracking-[0.22em] uppercase text-ink-soft">
                    {s.l}
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <motion.div
        className="mx-9 h-px bg-border origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* ═══════════════ BUSINESS ═══════════════ */}
      <section className="px-9 py-28 lg:py-36">
        <div className="max-w-[1400px] mx-auto">
          <ScrollReveal>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-end mb-16 lg:mb-20">
              <h2 className="font-display font-semibold text-[clamp(2rem,3.5vw,3.5rem)] leading-[1.08] tracking-[-0.015em]">
                Built to{" "}
                <em className="italic text-accent not-italic">last</em>.
              </h2>
              <p className="font-mono text-[0.56rem] tracking-[0.12em] uppercase text-ink-soft leading-[2]">
                Deployment fees align incentives.
                <br />
                Strategy royalties reward creators.
                <br />
                Roadmap — post-hackathon.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { k: "Deployment Fee", v: "0.1%", d: "On TVL. Charged only when strategies are profitable. Users pay nothing unless they earn." },
              { k: "Creator Royalty", v: "5%", d: "Earn when others clone your top-performing strategy. Marketplace flywheel drives quality." },
              { k: "$GENESIS Token", v: "100M", d: "Governance, fee discounts, staking yield, gas sponsorship. Token holders direct the protocol." },
            ].map((m, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="bg-white border border-border p-8 hover:border-ink/15 transition-colors">
                  <div className="font-mono text-[0.48rem] tracking-[0.15em] uppercase text-ink-soft mb-3">{m.k}</div>
                  <div className="font-display font-semibold text-3xl mb-4">{m.v}</div>
                  <p className="font-mono text-[0.54rem] text-ink-soft leading-relaxed">{m.d}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <motion.div
        className="mx-9 h-px bg-border origin-left"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.76, 0, 0.24, 1] }}
      />

      {/* ═══════════════ CTA ═══════════════ */}
      <section className="px-9 py-32 lg:py-40 flex flex-col items-center text-center">
        <ScrollReveal>
          <motion.div
            className="w-px h-20 bg-muted mb-16 origin-top"
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
          />
        </ScrollReveal>

        <ScrollReveal>
          <h2 className="font-display font-semibold text-[clamp(2rem,4.5vw,4.5rem)] leading-[1.15] tracking-[-0.015em] max-w-[750px] mb-12">
            Intent{" "}
            <em className="italic text-accent not-italic">in</em>.
            <br />
            Contract{" "}
            <em className="italic text-accent not-italic">out</em>.
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <motion.button
            className="font-display italic text-lg text-white bg-ink px-12 py-4 cursor-pointer tracking-[0.03em]"
            whileHover={{ scale: 1.04, backgroundColor: "#8b1a1a" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={() => router.push("/dashboard")}
          >
            Deploy an Agent
          </motion.button>
        </ScrollReveal>

        <ScrollReveal delay={0.35}>
          <p className="font-mono text-[0.54rem] tracking-[0.22em] uppercase text-muted mt-8">
            Mantle Network &nbsp;·&nbsp; ERC-8004 &nbsp;·&nbsp; Byreal Skills
            CLI
          </p>
        </ScrollReveal>
      </section>

      {/* Footer */}
      <footer className="px-9 py-7 flex justify-between items-center font-mono text-[0.54rem] tracking-[0.15em] uppercase text-muted border-t border-border">
        <span>Genesis &copy; Turing Test Hackathon 2026</span>
        <div className="flex gap-8">
          <span className="cursor-pointer hover:text-ink transition-colors">
            Docs
          </span>
          <span className="cursor-pointer hover:text-ink transition-colors">
            GitHub
          </span>
          <span className="cursor-pointer hover:text-ink transition-colors">
            Mantle
          </span>
        </div>
      </footer>
    </>
  );
}
