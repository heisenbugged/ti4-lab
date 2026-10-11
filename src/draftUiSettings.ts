import { create } from "zustand";

/**
 * View toggles for the draft pages (admin tools, art style, colours). Owned by
 * the /draft layout, which resets them when you leave; everywhere else they
 * read as the defaults.
 */
type DraftUiSettings = {
  adminMode: boolean;
  pickForAnyone: boolean;
  originalArt: boolean;
  accessibleColors: boolean;
  setAdminMode: (value: boolean) => void;
  setPickForAnyone: (value: boolean) => void;
  setOriginalArt: (value: boolean) => void;
  setAccessibleColors: (value: boolean) => void;
  reset: () => void;
};

const defaults = {
  adminMode: false,
  pickForAnyone: false,
  originalArt: false,
  accessibleColors: false,
};

export const useDraftUiSettings = create<DraftUiSettings>()((set) => ({
  ...defaults,
  setAdminMode: (adminMode) => set({ adminMode }),
  setPickForAnyone: (pickForAnyone) => set({ pickForAnyone }),
  setOriginalArt: (originalArt) => set({ originalArt }),
  setAccessibleColors: (accessibleColors) => set({ accessibleColors }),
  reset: () => set(defaults),
}));
