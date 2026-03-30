import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "outline";

const variants: Record<BadgeVariant, string> = {
  default: "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900",
  success: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  warning: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  destructive: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  outline: "border border-zinc-300 dark:border-zinc-700",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ variant = "default", className = "", ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
