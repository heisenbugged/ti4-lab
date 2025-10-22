import { v4 as uuidv4 } from "uuid";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "./config.server";
import { drafts } from "./schema.server";
import { generatePrettyUrlName } from "~/data/urlWords.server";
import { Draft } from "~/types";
import { enqueueImageJob } from "~/utils/imageJobQueue.server";

export async function draftById(id: string) {
  const results = await db
    .select()
    .from(drafts)
    .where(eq(drafts.id, id))
    .limit(1);

  return results[0];
}

type SavedDraft = {
  id: string;
  data: Draft;
  urlName: string | null;
  type: string | null;
  isComplete: number | null;
  imageUrl: string | null;
  incompleteImageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DraftStats = {
  totalDrafts: number;
  completedDrafts: number;
  completionPercent: number;
  draftsByType: Record<string, number>;
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
  stats: DraftStats;
};

type FindDraftsParams = {
  page?: number;
  pageSize?: number;
  sortBy?: "createdAt" | "updatedAt" | "type" | "isComplete";
  sortOrder?: "asc" | "desc";
  typeFilter?: string;
  isCompleteFilter?: boolean;
  createdAfter?: string;
  createdBefore?: string;
};

export async function findDrafts({
  page = 1,
  pageSize = 100,
  sortBy = "createdAt",
  sortOrder = "desc",
  typeFilter,
  isCompleteFilter,
  createdAfter,
  createdBefore,
}: FindDraftsParams = {}): Promise<PaginatedDrafts> {
  const offset = (page - 1) * pageSize;

  // Build where conditions
  const conditions = [];
  if (typeFilter) {
    conditions.push(eq(drafts.type, typeFilter));
  }
  if (isCompleteFilter !== undefined) {
    conditions.push(eq(drafts.isComplete, isCompleteFilter ? 1 : 0));
  }
  if (createdAfter) {
    conditions.push(sql`${drafts.createdAt} >= ${createdAfter}`);
  }
  if (createdBefore) {
    conditions.push(sql`${drafts.createdAt} <= ${createdBefore}`);
  }

  // Build order by
  const orderColumn =
    sortBy === "createdAt"
      ? drafts.createdAt
      : sortBy === "updatedAt"
        ? drafts.updatedAt
        : sortBy === "type"
          ? drafts.type
          : drafts.isComplete;

  const orderFn = sortOrder === "asc" ? sql`${orderColumn} ASC` : desc(orderColumn);

  // Build queries
  let query = db.select().from(drafts);
  if (conditions.length > 0) {
    query = query.where(sql`${sql.join(conditions, sql` AND `)}`);
  }

  // Build WHERE clause for stats (without isCompleteFilter)
  const statsConditions = [];
  if (typeFilter) {
    statsConditions.push(eq(drafts.type, typeFilter));
  }
  if (createdAfter) {
    statsConditions.push(sql`${drafts.createdAt} >= ${createdAfter}`);
  }
  if (createdBefore) {
    statsConditions.push(sql`${drafts.createdAt} <= ${createdBefore}`);
  }

  const statsWhere =
    statsConditions.length > 0
      ? sql`${sql.join(statsConditions, sql` AND `)}`
      : sql`1=1`;

  const [draftsData, filteredCount, statsTotal, completedCount, typeStats] =
    await Promise.all([
      query.orderBy(orderFn).limit(pageSize).offset(offset),
      db
        .select({ count: sql<number>`count(*)` })
        .from(drafts)
        .where(
          conditions.length > 0
            ? sql`${sql.join(conditions, sql` AND `)}`
            : sql`1=1`,
        ),
      db.select({ count: sql<number>`count(*)` }).from(drafts).where(statsWhere),
      db
        .select({ count: sql<number>`count(*)` })
        .from(drafts)
        .where(sql`${statsWhere} AND ${drafts.isComplete} = 1`),
      db
        .select({
          type: drafts.type,
          count: sql<number>`count(*)`,
        })
        .from(drafts)
        .where(statsWhere)
        .groupBy(drafts.type),
    ]);

  const data = draftsData.map((draft) => ({
    ...draft,
    data: JSON.parse(draft.data as string) as Draft,
  }));

  const totalPages = Math.ceil(filteredCount[0].count / pageSize);
  const totalDrafts = statsTotal[0].count;
  const completedDrafts = completedCount[0].count;

  const draftsByType: Record<string, number> = {};
  typeStats.forEach((stat) => {
    if (stat.type) {
      const normalizedType = normalizeDraftType(stat.type);
      draftsByType[normalizedType] = (draftsByType[normalizedType] || 0) + stat.count;
    }
  });

  return {
    drafts: data,
    totalPages,
    currentPage: page,
    stats: {
      totalDrafts,
      completedDrafts,
      completionPercent:
        totalDrafts > 0 ? (completedDrafts / totalDrafts) * 100 : 0,
      draftsByType,
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
  const type = draft.settings?.type || null;
  const isComplete =
    draft.selections?.length === draft.pickOrder?.length ? 1 : 0;

  db.insert(drafts)
    .values({
      id,
      urlName: prettyUrl,
      data: JSON.stringify(draft),
      type,
      isComplete,
    })
    .run();

  // Enqueue incomplete image generation
  enqueueImageJob(id, prettyUrl, false);

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
  db.update(drafts).set({ urlName }).where(eq(drafts.id, id)).run();
}

export async function updateDraft(id: string, draftData: Draft) {
  const type = draftData.settings?.type || null;
  const newIsComplete =
    draftData.selections?.length === draftData.pickOrder?.length ? 1 : 0;

  // Get old completion status
  const existingDraft = await draftById(id);
  const oldIsComplete = existingDraft.isComplete;

  db.update(drafts)
    .set({
      data: JSON.stringify(draftData),
      type,
      isComplete: newIsComplete,
    })
    .where(eq(drafts.id, id))
    .run();

  // If draft just became complete, enqueue complete image generation
  if (oldIsComplete === 0 && newIsComplete === 1 && existingDraft.urlName) {
    enqueueImageJob(id, existingDraft.urlName, true);
  }
}
