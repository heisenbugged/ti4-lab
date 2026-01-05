import { useOutletContext } from "@remix-run/react";
import { DraftOrderContext } from "./routes/draft/route";
import { useDraftOrderContext } from "./contexts/DraftOrderContext";

export function useSafeOutletContext(): DraftOrderContext {
  const outletContext = useOutletContext<DraftOrderContext>();
  const reactContext = useDraftOrderContext();

  const context = outletContext || reactContext;

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
