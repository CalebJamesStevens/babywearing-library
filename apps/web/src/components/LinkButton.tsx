"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type LinkButtonProps = {
  href: string;
  children: ReactNode;
  className?: string;
  external?: boolean;
  target?: string;
  rel?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
};

export default function LinkButton({
  href,
  children,
  className,
  external = false,
  target,
  rel,
  variant,
  size,
}: LinkButtonProps) {
  if (external) {
    return (
      <Button
        nativeButton={false}
        render={<a href={href} target={target} rel={rel} />}
        className={className}
        variant={variant}
        size={size}
      >
        {children}
      </Button>
    );
  }

  return (
    <Button
      nativeButton={false}
      render={<Link href={href} />}
      className={className}
      variant={variant}
      size={size}
    >
      {children}
    </Button>
  );
}
