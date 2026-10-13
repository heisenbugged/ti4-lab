import type { Draft } from "~/types";

// Signing in leaves the page, and the builder only lives in memory. Park the
// draft in this tab's session storage and pick it up when Discord sends us back.

const KEY = "ti4lab:builderResume";

export function stashBuilderDraft(draft: Draft) {
  sessionStorage.setItem(KEY, JSON.stringify(draft));
}

/** Returns the parked draft once, then forgets it. */
export function takeStashedBuilderDraft(): Draft | undefined {
  if (typeof sessionStorage === "undefined") return undefined;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return undefined;
  sessionStorage.removeItem(KEY);
  try {
    return JSON.parse(raw) as Draft;
  } catch {
    return undefined;
  }
}
