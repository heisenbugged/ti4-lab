import { createMiddleware, createServerFn } from "@tanstack/react-start";
import {
  adminAuthEnabled,
  checkAdminPassword,
  endAdminSession,
  isAdmin,
  startAdminSession,
} from "~/utils/adminAuth.server";
import { expectRecord } from "./validate";

/**
 * Guards every admin server function. Route `beforeLoad` only redirects the
 * UI; this is what actually keeps the data private.
 */
export const requireAdmin = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    if (!(await isAdmin())) throw new Error("Unauthorized");
    return next();
  },
);

export const getAdminStatus = createServerFn().handler(async () => ({
  authEnabled: adminAuthEnabled(),
  isAdmin: await isAdmin(),
}));

export const loginAdmin = createServerFn({ method: "POST" })
  .validator((input: { password: string }) => {
    expectRecord(input);
    return { password: String(input.password ?? "") };
  })
  .handler(async ({ data: { password } }) => {
    if (!checkAdminPassword(password)) {
      // Slow down guessing.
      await new Promise((resolve) => setTimeout(resolve, 500));
      return { ok: false as const, error: "That password isn't right. Try again." };
    }
    await startAdminSession();
    return { ok: true as const };
  });

export const logoutAdmin = createServerFn({ method: "POST" }).handler(
  async () => {
    await endAdminSession();
  },
);
