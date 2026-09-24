import { draftStoreAtom, useDraft } from "~/draftStore";
import {
  Player,
  Draft,
  DraftSelection,
  hasPlayerId,
  DraftSettings,
  HydratedPlayer,
  DiscordPlayer,
  PlayerId,
  FactionReferenceCardPack,
  FactionId,
  HomeTile,
} from "~/types";
import { hydrateMap, hydratePresetMap } from "~/utils/map";
import { atom } from "jotai/vanilla";
import { useAtom } from "jotai";
import { draftConfig } from "~/draft";
import { factionSystems } from "~/data/systemData";
import { factions as allFactions } from "~/data/factionData";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import {
  encodeAsyncMapString,
  encodeTtpgMapString,
} from "~/mapgen/utils/externalMapStringCodec";

// check if the player name is either empty or Player N where 'n' is a number
const isDefaultName = (name: string) => {
  return name === "" || name.startsWith("Player ");
};

type FactionPick = { playerId: PlayerId; factionId: FactionId };

function applyPriorityOrder(
  players: HydratedPlayer[],
  picks: FactionPick[],
  preserveSeatAssignment: boolean,
) {
  picks.forEach(({ playerId, factionId }) => {
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx !== -1) {
      players[idx] = {
        ...players[idx],
        priorityValueFactionId: factionId,
      };
    }
  });

  const sortedByPriority = [...picks].sort((a, b) => {
    const priorityA = allFactions[a.factionId]?.priorityOrder ?? 999;
    const priorityB = allFactions[b.factionId]?.priorityOrder ?? 999;
    return priorityA - priorityB;
  });

  sortedByPriority.forEach(({ playerId }, speakerOrder) => {
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;
    // If preserveSeatAssignment is true and player already has a seat,
    // only assign speakerOrder, not seatIdx
    if (preserveSeatAssignment && players[idx].seatIdx !== undefined) {
      players[idx] = { ...players[idx], speakerOrder };
    } else {
      players[idx] = { ...players[idx], seatIdx: speakerOrder, speakerOrder };
    }
  });
}

function applyHomeSystems(
  players: HydratedPlayer[],
  picks: FactionPick[],
  availableReferenceCardPacks?: FactionReferenceCardPack[],
) {
  picks.forEach(({ playerId, factionId }) => {
    const idx = players.findIndex((p) => p.id === playerId);
    if (idx === -1) return;
    players[idx] = {
      ...players[idx],
      homeSystemFactionId: factionId,
    };

    const packIdx = players[idx].referenceCardPackIdx;
    if (packIdx === undefined || !availableReferenceCardPacks) return;

    const pack = availableReferenceCardPacks[packIdx]!;
    const startingUnitsCard = pack.find(
      (cardId) =>
        cardId !== players[idx].priorityValueFactionId &&
        cardId !== players[idx].homeSystemFactionId,
    );
    if (startingUnitsCard) {
      players[idx] = {
        ...players[idx],
        startingUnitsFactionId: startingUnitsCard,
      };
    }
  });
}

export function hydratePlayers(
  players: Player[],
  selections: DraftSelection[],
  draftSpeaker: boolean = false,
  discordPlayers: DiscordPlayer[] = [],
  availableReferenceCardPacks?: FactionReferenceCardPack[],
  texasDraft?: Draft["texasDraft"],
  settings?: DraftSettings,
): HydratedPlayer[] {
  // Derive preserveSeatAssignment from settings
  const preserveSeatAssignment =
    settings?.draftGameMode === "twilightsFall" &&
    settings?.nucleusStyle === true;

  const hydratedPlayers = players.map((p) => {
    const discordPlayer = discordPlayers.find((dp) => dp.playerId === p.id);

    let name = p.name;
    if (
      discordPlayer &&
      discordPlayer.type === "identified" &&
      isDefaultName(name)
    ) {
      name = discordPlayer.nickname ?? discordPlayer.username;
    }
    return {
      ...p,
      name,
      hasDiscord: discordPlayer?.type === "identified",
    } as HydratedPlayer;
  });

  if (texasDraft?.seatAssignments) {
    Object.entries(texasDraft.seatAssignments).forEach(([playerId, seatIdx]) => {
      const idx = hydratedPlayers.findIndex((p) => p.id === Number(playerId));
      if (idx !== -1) {
        hydratedPlayers[idx] = {
          ...hydratedPlayers[idx],
          seatIdx,
          speakerOrder: seatIdx,
        };
      }
    });
  }

  return selections.reduce(
    (acc, selection) => {
      let playerIdx = -1;
      if (hasPlayerId(selection)) {
        playerIdx = acc.findIndex((p) => p.id === selection.playerId);
        if (playerIdx === -1) return acc;
      }

      if (selection.type === "BAN_FACTION") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          bannedFactions: [
            ...(acc[playerIdx].bannedFactions ?? []),
            selection.factionId,
          ],
        };
      }

      if (selection.type === "SELECT_SPEAKER_ORDER") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          speakerOrder: selection.speakerOrder,
        };
      }

      if (selection.type === "SELECT_SLICE") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          sliceIdx: selection.sliceIdx,
        };
      }

      if (selection.type === "SELECT_FACTION") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          faction: selection.factionId,
        };
      }

      if (selection.type === "SELECT_MINOR_FACTION") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          minorFaction: selection.minorFactionId,
        };
      }

      if (selection.type === "SELECT_REFERENCE_CARD_PACK") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          referenceCardPackIdx: selection.packIdx,
        };
      }

      if (selection.type === "COMMIT_PRIORITY_VALUES") {
        applyPriorityOrder(
          acc,
          selection.selections.map(({ playerId, priorityValueFactionId }) => ({
            playerId,
            factionId: priorityValueFactionId,
          })),
          preserveSeatAssignment,
        );
      }

      if (selection.type === "COMMIT_SIMULTANEOUS") {
        const picks = selection.selections.map(({ playerId, value }) => ({
          playerId,
          factionId: value as FactionId,
        }));

        if (selection.phase === "priorityValue") {
          applyPriorityOrder(acc, picks, preserveSeatAssignment);
        }

        if (selection.phase === "homeSystem") {
          applyHomeSystems(acc, picks, availableReferenceCardPacks);
        }

        if (selection.phase === "texasFaction") {
          picks.forEach(({ playerId, factionId }) => {
            const idx = acc.findIndex((p) => p.id === playerId);
            if (idx !== -1) {
              acc[idx] = {
                ...acc[idx],
                faction: factionId,
              };
            }
          });
        }
      }

      if (selection.type === "COMMIT_HOME_SYSTEMS") {
        applyHomeSystems(
          acc,
          selection.selections.map(({ playerId, homeSystemFactionId }) => ({
            playerId,
            factionId: homeSystemFactionId,
          })),
          availableReferenceCardPacks,
        );
      }

      if (selection.type === "SELECT_SEAT") {
        const updated = {
          ...acc[playerIdx],
          seatIdx: selection.seatIdx,
        };
        if (!draftSpeaker) {
          updated.speakerOrder = selection.seatIdx;
        }

        acc[playerIdx] = updated;
      }

      if (selection.type === "SELECT_PLAYER_COLOR") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          factionColor: selection.color,
        };
      }

      return acc;
    },
    [...hydratedPlayers],
  );
}

export const computePlayerSelections = (hydratedPlayers: HydratedPlayer[]) =>
  hydratedPlayers.map((p) => ({
    playerId: p.id,
    sliceIdx: p.sliceIdx,
    seatIdx: p.seatIdx,
    minorFaction: p.minorFaction,
  }));

export const hydratedPlayersAtom = atom((get) => {
  const draft = get(draftStoreAtom).draft;
  return hydratePlayers(
    draft.players,
    draft.selections,
    draft.settings.draftSpeaker,
    draft.integrations.discord?.players,
    draft.availableReferenceCardPacks,
    draft.texasDraft,
    draft.settings,
  );
});

export const hydratedMapAtom = atom((get) => {
  const store = get(draftStoreAtom);
  const hydratedPlayers = get(hydratedPlayersAtom);
  const selections = computePlayerSelections(hydratedPlayers);

  if (store.draft.settings.draftGameMode === "presetMap") {
    return hydratePresetMap(store.draft.presetMap, selections);
  }

  return hydrateMap(
    draftConfig[store.draft.settings.type],
    store.draft.presetMap,
    store.draft.slices,
    selections,
  );
});

export const hydratedMapStringsAtom = atom((get) => {
  const hydratedMap = get(hydratedMapAtom);
  const hydratedPlayers = get(hydratedPlayersAtom);

  const options = {
    homeSystemId: (tile: HomeTile) => {
      const player = hydratedPlayers.find((p) => p.id === tile.playerId);
      const faction = player?.homeSystemFactionId ?? player?.faction;
      return faction ? factionSystems[faction]?.id : "0";
    },
  } as const;

  return {
    ttpg: encodeTtpgMapString(hydratedMap, options),
    async: encodeAsyncMapString(hydratedMap, options),
  };
});

export function useHydratedDraft() {
  const { pickForAnyone } = useSafeOutletContext();
  const selectedPlayer = useDraft((state) => state.selectedPlayer);
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const selections = useDraft((state) => state.draft.selections);
  const hydrated = useDraft((state) => state.hydrated);

  const [hydratedPlayers] = useAtom(hydratedPlayersAtom);
  const [hydratedMap] = useAtom(hydratedMapAtom);

  const currentPick = selections.length;
  const currentPickEntry = pickOrder[currentPick];
  const activePlayerId =
    typeof currentPickEntry === "number" ? currentPickEntry : undefined;
  const activePlayer =
    activePlayerId !== undefined
      ? hydratedPlayers.find((p) => p.id === activePlayerId)
      : undefined;
  const draftFinished = hydrated && currentPick >= pickOrder.length;

  return {
    hydratedMap,
    hydratedPlayers,
    activePlayer,
    currentPick,
    lastEvent: "",
    currentlyPicking:
      activePlayerId !== undefined &&
      (activePlayerId === selectedPlayer || pickForAnyone),
    draftFinished,
  };
}

