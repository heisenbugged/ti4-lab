import { createContext, ReactNode, useContext } from "react";

type RawDraftPlayer = {
  id: number;
  name: string;
};

type RawDraftContextValue = {
  players: RawDraftPlayer[];
};

const RawDraftContext = createContext<RawDraftContextValue | null>(null);

export function RawDraftProvider({
  children,
  players,
}: {
  children: ReactNode;
  players: RawDraftPlayer[];
}) {
  return (
    <RawDraftContext.Provider value={{ players }}>
      {children}
    </RawDraftContext.Provider>
  );
}

export function useRawDraftContext() {
  const context = useContext(RawDraftContext);
  return context;
}
