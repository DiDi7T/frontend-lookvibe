import type { ReactNode } from 'react';

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  children: ReactNode;
}

export const inputClassName =
  'w-full rounded-xl border border-white/10 bg-[#0f172a] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-[#f59e0b]/70 focus:ring-2 focus:ring-[#f59e0b]/20';

export function FormField({ label, htmlFor, hint, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-sm font-semibold text-slate-200">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-500">{hint}</p>}
    </div>
  );
}
