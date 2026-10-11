import { useAtom } from "jotai";
import { hydratedPlayersAtom } from "./useHydratedDraft";

export function useDraftedSlices() {
  const [hydratedPlayers] = useAtom(hydratedPlayersAtom);
  const draftedSlices = hydratedPlayers
    .map((p) => p.sliceIdx)
    .filter((i) => i !== undefined) as number[];
  return draftedSlices;
}
