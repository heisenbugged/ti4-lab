import type { HTMLAttributes, ReactNode } from "react";
import { Toast } from "@base-ui/react/toast";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import { IconAlertTriangle, IconCircleCheck, IconInfoCircle, IconX } from "@tabler/icons-react";
import { cx } from "./utils";
import { toastManager, notify } from "./notify";
import classes from "./Feedback.module.css";

/* ── Spinner, loading overlay, progress ─────────────────────────── */

export function Spinner({ size = 20, className }: { size?: number; className?: string }) {
  return <span className={cx(classes.spinner, className)} style={{ width: size, height: size }} role="status" aria-label="Loading" />;
}

/** Covers its positioned parent while something loads. */
export function LoadingOverlay({ visible = true, label }: { visible?: boolean; label?: string }) {
  if (!visible) return null;
  return (
    <div className={classes.overlay}>
      <Spinner size={28} />
      {label && <span className={classes.overlayLabel}>{label}</span>}
    </div>
  );
}

export function Progress({ value, label, tone = "ion", size = "sm" }: { value: number; label?: string; tone?: "ion" | "gold" | "success"; size?: "xs" | "sm" | "md" }) {
  return (
    <BaseProgress.Root value={value} className={cx(classes.progress, classes[`progress-${size}`])} aria-label={label}>
      <BaseProgress.Track className={classes.track}>
        <BaseProgress.Indicator className={cx(classes.indicator, classes[`indicator-${tone}`])} />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

/* ── Tags ───────────────────────────────────────────────────────── */

export type TagTone = "neutral" | "ion" | "gold" | "success" | "danger" | "warning" | "solid" | "discord";

/** Small label for metadata. Never a button. */
export function Tag({ tone = "neutral", icon, children, className, ...rest }: HTMLAttributes<HTMLSpanElement> & { tone?: TagTone; icon?: ReactNode }) {
  return (
    <span className={cx(classes.tag, classes[`tag-${tone}`], className)} {...rest}>
      {icon}
      {children}
    </span>
  );
}

/** Count bubble used in tabs and headings. */
export function Count({ children }: { children: ReactNode }) {
  return <span className={classes.count}>{children}</span>;
}

/* ── Notice (inline alert) ──────────────────────────────────────── */

export type NoticeTone = "info" | "success" | "warning" | "danger" | "discord";
const noticeIcon = { info: IconInfoCircle, success: IconCircleCheck, warning: IconAlertTriangle, danger: IconAlertTriangle, discord: IconInfoCircle };

export function Notice({
  tone = "info",
  title,
  icon,
  children,
  onClose,
  className,
}: {
  tone?: NoticeTone;
  title?: ReactNode;
  icon?: ReactNode;
  children?: ReactNode;
  onClose?: () => void;
  className?: string;
}) {
  const Icon = noticeIcon[tone];
  return (
    <div className={cx(classes.notice, classes[`notice-${tone}`], className)} role={tone === "danger" ? "alert" : "status"}>
      <span className={classes.noticeIcon}>{icon ?? <Icon size={18} />}</span>
      <div className={classes.noticeBody}>
        {title && <strong className={classes.noticeTitle}>{title}</strong>}
        {children && <div className={classes.noticeText}>{children}</div>}
      </div>
      {onClose && (
        <button type="button" className={classes.noticeClose} onClick={onClose} aria-label="Dismiss">
          <IconX size={16} />
        </button>
      )}
    </div>
  );
}

/* ── Toasts ─────────────────────────────────────────────────────── */

export { toastManager, notify };

const toastIcon = { info: IconInfoCircle, success: IconCircleCheck, warning: IconAlertTriangle, danger: IconAlertTriangle };

function ToastList() {
  const { toasts } = Toast.useToastManager();
  return toasts.map((t) => {
    const tone = (t.type as keyof typeof toastIcon) ?? "info";
    const Icon = toastIcon[tone] ?? IconInfoCircle;
    return (
      <Toast.Root key={t.id} toast={t} className={cx(classes.toast, classes[`toast-${tone}`])}>
        <Toast.Content className={classes.toastContent}>
          <span className={classes.toastIcon}>
            <Icon size={20} />
          </span>
          <div className={classes.toastMain}>
            {t.title && <Toast.Title className={classes.toastTitle} />}
            {t.description && <Toast.Description className={classes.toastMsg} />}
          </div>
          <Toast.Close className={classes.noticeClose} aria-label="Dismiss">
            <IconX size={16} />
          </Toast.Close>
        </Toast.Content>
      </Toast.Root>
    );
  });
}

/** Mount once near the root. */
export function Toaster({ children }: { children: ReactNode }) {
  return (
    <Toast.Provider toastManager={toastManager} limit={4}>
      {children}
      <Toast.Portal>
        <Toast.Viewport className={classes.viewport}>
          <ToastList />
        </Toast.Viewport>
      </Toast.Portal>
    </Toast.Provider>
  );
}
