import type { HTMLAttributes, ReactElement, ReactNode } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { IconX } from "@tabler/icons-react";
import { cx } from "./utils";
import classes from "./Overlay.module.css";

/* ── Modal ──────────────────────────────────────────────────────── */

type ModalProps = {
  opened: boolean;
  onClose: () => void;
  title?: ReactNode;
  /** One line under the title. */
  description?: ReactNode;
  /** Buttons, right aligned. Tertiary dismiss first, the committing action last. */
  footer?: ReactNode;
  /** sm 420 · md 520 · lg 720 · xl 980 · full */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Scrim click and Escape close it (default true). */
  dismissible?: boolean;
  withCloseButton?: boolean;
  children?: ReactNode;
  /** Extra props for the dialog element (e.g. onKeyDown). */
  popupProps?: HTMLAttributes<HTMLDivElement>;
  className?: string;
  /** Body without padding, for content that runs edge to edge. */
  flush?: boolean;
};

/** One decision or one focused form, over a dark scrim. */
export function Modal({ opened, onClose, title, description, footer, size = "md", dismissible = true, withCloseButton = true, children, popupProps, className, flush }: ModalProps) {
  return (
    <Dialog.Root
      open={opened}
      onOpenChange={(open, details) => {
        if (open) return;
        if (!dismissible && (details?.reason === "outside-press" || details?.reason === "escape-key")) return;
        onClose();
      }}
    >
      <Dialog.Portal>
        <Dialog.Backdrop className={classes.backdrop} />
        <Dialog.Viewport className={classes.viewport}>
          <Dialog.Popup className={cx(classes.modal, classes[`modal-${size}`], className)} {...popupProps}>
            {(title || withCloseButton) && (
              <div className={classes.head}>
                <div className={classes.headText}>
                  {title && <Dialog.Title className={classes.title}>{title}</Dialog.Title>}
                  {description && <Dialog.Description className={classes.description}>{description}</Dialog.Description>}
                </div>
                {withCloseButton && (
                  <Dialog.Close className={classes.close} aria-label="Close">
                    <IconX size={18} />
                  </Dialog.Close>
                )}
              </div>
            )}
            <div className={cx(classes.body, flush && classes.flush)}>{children}</div>
            {footer && <div className={classes.foot}>{footer}</div>}
          </Dialog.Popup>
        </Dialog.Viewport>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Side sheet, used for the mobile navigation. */
export function Drawer({ opened, onClose, title, side = "right", children }: { opened: boolean; onClose: () => void; title?: ReactNode; side?: "left" | "right"; children: ReactNode }) {
  return (
    <Dialog.Root open={opened} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Backdrop className={classes.backdrop} />
        <Dialog.Popup className={cx(classes.drawer, classes[`drawer-${side}`])}>
          <div className={classes.head}>
            <div className={classes.headText}>{title && <Dialog.Title className={classes.title}>{title}</Dialog.Title>}</div>
            <Dialog.Close className={classes.close} aria-label="Close">
              <IconX size={18} />
            </Dialog.Close>
          </div>
          <div className={classes.drawerBody}>{children}</div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* ── Popover ────────────────────────────────────────────────────── */

type Side = "top" | "bottom" | "left" | "right";

type PopoverProps = {
  /** The element that opens the popover. Must accept a ref (a DOM element or one of our controls). */
  trigger: ReactElement<Record<string, unknown>>;
  children: ReactNode;
  side?: Side;
  align?: "start" | "center" | "end";
  width?: number;
  /** Infotips: open on hover as well as press. */
  openOnHover?: boolean;
  opened?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: ReactNode;
  className?: string;
  padding?: boolean;
};

export function Popover({ trigger, children, side = "bottom", align = "center", width, openOnHover, opened, onOpenChange, title, className, padding = true }: PopoverProps) {
  return (
    <BasePopover.Root open={opened} onOpenChange={onOpenChange ? (o) => onOpenChange(o) : undefined}>
      <BasePopover.Trigger render={trigger} openOnHover={openOnHover} delay={120} closeDelay={80} nativeButton={typeof trigger.type === "string" ? trigger.type === "button" : true} />
      <BasePopover.Portal>
        <BasePopover.Positioner side={side} align={align} sideOffset={8} className={classes.positioner}>
          <BasePopover.Popup className={cx(classes.pop, padding && classes.popPad, className)} style={{ width }}>
            {title && <BasePopover.Title className={classes.popTitle}>{title}</BasePopover.Title>}
            {children}
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/* ── Tooltip ────────────────────────────────────────────────────── */

/** Supplementary label on hover or focus. Never the only place for important information. */
export function Tooltip({ label, children, side = "top", disabled }: { label: ReactNode; children: ReactElement<Record<string, unknown>>; side?: Side; disabled?: boolean }) {
  if (disabled || !label) return children;
  return (
    <BaseTooltip.Root>
      <BaseTooltip.Trigger render={children} delay={250} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner side={side} sideOffset={6} className={classes.positioner}>
          <BaseTooltip.Popup className={classes.tooltip}>{label}</BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export function TooltipProvider({ children }: { children: ReactNode }) {
  return <BaseTooltip.Provider>{children}</BaseTooltip.Provider>;
}

/* ── Menu ───────────────────────────────────────────────────────── */

export function Menu({ trigger, children, side = "bottom", align = "end", width = 290 }: { trigger: ReactElement<Record<string, unknown>>; children: ReactNode; side?: Side; align?: "start" | "center" | "end"; width?: number }) {
  return (
    <BaseMenu.Root>
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner side={side} align={align} sideOffset={6} className={classes.positioner}>
          <BaseMenu.Popup className={classes.menu} style={{ width }}>
            {children}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export function MenuItem({
  icon,
  description,
  children,
  onClick,
  danger,
  disabled,
  checked,
}: {
  icon?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
  danger?: boolean;
  disabled?: boolean;
  /** For toggle items: shows the state with a check. */
  checked?: boolean;
}) {
  return (
    <BaseMenu.Item className={cx(classes.menuItem, danger && classes.menuDanger)} onClick={onClick} disabled={disabled}>
      <span className={classes.menuIcon}>{icon}</span>
      <span className={classes.menuText}>
        <span>{children}</span>
        {description && <small>{description}</small>}
      </span>
      {checked !== undefined && <span className={cx(classes.menuState, checked && classes.menuOn)}>{checked ? "On" : "Off"}</span>}
    </BaseMenu.Item>
  );
}

export function MenuSeparator() {
  return <BaseMenu.Separator className={classes.menuSep} />;
}
