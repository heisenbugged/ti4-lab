import type { ReactNode } from "react";
import { Toast } from "@base-ui/react/toast";

/** Global toast manager. Kept free of CSS imports so server-side modules (draftStore) can import it. */
export const toastManager = Toast.createToastManager();

type NotifyInput = { title?: ReactNode; message?: ReactNode; tone?: "info" | "success" | "warning" | "danger"; timeout?: number };

/** Show a toast from anywhere (no hook needed). Errors stay until dismissed. */
export function notify({ title, message, tone = "info", timeout }: NotifyInput) {
  return toastManager.add({
    title,
    description: message,
    type: tone,
    timeout: timeout ?? (tone === "danger" ? 0 : 5000),
    priority: tone === "danger" ? "high" : "low",
  });
}
