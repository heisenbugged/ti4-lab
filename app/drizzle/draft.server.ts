import { desc, eq, sql, type SQL } from "drizzle-orm";
import { db } from "./config.server";
import { drafts, draftStagedSelections } from "./schema.server";
import { generatePrettyUrlName } from "~/data/urlWords.server";
import { Draft, SimultaneousPickType } from "~/types";
import { enqueueImageJob } from "~/utils/imageJobQueue.server";
import { recordPresetMapPlay } from "./presetMap.server";
import { v4 as uuidv4 } from "uuid";

export async function draftById(id: string) {
  const results = await db
    .select()
    .from(drafts)
    .where(eq(drafts.id, id))
    .limit(1);

  return results[0];
}

function stripEphemeralDraftFields(draft: Draft): Draft {
  const persistable = { ...draft };
  delete (persistable as { stagedSelections?: Draft["stagedSelections"] })
    .stagedSelections;
  return persistable;
}

type SavedDraft = {
  id: string;
  data?: Draft;
  urlName: string | null;
  type: string | null;
  isComplete: boolean | null;
  imageUrl: string | null;
  incompleteImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  mode: DraftMode;
  phase: DraftPhase;
  selectionsCount: number;
  pickOrderCount: number;
  progressPercent: number;
  playerCount: number;
  playerNames: string;
  playerNamesSearch: string | null;
};

export type DraftMode = "base" | "twilightsFall" | "texasStyle" | "presetMap";
export type DraftPhase =
  | "ban"
  | "priorityValue"
  | "homeSystem"
  | "texasFaction"
  | "texasBlueKeep1"
  | "texasBlueKeep2"
  | "texasRedKeep"
  | "texasMapBuild"
  | "standardPick"
  | "complete";

export type DraftStats = {
  allDrafts: number;
  scopedDrafts: number;
  filteredDrafts: number;
  completedDrafts: number;
  completionPercent: number;
  draftsByType: Record<string, number>;
  draftsByMode: Record<string, number>;
  draftsByPhase: Record<string, number>;
};

function normalizeDraftType(type: string | null): string {
  if (!type) return "unknown";

  // Normalize milty variants (milty5p, milty6p, milty8p, etc. -> milty)
  if (type.startsWith("milty") && !type.startsWith("miltyeq")) {
    return "milty";
  }

  // Normalize miltyeq variants (miltyeq5p, miltyeq7p, miltyeq8p -> miltyeq)
  if (type.startsWith("miltyeq")) {
    return "miltyeq";
  }

  return type;
}

export type PaginatedDrafts = {
  drafts: SavedDraft[];
  totalPages: number;
  currentPage: number;
  filteredTotal: number;
  stats: DraftStats;
};

type FindDraftsParams = {
  page?: number;
  pageSize?: number;
  sortBy?:
    | "createdAt"
    | "updatedAt"
    | "type"
    | "isComplete"
    | "mode"
    | "phase"
    | "progress"
    | "players";
  sortOrder?: "asc" | "desc";
  typeFilter?: string;
  modeFilter?: DraftMode;
  phaseFilter?: DraftPhase;
  isCompleteFilter?: boolean;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
  updatedAfter?: string;
  updatedBefore?: string;
  includeData?: boolean;
};

function buildTypeFilterCondition(typeFilter: string): SQL {
  if (typeFilter === "milty") {
    return sql`${drafts.type} like ${"milty%"} and ${drafts.type} not like ${"miltyeq%"}`;
  }
  if (typeFilter === "miltyeq") {
    return sql`${drafts.type} like ${"miltyeq%"}`;
  }
  if (typeFilter === "unknown") {
    return sql`${drafts.type} is null`;
  }

  return eq(drafts.type, typeFilter);
}

function deriveDraftMode(draft: Draft): DraftMode {
  return draft.settings.draftGameMode ?? "base";
}

function deriveDraftPhase(draft: Draft, isComplete: boolean): DraftPhase {
  if (isComplete) return "complete";

  const currentPickNumber = draft.selections?.length ?? 0;
  const banModifier = draft.settings.modifiers?.banFactions;
  const totalBansNeeded = (banModifier?.numFactions ?? 0) * draft.players.length;
  if (banModifier && currentPickNumber < totalBansNeeded) return "ban";

  const currentPick = draft.pickOrder?.[currentPickNumber];
  if (typeof currentPick === "object" && currentPick?.kind === "simultaneous") {
    return currentPick.phase;
  }

  if (deriveDraftMode(draft) === "texasStyle") return "texasMapBuild";
  return "standardPick";
}

export function deriveDraftMetadata(draft: Draft) {
  const selectionsCount = draft.selections?.length ?? 0;
  const pickOrderCount = draft.pickOrder?.length ?? 0;
  const isComplete = selectionsCount === pickOrderCount;
  const mode = deriveDraftMode(draft);
  const phase = deriveDraftPhase(draft, isComplete);
  const playerNames = draft.players?.map((p) => p.name).join(", ") ?? "";

  return {
    type: draft.settings?.type || null,
    isComplete,
    mode,
    phase,
    selectionsCount,
    pickOrderCount,
    progressPercent:
      pickOrderCount > 0 ? (100 * selectionsCount) / pickOrderCount : 0,
    playerCount: draft.players?.length ?? 0,
    playerNames,
    playerNamesSearch: playerNames.toLowerCase(),
  };
}

export async function findDrafts({
  page = 1,
  pageSize = 100,
  sortBy = "createdAt",
  sortOrder = "desc",
  typeFilter,
  modeFilter,
  phaseFilter,
  isCompleteFilter,
  search,
  createdAfter,
  createdBefore,
  updatedAfter,
  updatedBefore,
  includeData = false,
}: FindDraftsParams = {}): Promise<PaginatedDrafts> {
  const offset = (page - 1) * pageSize;
  const scopedConditions: SQL[] = [];
  const allConditions: SQL[] = [];

  if (typeFilter) {
    scopedConditions.push(buildTypeFilterCondition(typeFilter));
  }
  if (modeFilter) {
    scopedConditions.push(eq(drafts.mode, modeFilter));
  }
  if (search?.trim()) {
    const searchLike = `%${search.trim().toLowerCase()}%`;
    scopedConditions.push(
      sql`(
        lower(${drafts.id}) like ${searchLike}
        or lower(coalesce(${drafts.urlName}, '')) like ${searchLike}
        or lower(coalesce(${drafts.playerNamesSearch}, '')) like ${searchLike}
        or lower(cast(${drafts.data} as text)) like ${searchLike}
      )`,
    );
  }
  if (createdAfter) {
    scopedConditions.push(sql`${drafts.createdAt} >= ${createdAfter}`);
  }
  if (createdBefore) {
    scopedConditions.push(sql`${drafts.createdAt} <= ${createdBefore}`);
  }
  if (updatedAfter) {
    scopedConditions.push(sql`${drafts.updatedAt} >= ${updatedAfter}`);
  }
  if (updatedBefore) {
    scopedConditions.push(sql`${drafts.updatedAt} <= ${updatedBefore}`);
  }

  allConditions.push(...scopedConditions);
  if (isCompleteFilter !== undefined) {
    allConditions.push(eq(drafts.isComplete, isCompleteFilter));
  }
  if (phaseFilter) {
    allConditions.push(eq(drafts.phase, phaseFilter));
  }

  const orderColumn =
    sortBy === "createdAt"
      ? drafts.createdAt
      : sortBy === "updatedAt"
        ? drafts.updatedAt
        : sortBy === "type"
          ? drafts.type
          : sortBy === "mode"
            ? drafts.mode
            : sortBy === "phase"
              ? drafts.phase
              : sortBy === "progress"
                ? drafts.progressPercent
                : sortBy === "players"
                  ? drafts.playerCount
                  : drafts.isComplete;

  const orderFn = sortOrder === "asc" ? sql`${orderColumn} ASC` : desc(orderColumn);
  const selectDraftListFields = {
    id: drafts.id,
    urlName: drafts.urlName,
    type: drafts.type,
    isComplete: drafts.isComplete,
    imageUrl: drafts.imageUrl,
    incompleteImageUrl: drafts.incompleteImageUrl,
    createdAt: drafts.createdAt,
    updatedAt: drafts.updatedAt,
    mode: drafts.mode,
    phase: drafts.phase,
    selectionsCount: drafts.selectionsCount,
    pickOrderCount: drafts.pickOrderCount,
    progressPercent: drafts.progressPercent,
    playerCount: drafts.playerCount,
    playerNames: drafts.playerNames,
    playerNamesSearch: drafts.playerNamesSearch,
    data: includeData ? drafts.data : sql<null>`null`,
  };

  let query = db.select(selectDraftListFields).from(drafts);
  if (allConditions.length > 0) {
    query = query.where(sql`${sql.join(allConditions, sql` AND `)}`) as typeof query;
  }

  const resultsWhere =
    allConditions.length > 0
      ? sql`${sql.join(allConditions, sql` AND `)}`
      : sql`1=1`;
  const scopeWhere =
    scopedConditions.length > 0
      ? sql`${sql.join(scopedConditions, sql` AND `)}`
      : sql`1=1`;

  const [
    draftsData,
    filteredCount,
    scopedCount,
    allCount,
    completedCount,
    typeStats,
    modeStats,
    phaseStats,
  ] = await Promise.all([
    query.orderBy(orderFn).limit(pageSize).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(drafts).where(resultsWhere),
    db.select({ count: sql<number>`count(*)` }).from(drafts).where(scopeWhere),
    db.select({ count: sql<number>`count(*)` }).from(drafts),
    db
      .select({ count: sql<number>`count(*)` })
      .from(drafts)
      .where(sql`${scopeWhere} AND ${drafts.isComplete} = 1`),
    db
      .select({
        type: drafts.type,
        count: sql<number>`count(*)`,
      })
      .from(drafts)
      .where(scopeWhere)
      .groupBy(drafts.type),
    db
      .select({
        mode: drafts.mode,
        count: sql<number>`count(*)`,
      })
      .from(drafts)
      .where(scopeWhere)
      .groupBy(drafts.mode),
    db
      .select({
        phase: drafts.phase,
        count: sql<number>`count(*)`,
      })
      .from(drafts)
      .where(scopeWhere)
      .groupBy(drafts.phase),
  ]);

  const data = draftsData.map((draft) => ({
    ...draft,
    data: draft.data ? (JSON.parse(draft.data as string) as Draft) : undefined,
    mode: draft.mode as DraftMode,
    phase: draft.phase as DraftPhase,
    selectionsCount: draft.selectionsCount ?? 0,
    pickOrderCount: draft.pickOrderCount ?? 0,
    progressPercent: draft.progressPercent ?? 0,
    playerCount: draft.playerCount ?? 0,
    playerNames: draft.playerNames ?? "",
  }));

  const totalPages = Math.ceil(filteredCount[0].count / pageSize);
  const scopedDrafts = scopedCount[0].count;
  const allDrafts = allCount[0].count;
  const filteredDrafts = filteredCount[0].count;
  const completedDrafts = completedCount[0].count;

  const draftsByType: Record<string, number> = {};
  typeStats.forEach((stat) => {
    const normalizedType = normalizeDraftType(stat.type);
    draftsByType[normalizedType] = (draftsByType[normalizedType] || 0) + stat.count;
  });

  const draftsByMode: Record<string, number> = {};
  modeStats.forEach((stat) => {
    if (!stat.mode) return;
    draftsByMode[stat.mode] = (draftsByMode[stat.mode] || 0) + stat.count;
  });

  const draftsByPhase: Record<string, number> = {};
  phaseStats.forEach((stat) => {
    if (!stat.phase) return;
    draftsByPhase[stat.phase] = (draftsByPhase[stat.phase] || 0) + stat.count;
  });

  return {
    drafts: data,
    totalPages,
    currentPage: page,
    filteredTotal: filteredDrafts,
    stats: {
      allDrafts,
      scopedDrafts,
      filteredDrafts,
      completedDrafts,
      completionPercent:
        scopedDrafts > 0 ? (completedDrafts / scopedDrafts) * 100 : 0,
      draftsByType,
      draftsByMode,
      draftsByPhase,
    },
  };
}

export async function draftByPrettyUrl(urlName: string) {
  const results = await db
    .select()
    .from(drafts)
    .where(eq(drafts.urlName, urlName))
    .limit(1);

  return results[0];
}

export async function generateUniquePrettyUrl() {
  let exists = true;
  let prettyUrl = "";
  while (exists) {
    prettyUrl = generatePrettyUrlName();
    const existingRecord = await draftByPrettyUrl(prettyUrl);
    exists = !!existingRecord;
  }
  return prettyUrl;
}

export async function createDraft(draft: Draft, presetUrl?: string) {
  const id = uuidv4().toString();
  const prettyUrl = await getPrettyUrl(presetUrl);
  const metadata = deriveDraftMetadata(draft);

  db.insert(drafts)
    .values({
      id,
      urlName: prettyUrl,
      data: JSON.stringify(stripEphemeralDraftFields(draft)),
      ...metadata,
    })
    .run();

  // Enqueue incomplete image generation
  enqueueImageJob(id, prettyUrl, false);
  recordPresetMapPlay(draft.presetMap);

  return { id, prettyUrl };
}

async function getPrettyUrl(presetUrl?: string): Promise<string> {
  if (!presetUrl) return generateUniquePrettyUrl();

  // if the presetUrl is already taken, generate a new one
  // and update the old draft with the new url.
  const existingRecord = await draftByPrettyUrl(presetUrl);
  if (existingRecord) {
    const newUrl = await generateUniquePrettyUrl();
    await updateDraftUrl(existingRecord.id, newUrl);
  }

  return presetUrl;
}

export async function updateDraftUrl(id: string, urlName: string) {
  db.update(drafts)
    .set({ urlName, updatedAt: sql`CURRENT_TIMESTAMP` })
    .where(eq(drafts.id, id))
    .run();
}

export async function updateDraft(id: string, draftData: Draft) {
  const metadata = deriveDraftMetadata(draftData);

  // Get old completion status
  const existingDraft = await draftById(id);
  const oldIsComplete = existingDraft.isComplete;

  db.update(drafts)
    .set({
      data: JSON.stringify(stripEphemeralDraftFields(draftData)),
      ...metadata,
      updatedAt: sql`CURRENT_TIMESTAMP`,
    })
    .where(eq(drafts.id, id))
    .run();

  // If draft just became complete, enqueue complete image generation
  if (!oldIsComplete && metadata.isComplete && existingDraft.urlName) {
    enqueueImageJob(id, existingDraft.urlName, true);
  }
}

export async function upsertStagedSelection(
  draftId: string,
  phase: SimultaneousPickType,
  playerId: number,
  value: string,
) {
  await db
    .insert(draftStagedSelections)
    .values({
      id: uuidv4().toString(),
      draftId,
      phase,
      playerId,
      value,
    })
    .onConflictDoUpdate({
      target: [
        draftStagedSelections.draftId,
        draftStagedSelections.phase,
        draftStagedSelections.playerId,
      ],
      set: { value },
    })
    .run();
}

export async function getStagedSelections(
  draftId: string,
  phase: SimultaneousPickType,
): Promise<Record<number, string>> {
  const result = await db
    .select({
      playerId: draftStagedSelections.playerId,
      value: draftStagedSelections.value,
    })
    .from(draftStagedSelections)
    .where(
      sql`${draftStagedSelections.draftId} = ${draftId} AND ${draftStagedSelections.phase} = ${phase}`,
    );

  return result.reduce<Record<number, string>>((acc, row) => {
    acc[row.playerId] = row.value;
    return acc;
  }, {});
}

export async function deleteStagedSelection(
  draftId: string,
  phase: SimultaneousPickType,
  playerId: number,
) {
  await db
    .delete(draftStagedSelections)
    .where(
      sql`${draftStagedSelections.draftId} = ${draftId} AND ${draftStagedSelections.phase} = ${phase} AND ${draftStagedSelections.playerId} = ${playerId}`,
    )
    .run();
}

export async function clearStagedSelections(
  draftId: string,
  phase: SimultaneousPickType,
) {
  await db
    .delete(draftStagedSelections)
    .where(
      sql`${draftStagedSelections.draftId} = ${draftId} AND ${draftStagedSelections.phase} = ${phase}`,
    )
    .run();
}

export async function getDraftStagedSelections(
  draftId: string,
): Promise<Partial<Record<SimultaneousPickType, Record<number, string>>>> {
  const result = await db
    .select({
      phase: draftStagedSelections.phase,
      playerId: draftStagedSelections.playerId,
      value: draftStagedSelections.value,
    })
    .from(draftStagedSelections)
    .where(eq(draftStagedSelections.draftId, draftId));

  return result.reduce<
    Partial<Record<SimultaneousPickType, Record<number, string>>>
  >((acc, row) => {
    const phase = row.phase as SimultaneousPickType;
    if (!acc[phase]) acc[phase] = {};
    acc[phase]![row.playerId] = row.value;
    return acc;
  }, {});
}
