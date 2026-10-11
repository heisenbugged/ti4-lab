import { createHash, timingSafeEqual } from "node:crypto";
import { createCookieSessionStorage, redirect } from "react-router";

// Admin auth is a single shared password from ADMIN_PASSWORD. When it is
// unset, admin routes are open (local dev). The cookie signing secret is
// derived from the password, so changing it logs every session out.

function adminPassword() {
  return process.env.ADMIN_PASSWORD || undefined;
}

type AdminSession = { isAdmin: boolean };

let storage: ReturnType<typeof createCookieSessionStorage<AdminSession>> | undefined;
let storagePassword: string | undefined;

function sessionStorage(password: string) {
  if (!storage || storagePassword !== password) {
    storagePassword = password;
    storage = createCookieSessionStorage<AdminSession>({
      cookie: {
        name: "__admin",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        secrets: [sha256(`ti4-lab-admin:${password}`).toString("hex")],
      },
    });
  }
  return storage;
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest();
}

export function adminAuthEnabled() {
  return adminPassword() !== undefined;
}

export async function isAdmin(request: Request) {
  const password = adminPassword();
  if (!password) return true;
  const session = await sessionStorage(password).getSession(
    request.headers.get("Cookie"),
  );
  return session.get("isAdmin") === true;
}

/** Call first in every admin loader and action. */
export async function requireAdmin(request: Request) {
  if (await isAdmin(request)) return;
  const url = new URL(request.url);
  throw redirect(
    `/admin/login?redirectTo=${encodeURIComponent(url.pathname + url.search)}`,
  );
}

export function safeAdminRedirect(value: FormDataEntryValue | string | null) {
  const target = value?.toString() ?? "";
  return target.startsWith("/admin") && !target.startsWith("//")
    ? target
    : "/admin/drafts";
}

export function checkAdminPassword(input: string) {
  const password = adminPassword();
  if (!password) return true;
  return timingSafeEqual(sha256(input), sha256(password));
}

export async function loginAdmin(request: Request, redirectTo: string) {
  const password = adminPassword();
  if (!password) return redirect(redirectTo);
  const store = sessionStorage(password);
  const session = await store.getSession(request.headers.get("Cookie"));
  session.set("isAdmin", true);
  return redirect(redirectTo, {
    headers: { "Set-Cookie": await store.commitSession(session) },
  });
}

export async function logoutAdmin(request: Request) {
  const password = adminPassword();
  if (!password) return redirect("/");
  const store = sessionStorage(password);
  const session = await store.getSession(request.headers.get("Cookie"));
  return redirect("/", {
    headers: { "Set-Cookie": await store.destroySession(session) },
  });
}
