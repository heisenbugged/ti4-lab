import { useState, useEffect } from "react";

/**
 * Hook to get and set the user's player identity for a raw draft.
 * Reads from and writes to localStorage.
 */
export function useRawDraftPlayerId(draftId: string | undefined) {
  const [playerId, setPlayerIdState] = useState<number | undefined>(() => {
    if (!draftId || typeof window === "undefined") return undefined;
    const stored = localStorage.getItem(`raw-draft:player:${draftId}`);
    return stored ? parseInt(stored, 10) : undefined;
  });

  useEffect(() => {
    if (!draftId) {
      setPlayerIdState(undefined);
      return;
    }
    const stored = localStorage.getItem(`raw-draft:player:${draftId}`);
    const parsed = stored ? parseInt(stored, 10) : undefined;
    setPlayerIdState(parsed);
  }, [draftId]);

  const setPlayerId = (id: number) => {
    if (draftId) {
      localStorage.setItem(`raw-draft:player:${draftId}`, id.toString());
      setPlayerIdState(id);
    }
  };

  return [playerId, setPlayerId] as const;
}
