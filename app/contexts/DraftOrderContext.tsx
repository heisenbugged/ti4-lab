import { createContext, ReactNode, useContext } from "react";
import type { DraftOrderContext } from "~/routes/draft/route";

const DraftOrderContextProvider = createContext<DraftOrderContext | null>(null);

export function DraftOrderContextProviderComponent({
  children,
  value,
}: {
  children: ReactNode;
  value: DraftOrderContext;
}) {
  return (
    <DraftOrderContextProvider.Provider value={value}>
      {children}
    </DraftOrderContextProvider.Provider>
  );
}

export function useDraftOrderContext(): DraftOrderContext | null {
  return useContext(DraftOrderContextProvider);
}
