import { draftStoreAtom, useDraft } from "~/draftStore";
import { Player, DraftSelection, HydratedPlayer, DiscordPlayer } from "~/types";
import { hydrateMap } from "~/utils/map";
import { atom } from "jotai/vanilla";
import { useAtom } from "jotai";
import { draftConfig } from "~/draft";
import { factionSystems } from "~/data/systemData";
import { useSafeOutletContext } from "~/useSafeOutletContext";

// check if the player name is either empty or Player N where 'n' is a number
const isDefaultName = (name: string) => {
  return name === "" || name.startsWith("Player ");
};

export function hydratePlayers(
  players: Player[],
  selections: DraftSelection[],
  draftSpeaker: boolean = false,
  discordPlayers: DiscordPlayer[] = [],
): HydratedPlayer[] {
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

  return selections.reduce(
    (acc, selection) => {
      const playerIdx = acc.findIndex((p) => p.id === selection.playerId);
      if (playerIdx === -1) return acc;

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

      if (selection.type === "SELECT_REFERENCE_CARD") {
        acc[playerIdx] = {
          ...acc[playerIdx],
          referenceFaction: selection.referenceFactionId,
        };
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
  );
});

export const hydratedMapAtom = atom((get) => {
  const store = get(draftStoreAtom);
  const hydratedPlayers = get(hydratedPlayersAtom);

  return hydrateMap(
    draftConfig[store.draft.settings.type],
    store.draft.presetMap,
    store.draft.slices,
    computePlayerSelections(hydratedPlayers),
  );
});

export const hydratedMapStringAtom = atom((get) => {
  const hydratedMap = get(hydratedMapAtom);
  const hydratedPlayers = get(hydratedPlayersAtom);

  // slice to remove mecatol
  return hydratedMap
    .slice(1, hydratedMap.length)
    .map((t) => {
      if (t.type === "HOME") {
        const player = hydratedPlayers.find((p) => p.id === t.playerId);
        if (player?.faction === undefined) return "0";
        return factionSystems[player.faction]?.id ?? "0";
      }
      if (t.type === "SYSTEM") return t.systemId;
      return "-1";
    })
    .join(" ");
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
  const activePlayerId = pickOrder[currentPick];
  const activePlayer = hydratedPlayers.find((p) => p.id === activePlayerId)!;
  const draftFinished = hydrated && currentPick >= pickOrder.length;

  return {
    hydratedMap,
    hydratedPlayers,
    activePlayer,
    currentPick,
    lastEvent: "",
    currentlyPicking: activePlayerId === selectedPlayer || pickForAnyone,
    draftFinished,
  };
}
