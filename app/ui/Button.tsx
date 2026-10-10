import { forwardRef, type ButtonHTMLAttributes, type ReactNode, type AnchorHTMLAttributes } from "react";
import { Link, type LinkProps } from "react-router";
import { IconCheck, IconCopy } from "@tabler/icons-react";
import { cx, useClipboard } from "./utils";
import { Spinner } from "./Feedback";
import classes from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "tertiary" | "danger" | "discord";
export type ButtonSize = "sm" | "md" | "lg";

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Icon before the label. */
  icon?: ReactNode;
  /** Icon after the label. */
  iconRight?: ReactNode;
  block?: boolean;
  loading?: boolean;
};

export function buttonClass({ variant = "secondary", size = "md", block }: Common & { className?: string }) {
  return cx(classes.btn, classes[variant], size !== "md" && classes[size], block && classes.block);
}

function Inner({ icon, iconRight, loading, children }: Common & { children?: ReactNode }) {
  return (
    <>
      {loading ? <Spinner size={16} /> : icon}
      {children !== undefined && children !== null && <span className={classes.label}>{children}</span>}
      {iconRight}
    </>
  );
}

/** Chamfered plate button. One primary per view. */
export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & Common>(function Button(
  { variant, size, icon, iconRight, block, loading, className, children, type = "button", disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(buttonClass({ variant, size, block }), className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      <Inner icon={icon} iconRight={iconRight} loading={loading}>
        {children}
      </Inner>
    </button>
  );
});

/** A router link that looks like a button. */
export function ButtonLink({ variant, size, icon, iconRight, block, className, children, ...rest }: LinkProps & Common) {
  return (
    <Link className={cx(buttonClass({ variant, size, block }), className)} {...rest}>
      <Inner icon={icon} iconRight={iconRight}>
        {children}
      </Inner>
    </Link>
  );
}

/** An external link that looks like a button. */
export function ButtonAnchor({ variant, size, icon, iconRight, block, className, children, ...rest }: AnchorHTMLAttributes<HTMLAnchorElement> & Common) {
  return (
    <a className={cx(buttonClass({ variant, size, block }), className)} {...rest}>
      <Inner icon={icon} iconRight={iconRight}>
        {children}
      </Inner>
    </a>
  );
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Accessible name; also shown as a native tooltip. */
  label: string;
  variant?: "ghost" | "outline" | "danger" | "solid";
  size?: "xs" | "sm" | "md" | "lg";
  pressed?: boolean;
  children: ReactNode;
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, variant = "ghost", size = "md", pressed, className, children, type = "button", title, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={title ?? label}
      aria-pressed={pressed}
      className={cx(classes.icon, classes[`icon-${variant}`], classes[`icon-${size}`], className)}
      {...rest}
    >
      {children}
    </button>
  );
});

/** Copies text and confirms with "Copied". */
export function CopyButton({ value, label = "Copy", size = "sm", variant = "secondary", disabled }: { value: string; label?: string; size?: ButtonSize; variant?: ButtonVariant; disabled?: boolean }) {
  const { copied, copy } = useClipboard();
  return (
    <Button size={size} variant={variant} icon={copied ? <IconCheck size={15} /> : <IconCopy size={15} />} onClick={() => copy(value)} disabled={disabled} className={copied ? classes.copied : undefined}>
      {copied ? "Copied" : label}
    </Button>
  );
}

/** Small control placed on anything you can pick right now. */
export function PickButton({ selected, children = "Select", tone = "ion", className, ...rest }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean; tone?: "ion" | "minor" | "danger" }) {
  return (
    <button type="button" aria-pressed={selected} className={cx(classes.pick, classes[`pick-${tone}`], className)} {...rest}>
      {selected ? (
        <>
          <IconCheck size={13} /> Selected
        </>
      ) : (
        children
      )}
    </button>
  );
}
