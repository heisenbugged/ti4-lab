import { createContext } from "react";

export const MapContext = createContext({
  height: 0,
  hOffset: 0,
  width: 0,
  wOffset: 0,
  radius: 0,
  gap: 0,
  disabled: false,
});
