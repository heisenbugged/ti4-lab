import {
  Map,
  Tile,
  SystemTile,
  HomeTile,
  OpenTile,
  ClosedTile,
  SystemId,
  GameSet,
  TilePosition,
} from "~/types";
import { systemData } from "~/data/systemData";
import { generateHexRings } from "~/utils/hexCoordinates";

/**
 * Encoding rules for map string format:
 * - SYSTEM tiles: `{systemId}` or `{systemId}:{rotation}` (rotation only when non-zero)
 * - HOME tiles: `H{seat}`
 * - OPEN tiles: `_`
 * - CLOSED tiles: `X`
 * - Separator: `,`
 * - Mecatol Rex (index 0) is always implied and omitted from the string
 */

const VALID_ROTATIONS = [60, 120, 180, 240, 300];

/**
 * Encodes a single tile to its string representation.
 */
function encodeTile(tile: Tile): string {
  switch (tile.type) {
    case "SYSTEM": {
      const systemTile = tile as SystemTile;
      if (
        systemTile.rotation &&
        VALID_ROTATIONS.includes(systemTile.rotation)
      ) {
        return `${systemTile.systemId}:${systemTile.rotation}`;
      }
      return systemTile.systemId;
    }
    case "HOME": {
      const homeTile = tile as HomeTile;
      return `H${homeTile.seat ?? 0}`;
    }
    case "OPEN":
      return "_";
    case "CLOSED":
      return "X";
    default:
      return "_";
  }
}

function systemTile(
  idx: number,
  position: TilePosition,
  systemId: SystemId,
  rotation?: number,
): SystemTile {
  return { idx, type: "SYSTEM", systemId, position, rotation };
}

function openTile(idx: number, position: TilePosition): OpenTile {
  return { idx, type: "OPEN", position };
}

function homeTile(
  idx: number,
  position: TilePosition,
  seat?: number,
): HomeTile {
  return { idx, type: "HOME", seat, position };
}

function closedTile(idx: number, position: TilePosition): ClosedTile {
  return { idx, type: "CLOSED", position };
}

/**
 * Encodes a complete map to a string representation.
 * Mecatol Rex (index 0) is omitted as it's always implied.
 */
export function encodeMapString(map: Map): string {
  // Skip index 0 (Mecatol Rex is implied)
  return map
    .slice(1)
    .map((tile) => encodeTile(tile))
    .join(",");
}

/**
 * Result of decoding a map string.
 */
export type DecodedMapData = {
  map: Map;
  ringCount: number;
  gameSets: GameSet[];
  closedTiles: number[];
};

/**
 * Derives the ring count from the number of encoded values.
 * Formula: ringCount = (-1 + sqrt(1 + 4*length/3)) / 2
 *
 * | Rings | Total Tiles | Encoded Values |
 * |-------|-------------|----------------|
 * | 2     | 19          | 18             |
 * | 3     | 37          | 36             |
 * | 4     | 61          | 60             |
 * | 5     | 91          | 90             |
 */
function deriveRingCount(encodedLength: number): number {
  const k = encodedLength / 3;
  const n = (-1 + Math.sqrt(1 + 4 * k)) / 2;
  return Math.round(n);
}

/**
 * Normalizes a rotation value to the nearest valid rotation (60, 120, 180, 240, 300).
 */
function normalizeRotation(rotation: number): number {
  if (VALID_ROTATIONS.includes(rotation)) {
    return rotation;
  }

  return VALID_ROTATIONS.reduce((prev, curr) =>
    Math.abs(curr - rotation) < Math.abs(prev - rotation) ? curr : prev,
  );
}

/**
 * Decodes a single tile string to tile data.
 * Returns partial tile data (type and relevant properties) without position info.
 */
function decodeTile(
  tileStr: string,
  idx: number,
): {
  type: Tile["type"];
  systemId?: SystemId;
  rotation?: number;
  seat?: number;
} {
  const str = tileStr.trim();

  if (str === "_") {
    return { type: "OPEN" };
  }

  if (str === "X") {
    return { type: "CLOSED" };
  }

  if (str.startsWith("H")) {
    const seatStr = str.slice(1);
    const seat = parseInt(seatStr, 10);
    if (!isNaN(seat) && seat >= 0) {
      return { type: "HOME", seat };
    }
    // Invalid home format, treat as OPEN
    console.warn(`Invalid home tile format: "${str}" at index ${idx}`);
    return { type: "OPEN" };
  }

  const parts = str.split(":");
  const systemId = parts[0] as SystemId;

  if (!systemData[systemId]) {
    console.warn(
      `Invalid system ID: "${systemId}" at index ${idx}, treating as OPEN`,
    );
    return { type: "OPEN" };
  }

  let rotation: number | undefined;
  if (parts.length > 1) {
    const parsedRotation = parseInt(parts[1], 10);
    if (!isNaN(parsedRotation) && parsedRotation !== 0) {
      rotation = normalizeRotation(parsedRotation);
    }
  }

  return { type: "SYSTEM", systemId, rotation };
}

function decodeParts(parts: string[]) {
  const ringCount = deriveRingCount(parts.length);
  if (ringCount < 2 || ringCount > 5) {
    console.warn(`Invalid ring count derived: ${ringCount}`);
    return null;
  }

  const coords = generateHexRings(ringCount);
  const map: Map = [systemTile(0, coords[0], "18")];

  return { coords, map, ringCount };
}

function fillRemainingOpenTiles(map: Map, coords: TilePosition[]) {
  while (map.length < coords.length) {
    const idx = map.length;
    map.push(openTile(idx, coords[idx]));
  }
}

/**
 * Infers which game sets are used based on tile IDs.
 */
export function inferGameSetsFromTiles(systemIds: SystemId[]): GameSet[] {
  const sets: Set<GameSet> = new Set(["base"]); // Always include base

  systemIds.forEach((id) => {
    const numId = Number(id.replace(/[A-Z]/g, "")); // Strip letter suffix for hyperlanes
    if (numId >= 51 && numId <= 91) {
      sets.add("pok");
    } else if (numId >= 92 && numId <= 149) {
      sets.add("te");
    } else if (numId >= 150) {
      // Uncharted Stars (150+) including Discordant Stars (4000-4999)
      sets.add("unchartedstars");
    }
  });

  return Array.from(sets);
}

/**
 * Decodes a map string to complete map data.
 * Returns null if the string is malformed.
 */
export function decodeMapString(mapString: string): DecodedMapData | null {
  if (!mapString || typeof mapString !== "string") {
    return null;
  }

  const parts = mapString.split(",");
  const decodedParts = decodeParts(parts);
  if (!decodedParts) return null;

  const { coords, map, ringCount } = decodedParts;
  const closedTiles: number[] = [];
  const systemIds: SystemId[] = [];

  for (let i = 0; i < parts.length && i + 1 < coords.length; i++) {
    const idx = i + 1;
    const decoded = decodeTile(parts[i], idx);

    switch (decoded.type) {
      case "SYSTEM": {
        map.push(
          systemTile(idx, coords[idx], decoded.systemId!, decoded.rotation),
        );
        systemIds.push(decoded.systemId!);
        break;
      }
      case "HOME": {
        map.push(homeTile(idx, coords[idx], decoded.seat));
        break;
      }
      case "CLOSED": {
        map.push(closedTile(idx, coords[idx]));
        closedTiles.push(idx);
        break;
      }
      case "OPEN":
      default: {
        map.push(openTile(idx, coords[idx]));
        break;
      }
    }
  }

  fillRemainingOpenTiles(map, coords);

  return {
    map,
    ringCount,
    gameSets: inferGameSetsFromTiles(systemIds),
    closedTiles,
  };
}
