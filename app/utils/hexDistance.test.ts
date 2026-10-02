import { describe, expect, it } from "vitest";
import { Map, SystemId } from "~/types";
import { mapStringOrder } from "~/data/mapStringOrder";
import { getAdjacentPositions } from "~/draft/common/sliceGenerator";
import { areSystemsCompatibleAdjacent } from "~/mapgen/utils/mapLegality";
import { generateHexRings, hexDistance } from "./hexCoordinates";
import { buildHexGraph, getAllNeighbors } from "./hexDistance";
import { getPlaceableTileIndices } from "./texasMapBuild";

const sorted = (xs: number[]) => [...xs].sort((a, b) => a - b);

function buildMap(rings: number, systems: Record<number, SystemId> = {}): Map {
  return generateHexRings(rings).map(({ x, y }, idx) => {
    const systemId = idx === 0 ? "18" : systems[idx];
    if (systemId) {
      return { idx, position: { x, y }, type: "SYSTEM", systemId };
    }
    return { idx, position: { x, y }, type: "OPEN" };
  });
}

describe("hex neighbors", () => {
  it("matches brute-force distance-1 neighbors on the standard grid", () => {
    mapStringOrder.forEach((coord, idx) => {
      const expected = mapStringOrder
        .map((other, otherIdx) => ({ other, otherIdx }))
        .filter(({ other }) => hexDistance(coord, other) === 1)
        .map(({ otherIdx }) => otherIdx);

      expect(sorted(getAdjacentPositions(idx))).toEqual(sorted(expected));
    });
  });

  it("agrees between map tiles and map string indices", () => {
    const map = buildMap(3);
    expect(sorted(getAllNeighbors(map, 0))).toEqual([1, 2, 3, 4, 5, 6]);
    map.forEach((_, idx) => {
      expect(sorted(getAllNeighbors(map, idx))).toEqual(
        sorted(getAdjacentPositions(idx).filter((n) => n < map.length)),
      );
    });
  });

  it("returns no neighbors for an unknown index", () => {
    expect(getAdjacentPositions(999)).toEqual([]);
  });
});

describe("buildHexGraph exclusions", () => {
  const systems = Object.fromEntries(
    Array.from({ length: 36 }, (_, i) => [i + 1, "19"]),
  );
  const map = buildMap(3, systems);
  const excluded = new Set([1, 8]);

  it("removes every edge touching an excluded tile", () => {
    const graph = buildHexGraph(map, { excludedIndices: excluded });
    for (const idx of excluded) {
      expect(graph.edges.get(idx)?.size).toBe(0);
    }
    for (const neighbors of graph.edges.values()) {
      for (const idx of excluded) expect(neighbors.has(idx)).toBe(false);
    }
    expect(graph.edges.get(0)?.size).toBe(5);
  });
});

describe("adjacency legality", () => {
  it("applies anomaly and wormhole rules, optionally waived", () => {
    expect(areSystemsCompatibleAdjacent("41", "42")).toBe(false);
    expect(areSystemsCompatibleAdjacent("26", "39")).toBe(false);
    expect(areSystemsCompatibleAdjacent("26", "40")).toBe(true);
    expect(
      areSystemsCompatibleAdjacent("41", "42", {
        anomalies: false,
        wormholes: "all",
      }),
    ).toBe(true);
    expect(
      areSystemsCompatibleAdjacent("26", "39", {
        anomalies: true,
        wormholes: ["BETA"],
      }),
    ).toBe(true);
  });

  it("texas placement avoids anomalies only when the player has another option", () => {
    const map = buildMap(3, { 1: "41" });
    const ringOneOpen = [2, 3, 4, 5, 6];
    const nextToAnomaly = getAllNeighbors(map, 1);

    expect(getPlaceableTileIndices(map, ["42"], "42")).toEqual(ringOneOpen);
    expect(getPlaceableTileIndices(map, ["42", "19"], "42")).toEqual(
      ringOneOpen.filter((idx) => !nextToAnomaly.includes(idx)),
    );
  });

  it("texas placement avoids matching wormholes only when the player has another option", () => {
    const map = buildMap(3, { 1: "26" });
    const ringOneOpen = [2, 3, 4, 5, 6];
    const nextToWormhole = getAllNeighbors(map, 1);

    expect(getPlaceableTileIndices(map, ["39"], "39")).toEqual(ringOneOpen);
    expect(getPlaceableTileIndices(map, ["39", "19"], "39")).toEqual(
      ringOneOpen.filter((idx) => !nextToWormhole.includes(idx)),
    );
    expect(getPlaceableTileIndices(map, ["40", "19"], "40")).toEqual(
      ringOneOpen,
    );
  });
});
