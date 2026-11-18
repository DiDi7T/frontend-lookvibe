'use client';

import { useState } from 'react';

interface CopyCodeProps {
  label: string;
  code: string;
}

export function CopyCode({ label, code }: CopyCodeProps) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</span>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <code className="min-w-0 flex-1 select-all break-all rounded-xl border border-[#f59e0b]/30 bg-[#0f172a] px-4 py-3 font-mono text-sm text-[#f9c784]">
          {code}
        </code>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 rounded-xl border border-[#f59e0b]/40 px-4 py-3 text-sm font-semibold text-[#f9c784] transition hover:bg-[#f59e0b]/10"
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>
      </div>
    </div>
  );
}
