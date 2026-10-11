import { createHash, timingSafeEqual } from "node:crypto";
import { useSession } from "@tanstack/react-start/server";

// Admin auth is a single shared password from ADMIN_PASSWORD. When it is
// unset, admin routes are open (local dev). The session encryption key is
// derived from the password, so changing it logs every session out.

function adminPassword() {
  return process.env.ADMIN_PASSWORD || undefined;
}

type AdminSession = { isAdmin?: boolean };

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

function adminSession(password: string) {
  return useSession<AdminSession>({
    name: "__admin",
    password: sha256(`ti4-lab-admin:${password}`).toString("hex"),
    maxAge: 60 * 60 * 24 * 30,
    sessionHeader: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}

export function adminAuthEnabled() {
  return adminPassword() !== undefined;
}

/** Whether the current request carries an admin session. */
export async function isAdmin() {
  const password = adminPassword();
  if (!password) return true;
  const session = await adminSession(password);
  return session.data.isAdmin === true;
}

export function checkAdminPassword(input: string) {
  const password = adminPassword();
  if (!password) return true;
  return timingSafeEqual(sha256(input), sha256(password));
}

/** Starts an admin session (after the password checked out). */
export async function startAdminSession() {
  const password = adminPassword();
  if (!password) return;
  const session = await adminSession(password);
  // Rotate: drop whatever the browser had before granting admin.
  await session.clear();
  await session.update({ isAdmin: true });
}

export async function endAdminSession() {
  const password = adminPassword();
  if (!password) return;
  const session = await adminSession(password);
  await session.clear();
}
