import { createContext, ReactNode, useContext } from "react";
import { FactionId } from "~/types";

type RawDraftPlayer = {
  id: number;
  name: string;
};

type RawDraftContextValue = {
  players: RawDraftPlayer[];
  playerColorAssignments?: Record<number, string>;
  playerFactions?: Record<number, FactionId | null>;
};

const RawDraftContext = createContext<RawDraftContextValue | null>(null);

export function RawDraftProvider({
  children,
  players,
  playerColorAssignments,
  playerFactions,
}: {
  children: ReactNode;
  players: RawDraftPlayer[];
  playerColorAssignments?: Record<number, string>;
  playerFactions?: Record<number, FactionId | null>;
}) {
  return (
    <RawDraftContext.Provider
      value={{ players, playerColorAssignments, playerFactions }}
    >
      {children}
    </RawDraftContext.Provider>
  );
}

export function useRawDraftContext() {
  const context = useContext(RawDraftContext);
  return context;
}
