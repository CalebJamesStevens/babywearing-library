"use client";

import { useFormStatus } from "react-dom";
import type { ButtonHTMLAttributes } from "react";

export default function ActionButton({
  children,
  className,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { pending } = useFormStatus();

  return (
    <button
      {...props}
      disabled={pending || props.disabled}
      className={`${className ?? ""} ${
        pending ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      {pending ? "Saving..." : children}
    </button>
  );
}
