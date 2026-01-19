import { DraftPick, HydratedPlayer, HOME_PHASE, PRIORITY_PHASE } from "~/types";

export type DraftOrderEntry = {
  player: HydratedPlayer;
  idx: number;
  isActive: boolean;
  isPassed: boolean;
};

export function getDraftOrderEntries(
  pickOrder: DraftPick[],
  players: HydratedPlayer[],
  currentPick: number,
): DraftOrderEntry[] {
  const entries: DraftOrderEntry[] = [];

  pickOrder.forEach((playerId, idx) => {
    if (typeof playerId !== "number") return;
    if (playerId === PRIORITY_PHASE || playerId === HOME_PHASE) return;

    const player = players.find(({ id }) => id === playerId);
    if (!player) return;

    entries.push({
      player,
      idx,
      isActive: idx === currentPick,
      isPassed: idx < currentPick,
    });
  });

  return entries;
}
