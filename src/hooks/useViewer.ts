import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getViewer, signOut } from "~/server/hub.functions";

export const viewerQueryKey = ["viewer"] as const;

/** The signed-in Discord user (null when signed out, undefined while loading). */
export function useViewer() {
  const { data } = useQuery({
    queryKey: viewerQueryKey,
    queryFn: () => getViewer(),
    staleTime: 5 * 60_000,
  });
  return data;
}

export function useSignOut() {
  const queryClient = useQueryClient();
  return async () => {
    await signOut();
    queryClient.setQueryData(viewerQueryKey, null);
  };
}

/** Starts Discord sign-in, coming back to `returnTo` (default: this page). */
export function signInHref(returnTo?: string) {
  const back =
    returnTo ??
    (typeof window === "undefined"
      ? "/hub"
      : window.location.pathname + window.location.search);
  return `/auth/discord?returnTo=${encodeURIComponent(back)}`;
}
