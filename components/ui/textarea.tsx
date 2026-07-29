import * as React from "react";
import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "w-full rounded-xl border border-border bg-surface2 px-4 py-3 text-sm text-white placeholder:text-muted/70 outline-none transition-colors focus:border-primary-light/70 focus:ring-1 focus:ring-primary-light/40",
        className
      )}
      {...props}
    />
  )
);
Textarea.displayName = "Textarea";
