import { shuffle } from "~/draft/helpers/randomization";
import { systemData } from "~/data/systemData";
import {
  Draft,
  FactionId,
  Player,
  PlayerId,
  SimultaneousPickType,
  SystemId,
  TexasDraftState,
} from "~/types";

export const TEXAS_REDRAW_VALUE = "REDRAW";

export function createTexasSeatAssignments(
  players: Player[],
): Pick<TexasDraftState, "seatOrder" | "seatAssignments" | "speakerId"> {
  const seatOrder = shuffle(players.map((player) => player.id), players.length);
  const seatAssignments = seatOrder.reduce<Record<PlayerId, number>>(
    (acc, playerId, idx) => {
      acc[playerId] = idx;
      return acc;
    },
    {},
  );

  return {
    seatOrder,
    seatAssignments,
    speakerId: seatOrder[0],
  };
}

export function dealTexasFactionOptions(
  factionPool: FactionId[],
  players: Player[],
  handSize: number,
): Pick<
  TexasDraftState,
  | "factionOptions"
  | "factionDrawPile"
  | "initialFactionOptions"
  | "initialFactionDrawPile"
> {
  const shuffled = shuffle([...factionPool]);
  const factionOptions = players.reduce<Record<PlayerId, FactionId[]>>(
    (acc, player) => {
      acc[player.id] = shuffled.splice(0, handSize);
      return acc;
    },
    {},
  );

  return {
    factionOptions,
    factionDrawPile: shuffled,
    initialFactionOptions: Object.fromEntries(
      Object.entries(factionOptions).map(([id, options]) => [
        Number(id),
        [...options],
      ]),
    ) as Record<PlayerId, FactionId[]>,
    initialFactionDrawPile: [...shuffled],
  };
}

export function dealTexasTiles(
  systemPool: SystemId[],
  players: Player[],
): Pick<TexasDraftState, "tileHands" | "tileKeeps" | "initialTileHands"> {
  const bluePool = shuffle(
    systemPool.filter((id) => systemData[id]?.type === "BLUE"),
  );
  const redPool = shuffle(
    systemPool.filter((id) => systemData[id]?.type === "RED"),
  );

  const tileHands = {
    blue: {} as Record<PlayerId, SystemId[]>,
    red: {} as Record<PlayerId, SystemId[]>,
  };

  players.forEach((player) => {
    tileHands.blue[player.id] = bluePool.splice(0, 3);
    tileHands.red[player.id] = redPool.splice(0, 2);
  });

  const initialTileHands = {
    blue: Object.fromEntries(
      Object.entries(tileHands.blue).map(([id, tiles]) => [
        Number(id),
        [...tiles],
      ]),
    ) as Record<PlayerId, SystemId[]>,
    red: Object.fromEntries(
      Object.entries(tileHands.red).map(([id, tiles]) => [
        Number(id),
        [...tiles],
      ]),
    ) as Record<PlayerId, SystemId[]>,
  };

  return {
    tileHands,
    initialTileHands,
    tileKeeps: {
      blue: {},
      red: {},
    },
  };
}

export function applyTexasFactionCommit(
  draft: Draft,
  selections: { playerId: PlayerId; value: string }[],
) {
  if (!draft.texasDraft) return selections;

  const allowRedraw = draft.settings.texasAllowFactionRedraw !== false;
  const drawPile = draft.texasDraft.factionDrawPile ?? [];
  const resolvedSelections = selections.map((selection) => {
    if (selection.value !== TEXAS_REDRAW_VALUE) {
      return selection;
    }

    if (!allowRedraw) {
      const fallback =
        draft.texasDraft?.factionOptions?.[selection.playerId]?.[0];
      return fallback ? { ...selection, value: fallback } : selection;
    }

    const drawn = drawPile.pop();
    if (!drawn) {
      const fallback =
        draft.texasDraft?.factionOptions?.[selection.playerId]?.[0];
      return fallback ? { ...selection, value: fallback } : selection;
    }
    return { ...selection, value: drawn };
  });

  draft.texasDraft.factionDrawPile = drawPile;
  return resolvedSelections;
}

export function applyTexasTileCommit(
  draft: Draft,
  phase: SimultaneousPickType,
  selections: { playerId: PlayerId; value: string }[],
) {
  if (!draft.texasDraft?.tileHands || !draft.texasDraft.tileKeeps) return;
  const seatOrder = draft.texasDraft.seatOrder;

  const selectionMap = selections.reduce<Record<PlayerId, SystemId>>(
    (acc, selection) => {
      acc[selection.playerId] = selection.value as SystemId;
      return acc;
    },
    {},
  );

  const applyPass = (color: "blue" | "red") => {
    const hands = draft.texasDraft!.tileHands![color];
    const keeps = draft.texasDraft!.tileKeeps![color];
    const nextHands: Record<PlayerId, SystemId[]> = seatOrder.reduce(
      (acc, playerId) => {
        acc[playerId] = [];
        return acc;
      },
      {} as Record<PlayerId, SystemId[]>,
    );

    seatOrder.forEach((playerId, idx) => {
      const selected = selectionMap[playerId];
      const currentHand = hands[playerId] ?? [];
      if (!selected || !currentHand.includes(selected)) return;

      keeps[playerId] = [...(keeps[playerId] ?? []), selected];
      const remaining = currentHand.filter((id) => id !== selected);
      const nextPlayerId = seatOrder[(idx + 1) % seatOrder.length];
      nextHands[nextPlayerId] = remaining;
    });

    draft.texasDraft!.tileHands![color] = nextHands;
  };

  if (phase === "texasBlueKeep1" || phase === "texasBlueKeep2") {
    applyPass("blue");
  }

  if (phase === "texasRedKeep") {
    applyPass("red");
  }

  if (phase === "texasRedKeep") {
    const finalTiles: Record<PlayerId, SystemId[]> = {};
    seatOrder.forEach((playerId) => {
      const blueKeeps = draft.texasDraft!.tileKeeps!.blue[playerId] ?? [];
      const redKeeps = draft.texasDraft!.tileKeeps!.red[playerId] ?? [];
      const blueHand = draft.texasDraft!.tileHands!.blue[playerId] ?? [];
      const redHand = draft.texasDraft!.tileHands!.red[playerId] ?? [];
      finalTiles[playerId] = [
        ...blueKeeps,
        ...blueHand,
        ...redKeeps,
        ...redHand,
      ];
    });
    draft.texasDraft!.playerTiles = finalTiles;
  }
}

export function rebuildTexasDraftState(draft: Draft) {
  if (!draft.texasDraft?.initialTileHands) return;

  draft.texasDraft.tileHands = {
    blue: Object.fromEntries(
      Object.entries(draft.texasDraft.initialTileHands.blue).map(
        ([id, tiles]) => [Number(id), [...tiles]],
      ),
    ) as Record<PlayerId, SystemId[]>,
    red: Object.fromEntries(
      Object.entries(draft.texasDraft.initialTileHands.red).map(
        ([id, tiles]) => [Number(id), [...tiles]],
      ),
    ) as Record<PlayerId, SystemId[]>,
  };
  draft.texasDraft.tileKeeps = { blue: {}, red: {} };
  draft.texasDraft.playerTiles = undefined;

  if (draft.texasDraft.initialFactionOptions) {
    draft.texasDraft.factionOptions = Object.fromEntries(
      Object.entries(draft.texasDraft.initialFactionOptions).map(
        ([id, options]) => [Number(id), [...options]],
      ),
    ) as Record<PlayerId, FactionId[]>;
    draft.texasDraft.factionDrawPile = [
      ...(draft.texasDraft.initialFactionDrawPile ?? []),
    ];
  }

  draft.selections.forEach((selection) => {
    if (selection.type === "COMMIT_SIMULTANEOUS") {
      if (
        selection.phase === "texasBlueKeep1" ||
        selection.phase === "texasBlueKeep2" ||
        selection.phase === "texasRedKeep"
      ) {
        applyTexasTileCommit(draft, selection.phase, selection.selections);
      }
    }
  });
}
