import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface2 px-4 text-sm text-white placeholder:text-muted/70 outline-none transition-colors focus:border-primary-light/70 focus:ring-1 focus:ring-primary-light/40",
        className
      )}
      {...props}
    />
  )
);
Input.displayName = "Input";
