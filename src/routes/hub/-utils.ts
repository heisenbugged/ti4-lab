import { draftConfig } from "~/draft";
import { MAPS } from "~/routes/draft/prechoice/-maps";
import { calculateSliceValue, draftSliceValueConfig } from "~/stats";
import type { DraftType, Slice, TechSpecialty, Wormhole } from "~/types";
import { optimalStatsForSystems, techSpecialtiesForSystems } from "~/utils/map";
import { systemsInSlice } from "~/utils/slice";
import type { HubDraft, HubRecordDraft, HubSliceSet } from "~/server/hub.functions";

/** SQLite CURRENT_TIMESTAMP is UTC without a zone marker. */
export function parseDbDate(value: string) {
  return new Date(value.includes("T") ? value : `${value.replace(" ", "T")}Z`);
}

const dayFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric" });
const dayYearFormat = new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" });
const monthYearFormat = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" });

export function formatDay(value: string) {
  const date = parseDbDate(value);
  return date.getFullYear() === new Date().getFullYear()
    ? dayFormat.format(date)
    : dayYearFormat.format(date);
}

export function formatMonthYear(value: string) {
  return monthYearFormat.format(parseDbDate(value));
}

export function formatName(settings: { type?: string | null; draftGameMode?: string | null }) {
  if (settings.draftGameMode === "presetMap") return "Preset map";
  if (settings.draftGameMode === "twilightsFall") return "Twilight's Fall";
  if (settings.draftGameMode === "texasStyle") return "Texas style";
  const type = settings.type as DraftType | undefined;
  return (type && MAPS[type]?.title) ?? type ?? "Draft";
}

export function draftFormatName(draft: HubDraft) {
  return formatName({ type: draft.type, draftGameMode: draft.mode });
}

const PHASES: Record<string, string> = {
  ban: "Banning factions",
  priorityValue: "Choosing priority",
  homeSystem: "Choosing home systems",
  texasFaction: "Choosing factions",
  texasBlueKeep1: "Keeping tiles",
  texasBlueKeep2: "Keeping tiles",
  texasRedKeep: "Keeping tiles",
  texasMapBuild: "Building the map",
  standardPick: "Picking",
};

export function draftStatus(draft: HubRecordDraft) {
  if (draft.isComplete) return "Finished";
  if (draft.picks === 0) return "Not started";
  return PHASES[draft.phase ?? ""] ?? "In progress";
}

export function draftProgress(draft: HubRecordDraft) {
  if (draft.isComplete) return 1;
  return draft.totalPicks > 0 ? draft.picks / draft.totalPicks : 0;
}

export function draftTitle(draft: Pick<HubDraft, "label" | "urlName">) {
  return draft.label || draft.urlName;
}

export const SOURCE_LABEL: Record<string, string> = {
  created: "Made here",
  discord: "Started in Discord",
  imported: "Imported",
};

export type SliceSummary = {
  slice: Slice;
  value: number;
  r: number;
  i: number;
  f: number;
  techs: TechSpecialty[];
  legendaries: number;
  wormholes: Wormhole[];
  anomalies: number;
};

export function summarizeSlices(set: HubSliceSet): SliceSummary[] {
  const type = set.data.settings.type as DraftType;
  const config = draftConfig[type];
  const valueConfig = config
    ? draftSliceValueConfig(config, set.data.settings.sliceGenerationConfig?.sliceValueModifiers)
    : undefined;
  return set.data.slices.map((slice) => {
    const systems = systemsInSlice(slice);
    const optimal = optimalStatsForSystems(systems);
    return {
      slice,
      value: calculateSliceValue(systems, valueConfig),
      r: optimal.resources,
      i: optimal.influence,
      f: optimal.flex,
      techs: techSpecialtiesForSystems(systems),
      legendaries: systems.filter((s) => s.planets.some((p) => p.legendary)).length,
      wormholes: systems.flatMap((s) => s.wormholes),
      anomalies: systems.filter((s) => s.anomalies.length > 0).length,
    };
  });
}

export type SliceSetStats = {
  slices: SliceSummary[];
  average: number;
  min: number;
  max: number;
  r: number;
  i: number;
  f: number;
  legendaries: number;
  anomalies: number;
  /** Tech skips by colour, in the shape the map badges use. */
  techSkips: { G: number; R: number; B: number; Y: number };
  wormholes: Partial<Record<Wormhole, number>>;
};

const TECH_KEY: Record<TechSpecialty, "G" | "R" | "B" | "Y"> = {
  BIOTIC: "G",
  WARFARE: "R",
  PROPULSION: "B",
  CYBERNETIC: "Y",
};

/** Totals across the set, with slices ordered strongest first. */
export function sliceSetStats(set: HubSliceSet): SliceSetStats {
  const slices = summarizeSlices(set).sort((a, b) => b.value - a.value);
  const values = slices.map((s) => s.value);
  const techSkips = { G: 0, R: 0, B: 0, Y: 0 };
  const wormholes: Partial<Record<Wormhole, number>> = {};
  for (const s of slices) {
    for (const tech of s.techs) techSkips[TECH_KEY[tech]]++;
    for (const w of s.wormholes) wormholes[w] = (wormholes[w] ?? 0) + 1;
  }
  const sum = (pick: (s: SliceSummary) => number) => slices.reduce((total, s) => total + pick(s), 0);
  return {
    slices,
    average: values.length ? sum((s) => s.value) / values.length : 0,
    min: values.length ? Math.min(...values) : 0,
    max: values.length ? Math.max(...values) : 0,
    r: sum((s) => s.r),
    i: sum((s) => s.i),
    f: sum((s) => s.f),
    legendaries: sum((s) => s.legendaries),
    anomalies: sum((s) => s.anomalies),
    techSkips,
    wormholes,
  };
}

export function formatValue(value: number) {
  return value % 1 === 0 ? String(value) : value.toFixed(1);
}

