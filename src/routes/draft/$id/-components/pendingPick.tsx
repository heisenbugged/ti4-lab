import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Button, Modal, Text } from "~/ui";
import { useDraft } from "~/draftStore";

/**
 * One click to pick: Select on anything opens a confirmation, and Lock in pick commits it.
 * Cancel drops the selection.
 */
export type PendingPick = {
  /** Unique per pickable thing, e.g. "slice-3", "faction-hacan", "seat-2". */
  key: string;
  /** What the confirmation names, e.g. "Slice Quiver". */
  label: string;
  commit: () => void;
};

type PendingPickContextValue = {
  pending: PendingPick | undefined;
  /** Select something: opens the confirmation straight away. */
  select: (pick: PendingPick) => void;
  isPending: (key: string) => boolean;
};

const PendingPickContext = createContext<PendingPickContextValue | null>(null);

export function PendingPickProvider({ children }: { children: ReactNode }) {
  const [pending, setPending] = useState<PendingPick | undefined>();
  const selectionCount = useDraft((state) => state.draft.selections.length);

  // A new pick (by anyone) clears whatever was selected.
  const [seenSelectionCount, setSeenSelectionCount] = useState(selectionCount);
  if (seenSelectionCount !== selectionCount) {
    setSeenSelectionCount(selectionCount);
    setPending(undefined);
  }

  const cancel = () => setPending(undefined);
  const lockIn = () => {
    if (!pending) return;
    pending.commit();
    setPending(undefined);
  };

  // Enter confirms wherever focus ended up (e.g. a pick opened from the map), except in text fields.
  useEffect(() => {
    if (!pending) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Enter" || event.defaultPrevented) return;
      const el = event.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable)) return;
      // A focused button inside the dialog handles Enter itself (Cancel must stay Cancel).
      if (el?.closest("[role=dialog]") && el.tagName === "BUTTON") return;
      event.preventDefault();
      pending.commit();
      setPending(undefined);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pending]);

  const value = useMemo<PendingPickContextValue>(
    () => ({
      pending,
      select: setPending,
      isPending: (key) => pending?.key === key,
    }),
    [pending],
  );

  return (
    <PendingPickContext.Provider value={value}>
      {children}
      <Modal
        opened={!!pending}
        onClose={cancel}
        size="sm"
        title={pending ? `Lock in ${pending.label}?` : "Lock in pick?"}
        footer={
          <>
            <Button variant="tertiary" onClick={cancel}>
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
  select: () => {},
  isPending: () => false,
};

/** Outside a provider (replay, other phases) nothing can be pending. */
export function usePendingPick() {
  return useContext(PendingPickContext) ?? noop;
}
