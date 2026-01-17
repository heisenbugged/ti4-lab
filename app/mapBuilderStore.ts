import { create } from "zustand";
import { FactionId, GameSet, Map, SystemId, HomeTile, OpenTile, SystemTile } from "~/types";
import { systemData } from "~/data/systemData";
import { getSystemPool } from "~/utils/system";
import {
  mapConfigs,
  defaultMapConfigId,
  generateMapFromConfig,
} from "~/mapgen/mapConfigs";
import {
  generateHexRings,
  getTileCount,
  getRingForIndex,
  getRingIndices,
  findClosestOnRing,
  findAvailableOnRing,
} from "~/utils/hexCoordinates";

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
  ringCount: number;
  hoveredHomeIdx: number | null;
  closeTileMode: boolean;
  closedTiles: number[];
};

type MapBuilderActions = {
  addSystemToMap: (tileIdx: number, systemId: SystemId, rotation?: number) => void;
  removeSystemFromMap: (tileIdx: number) => void;
  swapTiles: (originIdx: number, destIdx: number) => void;
  clearMap: () => void;
  setMap: (map: Map) => void;
  setGameSets: (gameSets: GameSet[]) => void;
  setMapConfig: (configId: string) => void;
  setRingCount: (count: number) => void;
  setHoveredHomeIdx: (idx: number | null) => void;
  openPlanetFinderForMap: (tileIdx: number) => void;
  closePlanetFinder: () => void;
  selectSystemForPlanetFinder: (systemId: SystemId) => void;
  toggleCloseTileMode: () => void;
  toggleTileClosed: (idx: number) => void;
  addHomeSystem: () => void;
  removeHomeSystem: () => void;
  loadDecodedMap: (map: Map, ringCount: number, gameSets: GameSet[], closedTiles: number[]) => void;
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
  const initialGameSets: GameSet[] = ["base", "pok", "te"];
  const systemPool = getSystemPool(initialGameSets);
  const initialMapConfigId = defaultMapConfigId;
  const initialMap = generateMapFromConfig(mapConfigs[initialMapConfigId]);
  const initialRingCount = mapConfigs[initialMapConfigId].mapSize;

  return {
    state: {
      map: initialMap,
      planetFinderModal: null,
      systemPool,
      gameSets: initialGameSets,
      factionPool: [],
      allowHomePlanetSearch: false,
      mapConfigId: initialMapConfigId,
      ringCount: initialRingCount,
      hoveredHomeIdx: null,
      closeTileMode: false,
      closedTiles: [...mapConfigs[initialMapConfigId].closedMapTiles],
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
      addSystemToMap: (tileIdx: number, systemId: SystemId, rotation?: number) => {
        set((store) => {
          const newMap = [...store.state.map];
          const system = systemData[systemId];

          if (!system) return store;

          // Remove any existing instance of this system from the map
          for (let i = 0; i < newMap.length; i++) {
            const tile = newMap[i];
            if (
              tile.type === "SYSTEM" &&
              tile.systemId === systemId &&
              i !== 0 // Never remove Mecatol Rex
            ) {
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
            rotation: rotation,
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
          // Don't remove Mecatol Rex
          if (tileIdx === 0) {
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

      swapTiles: (originIdx: number, destIdx: number) => {
        set((store) => {
          // Protect Mecatol Rex (index 0)
          if (originIdx === 0 || destIdx === 0) {
            return store;
          }

          const newMap = [...store.state.map];
          const originTile = newMap[originIdx];
          const destTile = newMap[destIdx];

          // Swap tiles, preserving idx and position
          newMap[originIdx] = {
            ...destTile,
            idx: originIdx,
            position: originTile.position,
          };
          newMap[destIdx] = {
            ...originTile,
            idx: destIdx,
            position: destTile.position,
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
              ringCount: config.mapSize,
              closedTiles: [...config.closedMapTiles],
            },
          };
        });
      },

      setRingCount: (newRingCount: number) => {
        set((store) => {
          const currentRingCount = store.state.ringCount;
          if (newRingCount === currentRingCount) return store;
          if (newRingCount < 2 || newRingCount > 5) return store;

          const currentMap = store.state.map;
          const newTileCount = getTileCount(newRingCount);
          const coords = generateHexRings(newRingCount);

          if (newRingCount > currentRingCount) {
            // Expanding: add new OPEN tiles
            const newMap: Map = [...currentMap];
            for (let idx = currentMap.length; idx < newTileCount; idx++) {
              const openTile: OpenTile = {
                idx,
                type: "OPEN",
                position: coords[idx],
              };
              newMap.push(openTile);
            }
            const config = mapConfigs[store.state.mapConfigId];
            return {
              ...store,
              state: {
                ...store.state,
                ringCount: newRingCount,
                map: newMap,
                closedTiles: [...config.closedMapTiles],
              },
            };
          } else {
            // Shrinking: find displaced homes and snap them to new outer ring
            const newMap: Map = [];
            const displacedHomes: { seat: number; oldIdx: number }[] = [];

            // First pass: copy tiles within new bounds, collect displaced homes
            for (let idx = 0; idx < newTileCount; idx++) {
              const tile = currentMap[idx];
              newMap.push({
                ...tile,
                idx,
                position: coords[idx],
              });
            }

            // Find homes beyond new boundary
            for (let idx = newTileCount; idx < currentMap.length; idx++) {
              const tile = currentMap[idx];
              if (tile.type === "HOME" && tile.seat !== undefined) {
                displacedHomes.push({ seat: tile.seat, oldIdx: idx });
              }
            }

            // Snap displaced homes to new outer ring
            const occupiedIndices = new Set<number>();
            newMap.forEach((tile, idx) => {
              if (tile.type === "HOME" || tile.type === "SYSTEM") {
                occupiedIndices.add(idx);
              }
            });

            // Get old coordinates for finding closest positions
            const oldCoords = generateHexRings(currentRingCount);

            for (const { seat, oldIdx } of displacedHomes) {
              const oldCoord = oldCoords[oldIdx];
              const closestIdx = findClosestOnRing(oldCoord, newRingCount, coords);
              const availableIdx = findAvailableOnRing(closestIdx, newRingCount, occupiedIndices);

              if (availableIdx !== -1) {
                // Convert the target position to a HOME tile
                const homeTile: HomeTile = {
                  idx: availableIdx,
                  type: "HOME",
                  seat,
                  position: coords[availableIdx],
                };
                newMap[availableIdx] = homeTile;
                occupiedIndices.add(availableIdx);
              }
              // If no available position, the home is lost (shouldn't happen with reasonable ring counts)
            }

            const config = mapConfigs[store.state.mapConfigId];
            return {
              ...store,
              state: {
                ...store.state,
                ringCount: newRingCount,
                map: newMap,
                closedTiles: [...config.closedMapTiles],
              },
            };
          }
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

      setHoveredHomeIdx: (idx: number | null) => {
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            hoveredHomeIdx: idx,
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

      toggleCloseTileMode: () => {
        set((store) => ({
          ...store,
          state: {
            ...store.state,
            closeTileMode: !store.state.closeTileMode,
          },
        }));
      },

      toggleTileClosed: (idx: number) => {
        set((store) => {
          // Cannot close Mecatol Rex (idx 0)
          if (idx === 0) return store;

          // Cannot close HOME tiles
          const tile = store.state.map[idx];
          if (tile.type === "HOME") return store;

          const isCurrentlyClosed = store.state.closedTiles.includes(idx);

          if (isCurrentlyClosed) {
            // Reopen the tile - remove from closedTiles
            return {
              ...store,
              state: {
                ...store.state,
                closedTiles: store.state.closedTiles.filter((i) => i !== idx),
              },
            };
          } else {
            // Close the tile
            let newMap = store.state.map;

            // If it's a SYSTEM tile, convert to OPEN (system returns to pool automatically)
            if (tile.type === "SYSTEM") {
              newMap = [...store.state.map];
              newMap[idx] = {
                ...newMap[idx],
                type: "OPEN",
              };
            }

            return {
              ...store,
              state: {
                ...store.state,
                map: newMap,
                closedTiles: [...store.state.closedTiles, idx],
              },
            };
          }
        });
      },

      addHomeSystem: () => {
        set((store) => {
          const currentMap = store.state.map;
          const ringCount = store.state.ringCount;
          const closedTiles = store.state.closedTiles;

          // Find current home systems and get next seat number
          const homeTiles = currentMap.filter((tile) => tile.type === "HOME") as HomeTile[];
          const nextSeat = homeTiles.length;

          // Find candidate tiles to convert to home (prioritize OPEN, then SYSTEM)
          // Prefer tiles on the outer ring
          const outerRingIndices = getRingIndices(ringCount);

          // First, try to find an OPEN tile on the outer ring
          let targetIdx = -1;
          const outerOpenTiles = outerRingIndices.filter(
            (idx) =>
              currentMap[idx].type === "OPEN" &&
              !closedTiles.includes(idx)
          );

          if (outerOpenTiles.length > 0) {
            targetIdx = outerOpenTiles[Math.floor(Math.random() * outerOpenTiles.length)];
          } else {
            // Try any OPEN tile (excluding Mecatol Rex and closed tiles)
            const allOpenTiles = currentMap
              .map((tile, idx) => ({ tile, idx }))
              .filter(
                ({ tile, idx }) =>
                  tile.type === "OPEN" &&
                  idx !== 0 &&
                  !closedTiles.includes(idx)
              )
              .map(({ idx }) => idx);

            if (allOpenTiles.length > 0) {
              targetIdx = allOpenTiles[Math.floor(Math.random() * allOpenTiles.length)];
            } else {
              // Last resort: pick a random SYSTEM tile on outer ring (not Mecatol)
              const outerSystemTiles = outerRingIndices.filter(
                (idx) =>
                  currentMap[idx].type === "SYSTEM" &&
                  idx !== 0 &&
                  !closedTiles.includes(idx) &&
                  (currentMap[idx] as SystemTile).systemId !== "18"
              );

              if (outerSystemTiles.length > 0) {
                targetIdx = outerSystemTiles[Math.floor(Math.random() * outerSystemTiles.length)];
              } else {
                // Try any SYSTEM tile
                const allSystemTiles = currentMap
                  .map((tile, idx) => ({ tile, idx }))
                  .filter(
                    ({ tile, idx }) =>
                      tile.type === "SYSTEM" &&
                      idx !== 0 &&
                      !closedTiles.includes(idx) &&
                      (tile as SystemTile).systemId !== "18"
                  )
                  .map(({ idx }) => idx);

                if (allSystemTiles.length > 0) {
                  targetIdx = allSystemTiles[Math.floor(Math.random() * allSystemTiles.length)];
                }
              }
            }
          }

          if (targetIdx === -1) {
            // No available tile to convert
            return store;
          }

          const newMap = [...currentMap];
          const targetTile = newMap[targetIdx];

          const homeTile: HomeTile = {
            idx: targetIdx,
            type: "HOME",
            seat: nextSeat,
            position: targetTile.position,
          };
          newMap[targetIdx] = homeTile;

          return {
            ...store,
            state: {
              ...store.state,
              map: newMap,
            },
          };
        });
      },

      removeHomeSystem: () => {
        set((store) => {
          const currentMap = store.state.map;

          // Find home systems
          const homeTiles = currentMap
            .map((tile, idx) => ({ tile, idx }))
            .filter(({ tile }) => tile.type === "HOME") as { tile: HomeTile; idx: number }[];

          if (homeTiles.length <= 1) {
            // Don't remove if only 1 or 0 homes remain
            return store;
          }

          // Find the home with the highest seat number
          const homeToRemove = homeTiles.reduce((max, current) =>
            (current.tile.seat ?? 0) > (max.tile.seat ?? 0) ? current : max
          );

          const newMap = [...currentMap];
          const openTile: OpenTile = {
            idx: homeToRemove.idx,
            type: "OPEN",
            position: homeToRemove.tile.position,
          };
          newMap[homeToRemove.idx] = openTile;

          return {
            ...store,
            state: {
              ...store.state,
              map: newMap,
            },
          };
        });
      },

      loadDecodedMap: (map: Map, ringCount: number, gameSets: GameSet[], closedTiles: number[]) => {
        set((store) => {
          const newSystemPool = getSystemPool(gameSets);
          return {
            ...store,
            state: {
              ...store.state,
              map,
              ringCount,
              gameSets,
              closedTiles,
              systemPool: newSystemPool,
              // Reset to default mapConfigId since we're loading a custom map
              mapConfigId: defaultMapConfigId,
            },
            systemPool: newSystemPool,
          };
        });
      },
    },
  };
});
