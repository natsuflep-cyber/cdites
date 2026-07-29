"use client";

import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "@/lib/utils";

export function Slider({ className, ...props }: React.ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root
      className={cn("relative flex w-full touch-none select-none items-center", className)}
      {...props}
    >
      <SliderPrimitive.Track className="relative h-1.5 w-full grow overflow-hidden rounded-full bg-surface2">
        <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-primary to-primary-light" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block h-4 w-4 rounded-full bg-white shadow-neon-sm ring-2 ring-primary-light transition-transform hover:scale-110 focus:outline-none" />
    </SliderPrimitive.Root>
  );
}
