import { Map, Tile, SystemTile, HomeTile, OpenTile, ClosedTile, SystemId, GameSet } from "~/types";
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
      if (systemTile.rotation && VALID_ROTATIONS.includes(systemTile.rotation)) {
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

/**
 * Encodes a complete map to a string representation.
 * Mecatol Rex (index 0) is omitted as it's always implied.
 */
export function encodeMapString(map: Map): string {
  // Skip index 0 (Mecatol Rex is implied)
  return map.slice(1).map(encodeTile).join(",");
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
  // Total tiles = 1 + 3*n*(n+1) where n = ring count
  // Solving for n: n = (-1 + sqrt(1 + 4*length/3)) / 2
  // But since encoded length excludes Mecatol Rex: totalTiles = encodedLength + 1
  const totalTiles = encodedLength + 1;
  // totalTiles = 1 + 3*n*(n+1)
  // 3*n*(n+1) = totalTiles - 1
  // n*(n+1) = (totalTiles - 1) / 3
  // n^2 + n - (totalTiles - 1)/3 = 0
  // Using quadratic formula: n = (-1 + sqrt(1 + 4*(totalTiles-1)/3)) / 2
  const k = (totalTiles - 1) / 3;
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
  // Find the closest valid rotation
  const closest = VALID_ROTATIONS.reduce((prev, curr) =>
    Math.abs(curr - rotation) < Math.abs(prev - rotation) ? curr : prev
  );
  return closest;
}

/**
 * Decodes a single tile string to tile data.
 * Returns partial tile data (type and relevant properties) without position info.
 */
function decodeTile(
  tileStr: string,
  idx: number
): { type: Tile["type"]; systemId?: SystemId; rotation?: number; seat?: number } | null {
  const str = tileStr.trim();

  // OPEN tile
  if (str === "_") {
    return { type: "OPEN" };
  }

  // CLOSED tile
  if (str === "X") {
    return { type: "CLOSED" };
  }

  // HOME tile: H{seat}
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

  // SYSTEM tile: {systemId} or {systemId}:{rotation}
  const parts = str.split(":");
  const systemId = parts[0] as SystemId;

  // Validate system ID exists
  if (!systemData[systemId]) {
    console.warn(`Invalid system ID: "${systemId}" at index ${idx}, treating as OPEN`);
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
  if (parts.length === 0) {
    return null;
  }

  // Derive ring count from encoded length
  const ringCount = deriveRingCount(parts.length);
  if (ringCount < 2 || ringCount > 5) {
    console.warn(`Invalid ring count derived: ${ringCount}`);
    return null;
  }

  // Generate coordinates for the ring count
  const coords = generateHexRings(ringCount);
  const totalTiles = coords.length;

  // Create the map array starting with Mecatol Rex at index 0
  const map: Map = [];
  const closedTiles: number[] = [];
  const systemIds: SystemId[] = [];

  // Index 0 is always Mecatol Rex
  const mecatolTile: SystemTile = {
    idx: 0,
    type: "SYSTEM",
    systemId: "18",
    position: coords[0],
  };
  map.push(mecatolTile);

  // Decode remaining tiles (parts correspond to indices 1+)
  for (let i = 0; i < parts.length && i + 1 < totalTiles; i++) {
    const idx = i + 1;
    const decoded = decodeTile(parts[i], idx);

    if (!decoded) {
      // Fallback to OPEN tile
      const openTile: OpenTile = {
        idx,
        type: "OPEN",
        position: coords[idx],
      };
      map.push(openTile);
      continue;
    }

    switch (decoded.type) {
      case "SYSTEM": {
        const systemTile: SystemTile = {
          idx,
          type: "SYSTEM",
          systemId: decoded.systemId!,
          position: coords[idx],
          rotation: decoded.rotation,
        };
        map.push(systemTile);
        systemIds.push(decoded.systemId!);
        break;
      }
      case "HOME": {
        const homeTile: HomeTile = {
          idx,
          type: "HOME",
          seat: decoded.seat,
          position: coords[idx],
        };
        map.push(homeTile);
        break;
      }
      case "CLOSED": {
        // Store as OPEN in map array but track in closedTiles
        const openTile: OpenTile = {
          idx,
          type: "OPEN",
          position: coords[idx],
        };
        map.push(openTile);
        closedTiles.push(idx);
        break;
      }
      case "OPEN":
      default: {
        const openTile: OpenTile = {
          idx,
          type: "OPEN",
          position: coords[idx],
        };
        map.push(openTile);
        break;
      }
    }
  }

  // Fill any remaining tiles as OPEN (in case string is shorter than expected)
  while (map.length < totalTiles) {
    const idx = map.length;
    const openTile: OpenTile = {
      idx,
      type: "OPEN",
      position: coords[idx],
    };
    map.push(openTile);
  }

  // Infer game sets from placed systems
  const gameSets = inferGameSetsFromTiles(systemIds);

  return {
    map,
    ringCount,
    gameSets,
    closedTiles,
  };
}
