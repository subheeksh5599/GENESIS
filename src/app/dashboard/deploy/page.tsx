"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DeployModal } from "@/app/components/dashboard/deploy-modal";

export default function DeployPage() {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  const handleClose = () => {
    setOpen(false);
    router.push("/dashboard");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-semibold text-2xl tracking-[-0.015em]">Synthesize</h1>
        <p className="font-mono text-[0.5rem] tracking-[0.2em] uppercase text-ink-soft mt-0.5">
          Protocol synthesis engine
        </p>
      </div>

      <div className="bg-white border border-dashed border-muted p-20 text-center">
        <div className="text-5xl mb-4 text-muted">⊕</div>
        <h3 className="font-display font-semibold text-xl mb-2">Ready to synthesize</h3>
        <p className="font-mono text-[0.58rem] text-ink-soft mb-6">
          Describe your protocol intent and the synthesis engine will generate, verify, compile, and execute it on Mantle.
        </p>
        <button
          onClick={() => setOpen(true)}
          className="font-display italic text-white bg-ink px-8 py-2.5 text-sm tracking-[0.03em] hover:bg-accent transition-colors"
        >
            Open Synthesis Wizard
        </button>
      </div>

      <DeployModal open={open} onClose={handleClose} onDeployed={() => router.push("/dashboard/agents")} />
    </div>
  );
}
