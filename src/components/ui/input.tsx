import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const handleWheel = (e: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number") {
        e.currentTarget.blur();
      }
    };

    return (
      <input
        type={type}
        className={cn(
          "flex h-8 w-full rounded-sm border bg-background px-2.5 py-1.5 text-sm transition-colors duration-150",
          "border-input/60 hover:border-input/80",
          "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground/60 placeholder:text-xs",
          "focus-visible:outline-none focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-muted/30",
          "shadow-sm",
          type === "number" && "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none",
          className
        )}
        onWheel={handleWheel}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };