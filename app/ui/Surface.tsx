import { ComponentPropsWithoutRef, forwardRef } from "react";
import { PlayerColor } from "./types";
import classes from "./Surface.module.css";

export interface SurfaceProps extends ComponentPropsWithoutRef<"div"> {
  variant?: "card" | "interactive" | "badge" | "flat" | "bordered";
  color?: PlayerColor;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = "card", color, className, children, ...props }, ref) => {
    const variantClass = {
      card: classes.withBorder,
      interactive: `${classes.withBorder} ${classes.hoverable}`,
      badge: `${classes.withBorder} ${classes.onlyBg}`,
      flat: "",
      bordered: classes.bordered,
    }[variant];

    const colorClass = color ? classes[color] : "";

    // Only apply .surface background for non-bordered variants
    const surfaceClass = variant !== "bordered" ? classes.surface : "";

    return (
      <div
        ref={ref}
        className={`${surfaceClass} ${variantClass} ${colorClass} ${className || ""}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = "Surface";
