import { systemData } from "~/data/systemData";
import type {
  GameSet,
  HomeTile,
  Map,
  SystemId,
  SystemTile,
  TilePosition,
} from "~/types";
import { generateHexRings } from "~/utils/hexCoordinates";
import { inferGameSetsFromTiles } from "./mapStringCodec";

export type ExternalMapStringFormat = "ttpg" | "async";

export type DecodedExternalMapData = {
  map: Map;
  ringCount: number;
  gameSets: GameSet[];
};

type EncodeOptions = {
  homeSystemId?: (tile: HomeTile) => SystemId | "0" | undefined;
};

type DecodedSystemTile = {
  systemId: SystemId;
  rotation?: number;
};

type ExternalCodec = {
  encodeSystemTile: (tile: SystemTile) => string;
  decodeSystemTile: (value: string) => DecodedSystemTile | null;
};

function deriveRingCount(encodedLength: number): number {
  const k = encodedLength / 3;
  return Math.round((-1 + Math.sqrt(1 + 4 * k)) / 2);
}

function encode(
  map: Map,
  codec: ExternalCodec,
  options: EncodeOptions = {},
): string {
  return map
    .slice(1)
    .map((tile) => {
      if (tile.type === "HOME") return options.homeSystemId?.(tile) ?? "0";
      if (tile.type === "SYSTEM") return codec.encodeSystemTile(tile);
      return "-1";
    })
    .join(" ");
}

function decode(
  mapString: string,
  codec: ExternalCodec,
): DecodedExternalMapData | null {
  if (!mapString.trim()) return null;

  const parts = mapString.trim().split(/[,\s]+/).filter(Boolean);
  const ringCount = deriveRingCount(parts.length);
  if (ringCount < 2 || ringCount > 5) return null;

  const coords = generateHexRings(ringCount);
  const map: Map = [systemTile(0, coords[0], "18")];
  const systemIds: SystemId[] = [];
  let nextSeat = 0;

  for (let i = 0; i < parts.length && i + 1 < coords.length; i++) {
    const idx = i + 1;
    const value = parts[i];

    if (value === "0") {
      map.push(homeTile(idx, coords[idx], nextSeat));
      nextSeat++;
      continue;
    }
    if (value === "-1") {
      map.push(openTile(idx, coords[idx]));
      continue;
    }

    const decoded = codec.decodeSystemTile(value);
    if (!decoded) return null;
    map.push(systemTile(idx, coords[idx], decoded.systemId, decoded.rotation));
    systemIds.push(decoded.systemId);
  }

  while (map.length < coords.length) {
    map.push(openTile(map.length, coords[map.length]));
  }

  return {
    map,
    ringCount,
    gameSets: inferGameSetsFromTiles(systemIds),
  };
}

function systemTile(
  idx: number,
  position: TilePosition,
  systemId: SystemId,
  rotation?: number,
): SystemTile {
  return { idx, type: "SYSTEM", systemId, position, rotation };
}

function homeTile(idx: number, position: TilePosition, seat: number): HomeTile {
  return { idx, type: "HOME", seat, position };
}

function openTile(idx: number, position: TilePosition) {
  return { idx, type: "OPEN" as const, position };
}

const ttpgCodec: ExternalCodec = {
  encodeSystemTile: (tile) => {
    const match = tile.systemId.match(/^(\d+)([AB])$/i);
    if (!match) return tile.systemId;

    const [, tileNumber, side] = match;
    const rotationStep = Math.round((tile.rotation ?? 0) / 60) % 6;
    if (side.toUpperCase() === "A" && rotationStep === 0) return tileNumber;
    return `${tileNumber}${side.toUpperCase()}${rotationStep}`;
  },
  decodeSystemTile: (value) => {
    const match = value.match(/^(\d+)([AB]?)([0-5]?)$/i);
    if (!match) return null;

    const [, tileNumber, side, rotationStep] = match;
    const systemId = (
      side
        ? `${tileNumber}${side.toUpperCase()}`
        : systemData[tileNumber]
          ? tileNumber
          : `${tileNumber}A`
    ) as SystemId;
    if (!systemData[systemId]) return null;

    return {
      systemId,
      rotation: rotationStep ? Number(rotationStep) * 60 : undefined,
    };
  },
};

const asyncCodec: ExternalCodec = {
  encodeSystemTile: (tile) => {
    if (!/[AB]$/i.test(tile.systemId) || !tile.rotation) return tile.systemId;
    return `${tile.systemId}${tile.rotation}`;
  },
  decodeSystemTile: (value) => {
    const normalizedValue = value.toUpperCase();
    if (systemData[normalizedValue]) return { systemId: normalizedValue };

    const match = normalizedValue.match(/^(\d+[AB])(60|120|180|240|300)$/);
    if (!match || !systemData[match[1]]) return null;
    return { systemId: match[1], rotation: Number(match[2]) };
  },
};

export const encodeTtpgMapString = (map: Map, options?: EncodeOptions) =>
  encode(map, ttpgCodec, options);

export const decodeTtpgMapString = (mapString: string) =>
  decode(mapString, ttpgCodec);

export const encodeAsyncMapString = (map: Map, options?: EncodeOptions) =>
  encode(map, asyncCodec, options);

export const decodeAsyncMapString = (mapString: string) =>
  decode(mapString, asyncCodec);
