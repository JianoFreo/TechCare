import type { ButtonHTMLAttributes, ReactNode } from "react";
import { FlaskConical } from "lucide-react";

export function AnalysisButton({ variant = "primary", compact = false, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "link"; compact?: boolean }) {
  const color = variant === "secondary" ? "border-[#e1eaf6] bg-white text-[#188bff] hover:border-[#abd5ff] hover:bg-[#f1f8ff]" : variant === "link" ? "border-transparent bg-transparent text-[#168cff] hover:text-[#006cd9] hover:underline" : "border-[#188bff] bg-[#188bff] text-white hover:border-[#0879eb] hover:bg-[#0879eb]";
  return <button type="button" {...props} className={`inline-flex cursor-pointer items-center justify-center gap-1.5 rounded border font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none ${compact ? "px-2.5 py-1.5 text-[10px]" : "px-4 py-2 text-[11px]"} ${color} ${className}`} />;
}

export function AnalysisNotice({ children, error = false }: { children: ReactNode; error?: boolean }) {
  return <div role={error ? "alert" : "status"} className={`mb-3 rounded border px-3 py-2.5 text-[11px] leading-relaxed ${error ? "border-rose-200 bg-rose-50 text-rose-700" : "border-[#d7eafa] bg-[#f1f8ff] text-[#45749b]"}`}>{children}</div>;
}

export function FlaskBadge({ small = false }: { small?: boolean }) {
  return <span className={`inline-flex shrink-0 items-center justify-center rounded-full bg-[#e1f5ff] text-[#1aa8ff] ${small ? "size-11" : "size-[51px]"}`}><FlaskConical size={25} strokeWidth={1.25} /></span>;
}
