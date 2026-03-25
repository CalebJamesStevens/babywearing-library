import type { ReactNode } from "react";

type Props = {
  label: string;
  children: ReactNode;
  className?: string;
};

export default function FormField({ label, children, className }: Props) {
  return (
    <label className={className ? `grid gap-1 ${className}` : "grid gap-1"}>
      <span className="text-sm font-medium text-slate-900">{label}</span>
      {children}
    </label>
  );
}
