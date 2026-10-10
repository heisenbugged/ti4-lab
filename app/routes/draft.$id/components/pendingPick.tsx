import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button, Modal, Text } from "~/ui";
import { useDraft } from "~/draftStore";

/**
 * Select, then Lock in pick.
 * Pickable things put a pending pick here; the pick bar names it and its
 * Lock in pick button asks for confirmation before committing.
 */
export type PendingPick = {
  /** Unique per pickable thing, e.g. "slice-3", "faction-hacan", "seat-2". */
  key: string;
  /** What the pick bar shows, e.g. "Slice Quiver". */
  label: string;
  commit: () => void;
};

type PendingPickContextValue = {
  pending: PendingPick | undefined;
  /** Select (or unselect when it is already selected). */
  toggle: (pick: PendingPick) => void;
  clear: () => void;
  isPending: (key: string) => boolean;
  /** Open the confirmation for the pending pick. */
  requestLockIn: () => void;
};

const PendingPickContext = createContext<PendingPickContextValue | null>(null);

export function PendingPickProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingPick | undefined>();
  const [confirming, setConfirming] = useState(false);
  const selectionCount = useDraft((state) => state.draft.selections.length);

  // A new pick (by anyone) clears whatever was selected.
  useEffect(() => {
    setPending(undefined);
    setConfirming(false);
  }, [selectionCount]);

  const toggle = useCallback(
    (pick: PendingPick) =>
      setPending((prev) => (prev?.key === pick.key ? undefined : pick)),
    [],
  );
  const clear = useCallback(() => setPending(undefined), []);

  const lockIn = () => {
    if (!pending) return;
    pending.commit();
    setPending(undefined);
    setConfirming(false);
  };

  const value = useMemo<PendingPickContextValue>(
    () => ({
      pending,
      toggle,
      clear,
      isPending: (key) => pending?.key === key,
      requestLockIn: () => pending && setConfirming(true),
    }),
    [pending, toggle, clear],
  );

  return (
    <PendingPickContext.Provider value={value}>
      {children}
      <Modal
        opened={confirming && !!pending}
        onClose={() => setConfirming(false)}
        size="sm"
        title={pending ? `Lock in ${pending.label}?` : "Lock in pick?"}
        popupProps={{
          onKeyDown: (event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              lockIn();
            }
          },
        }}
        footer={
          <>
            <Button variant="tertiary" onClick={() => setConfirming(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={lockIn} autoFocus>
              Lock in pick
            </Button>
          </>
        }
      >
        <Text size="sm" tone="muted">
          This is your pick for this turn. Everyone sees it straight away.
        </Text>
      </Modal>
    </PendingPickContext.Provider>
  );
}

const noop: PendingPickContextValue = {
  pending: undefined,
  toggle: () => {},
  clear: () => {},
  isPending: () => false,
  requestLockIn: () => {},
};

/** Outside a provider (replay, other phases) nothing can be pending. */
export function usePendingPick() {
  return useContext(PendingPickContext) ?? noop;
}

export function useHasPendingPickProvider() {
  return useContext(PendingPickContext) !== null;
}
