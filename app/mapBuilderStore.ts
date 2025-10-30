import { create } from "zustand";
import { FactionId, GameSet, Map, SystemId } from "~/types";
import { systemData } from "~/data/systemData";
import { getSystemPool } from "~/utils/system";
import {
  mapConfigs,
  defaultMapConfigId,
  generateMapFromConfig,
} from "~/mapgen/mapConfigs";

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
  mapConfigId: string;
};

type MapBuilderActions = {
  addSystemToMap: (tileIdx: number, systemId: SystemId) => void;
  removeSystemFromMap: (tileIdx: number) => void;
  clearMap: () => void;
  setMap: (map: Map) => void;
  setGameSets: (gameSets: GameSet[]) => void;
  setMapConfig: (configId: string) => void;
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
  const initialMapConfigId = defaultMapConfigId;
  const initialMap = generateMapFromConfig(mapConfigs[initialMapConfigId]);

  return {
    state: {
      map: initialMap,
      planetFinderModal: null,
      systemPool,
      gameSets: initialGameSets,
      factionPool: [],
      allowHomePlanetSearch: false,
      mapConfigId: initialMapConfigId,
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

          const config = mapConfigs[store.state.mapConfigId];
          const presetTileIndices = new Set(
            Object.keys(config.presetTiles).map(Number),
          );

          // Remove any existing instance of this system from the map
          // BUT preserve preset tiles (hyperlanes)
          for (let i = 0; i < newMap.length; i++) {
            const tile = newMap[i];
            if (
              tile.type === "SYSTEM" &&
              tile.systemId === systemId &&
              !presetTileIndices.has(i) &&
              i !== 0 // Never remove Mecatol Rex
            ) {
              newMap[i] = {
                ...tile,
                type: "OPEN",
              };
            }
          }

          // Don't add to preset tile positions
          if (presetTileIndices.has(tileIdx)) {
            return store;
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
          const config = mapConfigs[store.state.mapConfigId];
          const presetTileIndices = new Set(
            Object.keys(config.presetTiles).map(Number),
          );

          // Don't remove preset tiles (hyperlanes) or Mecatol Rex
          if (presetTileIndices.has(tileIdx) || tileIdx === 0) {
            return store;
          }

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
        set((store) => {
          const config = mapConfigs[store.state.mapConfigId];
          const newMap = generateMapFromConfig(config);
          return {
            ...store,
            state: {
              ...store.state,
              map: newMap,
            },
          };
        });
      },

      setMapConfig: (configId: string) => {
        set((store) => {
          const config = mapConfigs[configId];
          if (!config) return store;

          const newMap = generateMapFromConfig(config);
          return {
            ...store,
            state: {
              ...store.state,
              mapConfigId: configId,
              map: newMap,
            },
          };
        });
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
          const config = mapConfigs[store.state.mapConfigId];
          const presetTileIndices = new Set(
            Object.keys(config.presetTiles).map(Number),
          );

          // Remove systems from map that are no longer in the pool
          // NEVER remove Mecatol Rex (system 18) from index 0
          // NEVER remove preset tiles (hyperlanes)
          const newMap = store.state.map.map((tile, idx) => {
            if (
              tile.type === "SYSTEM" &&
              !poolSet.has(tile.systemId) &&
              !(idx === 0 && tile.systemId === "18") &&
              !presetTileIndices.has(idx)
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
