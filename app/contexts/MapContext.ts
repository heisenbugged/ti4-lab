import { createContext } from "react";

export const MapContext = createContext({
  hOffset: 0,
  wOffset: 0,
  radius: 0,
  gap: 0,
  disabled: false,
  /** Settle-in animation when a hex's contents change (off for slice previews, which regenerate in bulk). */
  animateChanges: true as boolean,
});
