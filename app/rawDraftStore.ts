import { create } from "zustand";
import { GameSet, Map, SystemId, Tile } from "~/types";
import { generateStandard6pMap } from "~/utils/mapGenerator";
import { getSystemPool } from "~/utils/system";
import { generateSlices } from "~/draft/milty/sliceGenerator";
import { getAdjacentPositions } from "~/draft/common/sliceGenerator";
import { systemData } from "~/data/systemData";

type RawDraftPlayer = {
  id: number;
  name: string;
  tiles: SystemId[]; // 5 tiles from their slice
};

type PlaceTileEvent = {
  type: "PLACE_TILE";
  playerId: number;
  mapIdx: number;
  systemId: SystemId;
  pickNumber: number;
};

type RawDraftEvent = PlaceTileEvent;

type RawDraftState = {
  initialized: boolean;
  players: RawDraftPlayer[];
  pickOrder: number[]; // Snake draft order [0,1,2,3,4,5,5,4,3,2,1,0,...]
  events: RawDraftEvent[];
  selectedPlayer?: number;
  gameSets: GameSet[];
};

type RawDraftActions = {
  placeTile: (mapIdx: number, systemId: SystemId) => void;
  setSelectedPlayer: (playerId: number) => void;
  initializeDraft: () => void;
};

type RawDraftStore = {
  state: RawDraftState;
  actions: RawDraftActions;
  // Computed getters
  getMap: () => Map;
  getActivePlayer: () => RawDraftPlayer | undefined;
  getCurrentPickNumber: () => number;
  getPlayerTiles: (playerId: number) => SystemId[];
  getCurrentPlaceableRing: () => number;
  getPlaceableTileIndices: (draggedSystemId?: SystemId) => number[];
  isDraftComplete: () => boolean;
};

// Generate snake draft pick order for 6 players, 5 rounds (30 picks total)
function generateSnakeOrder(numPlayers: number, numRounds: number): number[] {
  const order: number[] = [];
  for (let round = 0; round < numRounds; round++) {
    if (round % 2 === 0) {
      // Forward: 0, 1, 2, 3, 4, 5
      for (let i = 0; i < numPlayers; i++) {
        order.push(i);
      }
    } else {
      // Backward: 5, 4, 3, 2, 1, 0
      for (let i = numPlayers - 1; i >= 0; i--) {
        order.push(i);
      }
    }
  }
  return order;
}

// Ring definitions for 6-player map (37 tiles total)
// Ring 0: Mecatol (idx 0)
// Ring 1: Inner ring around Mecatol (idx 1-6)
// Ring 2: Middle ring (idx 7-18) - contains home systems at 19, 22, 25, 28, 31, 34
// Ring 3: Outer ring (idx 19-36)
const RING_INDICES = {
  0: [0], // Mecatol
  1: [1, 2, 3, 4, 5, 6], // Inner ring (6 tiles)
  2: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], // Middle ring (12 tiles)
  3: [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36], // Outer ring (18 tiles)
} as const;

const HOME_POSITIONS = [19, 22, 25, 28, 31, 34];

// Determine which ring should be placeable based on map state
function getCurrentPlaceableRing(map: Map): number {
  // Ring 1 (inner): Always place here first
  const ring1Tiles = RING_INDICES[1];
  const ring1Filled = ring1Tiles.every(idx => map[idx].type === "SYSTEM");
  if (!ring1Filled) return 1;

  // Ring 2 (middle): Place after ring 1 is full
  const ring2Tiles = RING_INDICES[2];
  const ring2Filled = ring2Tiles.every(idx => map[idx].type === "SYSTEM");
  if (!ring2Filled) return 2;

  // Ring 3 (outer): Place after ring 2 is full
  return 3;
}

export const useRawDraft = create<RawDraftStore>((set, get) => {
  const initialGameSets: GameSet[] = ["base", "pok"];

  return {
    state: {
      initialized: false,
      players: [],
      pickOrder: [],
      events: [],
      selectedPlayer: undefined,
      gameSets: initialGameSets,
    },

    actions: {
      initializeDraft: () => {
        const gameSets = get().state.gameSets;
        const systemPool = getSystemPool(gameSets);

        // Generate 6 slices using milty config
        const slices = generateSlices(6, systemPool, {
          numAlphas: 2,
          numBetas: 2,
          numLegendaries: 1,
        });

        if (!slices) {
          console.error("Failed to generate slices");
          return;
        }

        // Create 6 players with tiles from slices
        const players: RawDraftPlayer[] = slices.map((slice, idx) => ({
          id: idx,
          name: `Player ${String.fromCharCode(65 + idx)}`, // A, B, C, D, E, F
          tiles: slice,
        }));

        // Generate snake draft order for 5 rounds
        const pickOrder = generateSnakeOrder(6, 5);

        set((store) => ({
          ...store,
          state: {
            ...store.state,
            initialized: true,
            players,
            pickOrder,
            events: [],
          },
        }));
      },

      placeTile: (mapIdx: number, systemId: SystemId) => {
        const { state } = get();
        const activePlayer = get().getActivePlayer();
        const currentPickNumber = get().getCurrentPickNumber();

        if (!activePlayer) {
          console.error("No active player");
          return;
        }

        // Get current map state to check ring restrictions
        const currentMap = get().getMap();
        const placeableRing = getCurrentPlaceableRing(currentMap);

        // Check if the target index is in the current placeable ring
        const isInPlaceableRing = RING_INDICES[placeableRing as 1 | 2 | 3]?.includes(mapIdx);
        if (!isInPlaceableRing) {
          console.error(`Can only place tiles in ring ${placeableRing} right now`);
          return;
        }

        // Don't allow placing on home system positions
        if (HOME_POSITIONS.includes(mapIdx)) {
          console.error("Cannot place on home system positions");
          return;
        }

        // Check anomaly adjacency rule
        // Exception: Allow if player has no non-anomaly tiles left
        const placedSystem = systemData[systemId];
        const isAnomaly = placedSystem?.anomalies.length > 0;
        const wormholes = placedSystem?.wormholes || [];
        const playerTiles = get().getPlayerTiles(activePlayer.id);

        if (isAnomaly) {
          const hasNonAnomalyOption = playerTiles.some(
            tileId => systemData[tileId]?.anomalies.length === 0
          );

          if (hasNonAnomalyOption) {
            const adjacentPositions = getAdjacentPositions(mapIdx);
            const hasAdjacentAnomaly = adjacentPositions.some(adjIdx => {
              const adjTile = currentMap[adjIdx];
              // Only check tiles that exist and are SYSTEM tiles (not CLOSED, HOME, or OPEN)
              return adjTile && adjTile.type === "SYSTEM" && systemData[adjTile.systemId]?.anomalies.length > 0;
            });
            if (hasAdjacentAnomaly) {
              console.error("Cannot place anomaly adjacent to another anomaly (you have non-anomaly tiles available)");
              return;
            }
          }
        }

        // Check wormhole adjacency rule
        // Exception: Allow if player has no tiles without that wormhole type
        for (const wormholeType of wormholes) {
          const hasAlternative = playerTiles.some(tileId => {
            const system = systemData[tileId];
            return !system.wormholes.includes(wormholeType);
          });

          if (hasAlternative) {
            const adjacentPositions = getAdjacentPositions(mapIdx);
            const hasAdjacentSameWormhole = adjacentPositions.some(adjIdx => {
              const adjTile = currentMap[adjIdx];
              // Only check tiles that exist and are SYSTEM tiles (not CLOSED, HOME, or OPEN)
              return adjTile && adjTile.type === "SYSTEM" && systemData[adjTile.systemId]?.wormholes.includes(wormholeType);
            });
            if (hasAdjacentSameWormhole) {
              console.error(`Cannot place ${wormholeType} wormhole adjacent to another ${wormholeType} wormhole (you have tiles without ${wormholeType} available)`);
              return;
            }
          }
        }

        // TODO: Remove this testing override - allow placing any player's tiles
        // Verify the active player has this tile
        // const playerTiles = get().getPlayerTiles(activePlayer.id);
        // if (!playerTiles.includes(systemId)) {
        //   console.error("Player does not have this tile");
        //   return;
        // }

        // Create PLACE_TILE event
        const event: PlaceTileEvent = {
          type: "PLACE_TILE",
          playerId: activePlayer.id,
          mapIdx,
          systemId,
          pickNumber: currentPickNumber,
        };

        set((store) => ({
          ...store,
          state: {
            ...store.state,
            events: [...store.state.events, event],
          },
        }));
      },

      setSelectedPlayer: (playerId: number) => {
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            selectedPlayer: playerId,
          },
        }));
      },
    },

    // Computed getters
    getMap: () => {
      const { state } = get();
      const map = generateStandard6pMap();

      // Assign player IDs to home tiles (clockwise from 12 o'clock: positions 19, 22, 25, 28, 31, 34)
      HOME_POSITIONS.forEach((homeIdx, playerIdx) => {
        const tile = map[homeIdx];
        if (tile.type === "HOME") {
          map[homeIdx] = {
            ...tile,
            playerId: playerIdx,
          };
        }
      });

      // Replay all PLACE_TILE events to build current map
      state.events.forEach((event) => {
        if (event.type === "PLACE_TILE") {
          map[event.mapIdx] = {
            ...map[event.mapIdx],
            type: "SYSTEM",
            systemId: event.systemId,
          };
        }
      });

      return map;
    },

    getActivePlayer: () => {
      const { state } = get();
      const currentPickNumber = get().getCurrentPickNumber();

      if (currentPickNumber >= state.pickOrder.length) {
        return undefined; // Draft is complete
      }

      const activePlayerId = state.pickOrder[currentPickNumber];
      return state.players[activePlayerId];
    },

    getCurrentPickNumber: () => {
      return get().state.events.length;
    },

    getPlayerTiles: (playerId: number) => {
      const { state } = get();
      const player = state.players[playerId];
      if (!player) return [];

      // Filter out tiles that have been placed by this player
      const placedTiles = state.events
        .filter((e) => e.type === "PLACE_TILE" && e.playerId === playerId)
        .map((e) => (e as PlaceTileEvent).systemId);

      return player.tiles.filter((tile) => !placedTiles.includes(tile));
    },

    getCurrentPlaceableRing: () => {
      const map = get().getMap();
      return getCurrentPlaceableRing(map);
    },

    getPlaceableTileIndices: (draggedSystemId?: SystemId) => {
      const map = get().getMap();
      const ring = getCurrentPlaceableRing(map);
      const ringIndices = RING_INDICES[ring as 1 | 2 | 3] || [];

      if (!draggedSystemId) {
        // No restrictions when not dragging
        return ringIndices.filter(idx => {
          const tile = map[idx];
          return tile.type === "OPEN" && !HOME_POSITIONS.includes(idx);
        });
      }

      const draggedSystem = systemData[draggedSystemId];
      const isAnomalyBeingDragged = draggedSystem?.anomalies.length > 0;
      const draggedWormholes = draggedSystem?.wormholes || [];

      // Get all positions on the map that have anomalies
      const anomalyPositions: number[] = [];
      if (isAnomalyBeingDragged) {
        map.forEach((tile, idx) => {
          if (tile.type === "SYSTEM" && systemData[tile.systemId]?.anomalies.length > 0) {
            anomalyPositions.push(idx);
          }
        });
      }

      // Get positions with matching wormhole types
      const wormholePositionsByType: Record<string, number[]> = {
        ALPHA: [],
        BETA: [],
      };
      draggedWormholes.forEach(wormholeType => {
        map.forEach((tile, idx) => {
          if (tile.type === "SYSTEM" && systemData[tile.systemId]?.wormholes.includes(wormholeType)) {
            wormholePositionsByType[wormholeType].push(idx);
          }
        });
      });

      // Check if active player has alternative tiles
      const activePlayer = get().getActivePlayer();
      const playerTiles = activePlayer ? get().getPlayerTiles(activePlayer.id) : [];

      const hasNonAnomalyOption = playerTiles.some(
        tileId => systemData[tileId]?.anomalies.length === 0
      );

      const hasAlternativeForWormholes: Record<string, boolean> = {};
      draggedWormholes.forEach(wormholeType => {
        hasAlternativeForWormholes[wormholeType] = playerTiles.some(tileId => {
          const system = systemData[tileId];
          return !system.wormholes.includes(wormholeType);
        });
      });

      // Return only indices that are OPEN tiles (not already filled or home positions)
      // and enforce adjacency rules unless player has no alternatives
      return ringIndices.filter(idx => {
        const tile = map[idx];
        if (tile.type !== "OPEN" || HOME_POSITIONS.includes(idx)) {
          return false;
        }

        const adjacentPositions = getAdjacentPositions(idx);

        // If dragging an anomaly and player has non-anomaly options, enforce adjacency rule
        if (isAnomalyBeingDragged && hasNonAnomalyOption) {
          const hasAdjacentAnomaly = adjacentPositions.some(adjIdx => {
            // Only check valid adjacent positions (filter out -1 and out of bounds)
            if (adjIdx < 0 || adjIdx >= map.length) return false;
            return anomalyPositions.includes(adjIdx);
          });
          if (hasAdjacentAnomaly) return false;
        }

        // If dragging a wormhole and player has alternatives, enforce adjacency rule
        for (const wormholeType of draggedWormholes) {
          if (hasAlternativeForWormholes[wormholeType]) {
            const hasAdjacentSameWormhole = adjacentPositions.some(adjIdx => {
              // Only check valid adjacent positions (filter out -1 and out of bounds)
              if (adjIdx < 0 || adjIdx >= map.length) return false;
              return wormholePositionsByType[wormholeType].includes(adjIdx);
            });
            if (hasAdjacentSameWormhole) return false;
          }
        }

        return true;
      });
    },

    isDraftComplete: () => {
      const { state } = get();
      // Draft is complete when all picks have been made (30 total for 6 players × 5 tiles)
      return state.events.length >= state.pickOrder.length;
    },
  };
});
