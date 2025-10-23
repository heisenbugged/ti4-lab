import { ComponentPropsWithoutRef, forwardRef } from "react";
import { PlayerColor } from "./types";
import classes from "./Surface.module.css";

export interface SurfaceProps extends ComponentPropsWithoutRef<"div"> {
  variant?: "card" | "interactive" | "badge" | "flat";
  color?: PlayerColor;
}

export const Surface = forwardRef<HTMLDivElement, SurfaceProps>(
  ({ variant = "card", color, className, children, ...props }, ref) => {
    const variantClass = {
      card: classes.withBorder,
      interactive: `${classes.withBorder} ${classes.hoverable}`,
      badge: `${classes.withBorder} ${classes.onlyBg}`,
      flat: "",
    }[variant];

    const colorClass = color ? classes[color] : "";

    return (
      <div
        ref={ref}
        className={`${classes.surface} ${variantClass} ${colorClass} ${className || ""}`.trim()}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Surface.displayName = "Surface";
