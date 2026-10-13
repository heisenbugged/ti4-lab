import { createHash } from "node:crypto";
import { useSession as openSession } from "@tanstack/react-start/server";

// Discord sign-in. The session is an encrypted httpOnly cookie holding the
// Discord user id; the OAuth state and return path ride along during login.

export type UserSession = {
  userId?: string;
  oauthState?: string;
  returnTo?: string;
};

function sessionPassword() {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;
  if (process.env.NODE_ENV === "production") return undefined;
  // Local dev only: stable so restarts don't sign you out.
  return createHash("sha256").update("ti4-lab-local-session").digest("hex");
}

/** Sign-in is off (everyone is signed out) until SESSION_SECRET is set in production. */
export function sessionsEnabled() {
  return sessionPassword() !== undefined;
}

export function userSession() {
  const password = sessionPassword();
  if (!password) throw new Error("Missing environment variable: SESSION_SECRET");
  return openSession<UserSession>({
    name: "__ti4lab",
    password,
    maxAge: 60 * 60 * 24 * 90,
    sessionHeader: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    },
  });
}

/** The signed-in Discord user id, if any. */
export async function sessionUserId() {
  if (!sessionsEnabled()) return undefined;
  const session = await userSession();
  return session.data.userId;
}
