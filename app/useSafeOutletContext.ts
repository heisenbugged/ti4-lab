import { useOutletContext } from "react-router";
import { DraftOrderContext } from "./routes/draft/route";

export function useSafeOutletContext(): DraftOrderContext {
  const context = useOutletContext<DraftOrderContext>();

  if (context) return context;
  return {
    adminMode: false,
    pickForAnyone: false,
    originalArt: false,
    accessibleColors: false,
    setOriginalArt: () => {},
    setAdminMode: () => {},
    setPickForAnyone: () => {},
    setAccessibleColors: () => {},
  };
}
