import { create } from "zustand";
import { FactionId, GameSet, Map, SystemId } from "~/types";
import { generateStandard6pMap } from "~/utils/mapGenerator";
import { systemData } from "~/data/systemData";
import { getSystemPool } from "~/utils/system";

type PlanetFinderModal = {
  mode: "map";
  tileIdx: number;
} | null;

type MapBuilderState = {
  map: Map;
  planetFinderModal: PlanetFinderModal;
  systemPool: SystemId[];
  gameSets: GameSet[];
  factionPool: FactionId[];
  allowHomePlanetSearch: boolean;
};

type MapBuilderActions = {
  addSystemToMap: (tileIdx: number, systemId: SystemId) => void;
  removeSystemFromMap: (tileIdx: number) => void;
  clearMap: () => void;
  setMap: (map: Map) => void;
  setGameSets: (gameSets: GameSet[]) => void;
  openPlanetFinderForMap: (tileIdx: number) => void;
  closePlanetFinder: () => void;
  selectSystemForPlanetFinder: (systemId: SystemId) => void;
};

type MapBuilderStore = {
  state: MapBuilderState;
  actions: MapBuilderActions;
  // Expose for PlanetFinder compatibility
  planetFinderModal: PlanetFinderModal;
  systemPool: SystemId[];
  factionPool: FactionId[];
  draft: {
    settings: {
      allowHomePlanetSearch: boolean;
    };
  };
};

export const useMapBuilder = create<MapBuilderStore>((set, get) => {
  const initialGameSets: GameSet[] = ["base", "pok"];
  const systemPool = getSystemPool(initialGameSets);

  return {
    state: {
      map: generateStandard6pMap(),
      planetFinderModal: null,
      systemPool,
      gameSets: initialGameSets,
      factionPool: [],
      allowHomePlanetSearch: false,
    },

    // Expose for PlanetFinder compatibility
    planetFinderModal: null,
    systemPool,
    factionPool: [],
    draft: {
      settings: {
        allowHomePlanetSearch: false,
      },
    },

    actions: {
      addSystemToMap: (tileIdx: number, systemId: SystemId) => {
        set((store) => {
          const newMap = [...store.state.map];
          const system = systemData[systemId];

          if (!system) return store;

          // Remove any existing instance of this system from the map
          for (let i = 0; i < newMap.length; i++) {
            const tile = newMap[i];
            if (tile.type === "SYSTEM" && tile.systemId === systemId) {
              newMap[i] = {
                ...tile,
                type: "OPEN",
              };
            }
          }

          // Add the system to the new location
          newMap[tileIdx] = {
            ...newMap[tileIdx],
            type: "SYSTEM",
            systemId: systemId,
          };

          return {
            ...store,
            state: {
              ...store.state,
              map: newMap,
            },
          };
        });
      },

      removeSystemFromMap: (tileIdx: number) => {
        set((store) => {
          const newMap = [...store.state.map];

          // Convert back to OPEN tile
          newMap[tileIdx] = {
            ...newMap[tileIdx],
            type: "OPEN",
          };

          return {
            ...store,
            state: {
              ...store.state,
              map: newMap,
            },
          };
        });
      },

      clearMap: () => {
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            map: generateStandard6pMap(),
          },
        }));
      },

      setMap: (map: Map) => {
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            map,
          },
        }));
      },

      setGameSets: (gameSets: GameSet[]) => {
        set((store) => {
          const newSystemPool = getSystemPool(gameSets);
          const poolSet = new Set(newSystemPool);

          // Remove systems from map that are no longer in the pool
          // NEVER remove Mecatol Rex (system 18) from index 0
          const newMap = store.state.map.map((tile, idx) => {
            if (
              tile.type === "SYSTEM" &&
              !poolSet.has(tile.systemId) &&
              !(idx === 0 && tile.systemId === "18")
            ) {
              return {
                ...tile,
                type: "OPEN" as const,
              };
            }
            return tile;
          });

          return {
            ...store,
            state: {
              ...store.state,
              gameSets,
              systemPool: newSystemPool,
              map: newMap,
            },
            systemPool: newSystemPool,
          };
        });
      },

      openPlanetFinderForMap: (tileIdx: number) => {
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            planetFinderModal: { mode: "map", tileIdx },
          },
          planetFinderModal: { mode: "map", tileIdx },
        }));
      },

      closePlanetFinder: () => {
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            planetFinderModal: null,
          },
          planetFinderModal: null,
        }));
      },

      selectSystemForPlanetFinder: (systemId: SystemId) => {
        const store = get();

        if (store.state.planetFinderModal?.tileIdx !== undefined) {
          store.actions.addSystemToMap(
            store.state.planetFinderModal.tileIdx,
            systemId,
          );
        }

        store.actions.closePlanetFinder();
      },
    },
  };
});
