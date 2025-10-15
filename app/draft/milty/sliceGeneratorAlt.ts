import { FactionId, SystemId, SystemIds } from "~/types";
import { SLICE_SHAPES } from "../sliceShapes";
import { separateAnomalies } from "../helpers/sliceGeneration";
import { SliceGenerationConfig } from "../types";
import { systemData } from "~/data/systemData";
import { shuffle } from "../helpers/randomization";

const MAX_ATTEMPTS = 20000;
const MAX_DELTA = 25;

type ScoreBreakdown = {
  total: number;
  resources: number;
  influence: number;
  techSkips: number;
  planets: number;
  legendaries: number;
  nebulaPathPenalty: number;
  asteroidPathPenalty: number;
  supernovaPathPenalty: number;
  entropicScarBonus: number;
};

type SystemContribution = {
  resources: number;
  influence: number;
  techSkips: number;
  planets: number;
  legendaries: number;
  entropicScarBonus: number;
  nebulaPathPenalty: number;
  asteroidPathPenalty: number;
  supernovaPathPenalty: number;
};

function computeSystemContribution(
  systemId: SystemId,
  isOnPathToRex: boolean,
): SystemContribution {
  const sys = systemData[systemId];

  let resources = 0;
  let influence = 0;
  let techSkips = 0;
  let planets = 0;
  let legendaries = 0;
  let entropicScarBonus = 0;
  let nebulaPathPenalty = 0;
  let asteroidPathPenalty = 0;
  let supernovaPathPenalty = 0;

  for (const planet of sys.planets) {
    if (planet.resources > planet.influence) {
      resources += planet.resources;
    } else {
      influence += planet.influence;
    }
    planets += 1;
    if (planet.tech?.length) techSkips += planet.tech.length;
    if (planet.legendary) legendaries += 1;
  }

  if (sys.anomalies.includes("ENTROPIC_SCAR")) {
    entropicScarBonus += 20;
  }

  if (isOnPathToRex) {
    if (sys.anomalies.includes("NEBULA")) nebulaPathPenalty -= 10;
    if (sys.anomalies.includes("ASTEROID_FIELD")) asteroidPathPenalty -= 6;
    if (sys.anomalies.includes("SUPERNOVA")) supernovaPathPenalty -= 20;
  }

  return {
    resources,
    influence,
    techSkips,
    planets,
    legendaries,
    entropicScarBonus,
    nebulaPathPenalty,
    asteroidPathPenalty,
    supernovaPathPenalty,
  };
}

function scoreSlice(
  slice: SystemIds,
  mecatolPath: number[] | undefined,
  equidistantIndex: number = 3,
): ScoreBreakdown {
  let resources = 0;
  let influence = 0;
  let techSkips = 0;
  let planets = 0;
  let legendaries = 0;
  let nebulaPathPenalty = 0;
  let asteroidPathPenalty = 0;
  let supernovaPathPenalty = 0;
  let entropicScarBonus = 0;

  slice.forEach((systemId, idx) => {
    const isOnPathToRex = mecatolPath?.includes(idx) ?? false;
    const weight = idx === equidistantIndex ? 0.5 : 1;
    const c = computeSystemContribution(systemId, isOnPathToRex);

    resources += c.resources * weight;
    influence += c.influence * weight;
    techSkips += c.techSkips * weight;
    planets += c.planets * weight;
    legendaries += c.legendaries * weight;
    entropicScarBonus += c.entropicScarBonus * weight;
    nebulaPathPenalty += c.nebulaPathPenalty;
    asteroidPathPenalty += c.asteroidPathPenalty;
    supernovaPathPenalty += c.supernovaPathPenalty;
  });

  const total =
    resources * 10 +
    influence * 10 +
    techSkips * 3 +
    planets * 3 +
    legendaries * 5 +
    entropicScarBonus +
    nebulaPathPenalty +
    asteroidPathPenalty +
    supernovaPathPenalty;

  return {
    total,
    resources,
    influence,
    techSkips,
    planets,
    legendaries,
    nebulaPathPenalty,
    asteroidPathPenalty,
    supernovaPathPenalty,
    entropicScarBonus,
  };
}

function maxDelta(values: number[]): number {
  let min = Infinity;
  let max = -Infinity;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return max - min;
}

function averagePairwiseDelta(values: number[]): number {
  if (values.length < 2) return 0;
  let sum = 0;
  let count = 0;
  for (let i = 0; i < values.length; i++) {
    for (let j = i + 1; j < values.length; j++) {
      sum += Math.abs(values[i] - values[j]);
      count++;
    }
  }
  return count ? sum / count : 0;
}

export function generateSlices(
  sliceCount: number,
  availableSystems: SystemId[],
  _config: SliceGenerationConfig = {},
  sliceShape: string[] = SLICE_SHAPES.milty,
  _minorFactionPool?: FactionId[],
): SystemIds[] | undefined {
  const pool = availableSystems;
  const mecatolPath = [1, 4];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    // Build slices by shuffling once, then taking sequential 5-tile chunks
    const shuffledPool = shuffle([...pool]);
    if (shuffledPool.length < sliceCount * 5) continue;

    const slices: SystemIds[] = [];
    for (let s = 0; s < sliceCount; s++) {
      const start = s * 5;
      const end = start + 5;
      const slice = shuffledPool.slice(start, end);
      if (slice.length < 5) break;
      slices.push(slice);
    }

    if (slices.length !== sliceCount) continue;

    // Ensure anomalies are not together before scoring and path penalties
    for (let j = 0; j < slices.length; j++) {
      slices[j] = separateAnomalies(slices[j], sliceShape);
    }

    // Score and check deltas
    const breakdowns = slices.map((slice) => scoreSlice(slice, mecatolPath));
    const scores = breakdowns.map((b) => b.total);
    const delta = maxDelta(scores);
    const avg = averagePairwiseDelta(scores);

    // Meta validation: require a minimum of 12 RED tiles across ALL slices
    const redTilesTotal = slices.reduce((sum, slice) => {
      const redsInSlice = slice.reduce((acc, systemId) => {
        return acc + (systemData[systemId].type === "RED" ? 1 : 0);
      }, 0);
      return sum + redsInSlice;
    }, 0);
    const anomaliesValidationOk = redTilesTotal >= 12;

    if (delta <= MAX_DELTA && anomaliesValidationOk) {
      const sliceScores = breakdowns.map((b) => {
        return {
          resources: b.resources * 10,
          influence: b.influence * 10,
          techSkips: b.techSkips * 3,
          planets: b.planets * 3,
          legendaries: b.legendaries * 5,
          entropicScarBonus: b.entropicScarBonus,
          nebulaPathPenalty: b.nebulaPathPenalty,
          asteroidPathPenalty: b.asteroidPathPenalty,
          supernovaPathPenalty: b.supernovaPathPenalty,
          total: b.total,
        };
      });

      console.log("[sliceGeneratorAlt] attempts", i);
      console.log(
        "[sliceGeneratorAlt] scores:",
        JSON.stringify({
          scores,
          maxDelta: delta,
          avgDelta: Number(avg.toFixed(2)),
        }),
      );

      console.log(
        "[sliceGeneratorAlt] final breakdowns:",
        JSON.stringify(sliceScores, null, 2),
      );
      return slices;
    }
  }

  return undefined;
}

export default {
  generateSlices,
};
