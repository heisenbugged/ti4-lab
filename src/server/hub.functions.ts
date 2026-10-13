import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { avatarUrl } from "~/auth/discord.server";
import { sessionsEnabled, sessionUserId, userSession } from "~/auth/session.server";
import { createDraftPreset } from "~/drizzle/draftPreset.server";
import {
  addDraftToHub,
  addSliceSetToHub,
  draftIdsByIds,
  draftIdsByUrlNames,
  HUB_DESCRIPTION_MAX_LENGTH,
  HUB_LABEL_MAX_LENGTH,
  HUB_NAME_MAX_LENGTH,
  hubBySlug,
  hubDraftKeys,
  hubDraftPage,
  hubRecordRows,
  type HubDraftStatus,
  hubForOwner,
  hubSliceSetKeys,
  hubSliceSetPage,
  presetByNameForImport,
  sanitizeHubSlug,
  updateHub,
  updateHubDraft,
  updateHubSliceSet,
  userById,
} from "~/drizzle/hub.server";
import { multiDraftByPrettyUrl } from "~/drizzle/multiDraft.server";
import type { Draft, FactionId } from "~/types";
import { draftToPresetData, type DraftPresetData } from "~/utils/draftPreset";
import { DRAFT_PRESET_NAME_MAX_LENGTH, finalizeDraftPresetName } from "~/utils/draftPresetName";
import { MAX_IMPORT_ITEMS, parseImportText } from "~/utils/hubImport";
import { decodeCursor, HUB_PAGE_SIZE, pageInfo, SLICE_SET_PAGE_SIZE, type PageInfo } from "~/utils/hubPagination";
import { expectRecord, expectString, isRecord } from "./validate";

// ---------------------------------------------------------------- viewer

export type Viewer = {
  id: string;
  name: string;
  avatarUrl: string | null;
  hubSlug: string | null;
};

async function loadViewer(): Promise<Viewer | null> {
  const userId = await sessionUserId();
  if (!userId) return null;
  const user = await userById(userId);
  if (!user) return null;
  const hub = await hubForOwner(userId);
  return {
    id: user.id,
    name: user.globalName ?? user.username,
    avatarUrl: avatarUrl(user),
    hubSlug: hub?.slug ?? null,
  };
}

/** The signed-in Discord user, or null. */
export const getViewer = createServerFn().handler(loadViewer);

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  if (!sessionsEnabled()) return;
  const session = await userSession();
  await session.clear();
});

/** The signed-in user's hub; throws when signed out. */
async function requireOwnHub() {
  const userId = await sessionUserId();
  if (!userId) throw new Error("Sign in with Discord to change your hub.");
  const hub = await hubForOwner(userId);
  if (!hub) throw new Error("Sign in with Discord to change your hub.");
  return hub;
}

// ---------------------------------------------------------------- hub page

export type HubDraftPlayer = { name: string; factionId?: FactionId };

export type HubDraft = {
  draftId: string;
  urlName: string;
  label: string | null;
  source: string;
  type: string | null;
  mode: string | null;
  phase: string | null;
  isComplete: boolean;
  picks: number;
  totalPicks: number;
  players: HubDraftPlayer[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
};

export type HubSliceSet = {
  id: string;
  title: string;
  presetName: string;
  playerCount: number;
  keepFactions: boolean;
  addedAt: string;
  archived: boolean;
  data: Pick<DraftPresetData, "slices" | "presetMap"> & {
    settings: Pick<
      DraftPresetData["settings"],
      "type" | "draftGameMode" | "numSlices" | "numFactions" | "sliceGenerationConfig"
    >;
    factionCount: number;
  };
};

function draftPlayers(draft: Draft): HubDraftPlayer[] {
  const factionByPlayer = new Map<number, FactionId>();
  for (const selection of draft.selections ?? []) {
    if (selection.type === "SELECT_FACTION") {
      factionByPlayer.set(selection.playerId, selection.factionId);
    }
  }
  const discordPlayers = draft.integrations?.discord?.players ?? [];
  return (draft.players ?? []).map((player) => {
    const discord = discordPlayers.find((p) => p.playerId === player.id);
    const discordName =
      discord?.type === "identified" ? (discord.nickname ?? discord.username) : undefined;
    return {
      name: player.name.trim() || discordName || `Player ${player.id + 1}`,
      factionId: factionByPlayer.get(player.id),
    };
  });
}

/** Just enough of each draft for the campaign record. */
export type HubRecordDraft = Pick<
  HubDraft,
  "draftId" | "urlName" | "label" | "phase" | "isComplete" | "picks" | "totalPicks" | "createdAt"
>;

/** The campaign record shows only the newest drafts; totals cover all of them. */
export const RECORD_LIMIT = 50;

export type HubRecord = {
  drafts: HubRecordDraft[];
  total: number;
  finished: number;
  live: number;
  since: string | null;
};

export type HubDraftsPage = PageInfo & {
  drafts: HubDraft[];
  counts: Record<HubDraftStatus, number>;
};

export type HubSearch = {
  status?: HubDraftStatus;
  q?: string;
  cursor?: string;
  /** Slice sets: "archived" shows archived ones (owner only). */
  sets?: "archived";
  setsQ?: string;
  setsCursor?: string;
};

export type HubSliceSetsPage = PageInfo & {
  sliceSets: HubSliceSet[];
  /** Matching the search: on the hub, and archived (owner only). */
  counts: { active: number; archived: number };
  /** Every slice set on the hub, ignoring search. */
  hubTotal: number;
};

const STATUSES: HubDraftStatus[] = ["all", "live", "done", "archived"];

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.slice(0, max) : undefined;
}

function parseHubSearch(search: Record<string, unknown>): HubSearch {
  return {
    status: STATUSES.includes(search.status as HubDraftStatus) ? (search.status as HubDraftStatus) : "all",
    q: text(search.q, 100) ?? "",
    cursor: text(search.cursor, 200),
    sets: search.sets === "archived" ? "archived" : undefined,
    setsQ: text(search.setsQ, 100) ?? "",
    setsCursor: text(search.setsCursor, 200),
  };
}

function toSliceSet(row: Awaited<ReturnType<typeof hubSliceSetPage>>[number]): HubSliceSet {
  const data = JSON.parse(row.presetData) as DraftPresetData;
  return {
    id: row.id,
    title: row.title,
    presetName: row.presetName,
    playerCount: row.playerCount,
    keepFactions: row.keepFactions,
    addedAt: row.addedAt,
    archived: Boolean(row.archivedAt),
    data: {
      slices: data.slices ?? [],
      presetMap: data.presetMap,
      settings: {
        type: data.settings.type,
        draftGameMode: data.settings.draftGameMode,
        numSlices: data.settings.numSlices,
        numFactions: data.settings.numFactions,
        sliceGenerationConfig: data.settings.sliceGenerationConfig,
      },
      factionCount: data.availableFactions?.length ?? 0,
    },
  };
}

async function loadSliceSetsPage(hubId: string, isOwner: boolean, search: HubSearch): Promise<HubSliceSetsPage> {
  const archived = search.sets === "archived" && isOwner;
  const q = search.setsQ ?? "";
  const [keys, allKeys] = await Promise.all([
    hubSliceSetKeys(hubId, q),
    q ? hubSliceSetKeys(hubId, "") : undefined,
  ]);
  const active = keys.filter((key) => !key.archived);
  const archivedKeys = keys.filter((key) => key.archived);

  const cursor = decodeCursor(search.setsCursor);
  const info = pageInfo(archived ? archivedKeys : active, cursor, SLICE_SET_PAGE_SIZE);
  const rows = await hubSliceSetPage(hubId, { archived, q }, cursor, SLICE_SET_PAGE_SIZE);

  return {
    ...info,
    sliceSets: rows.map(toSliceSet),
    counts: { active: active.length, archived: isOwner ? archivedKeys.length : 0 },
    hubTotal: (allKeys ?? keys).filter((key) => !key.archived).length,
  };
}

async function loadDraftsPage(hubId: string, isOwner: boolean, search: HubSearch): Promise<HubDraftsPage> {
  // Only the owner can see archived drafts.
  const status: HubDraftStatus = search.status === "archived" && !isOwner ? "all" : (search.status ?? "all");
  const q = search.q ?? "";
  const keys = await hubDraftKeys(hubId, q);

  const active = keys.filter((key) => !key.archived);
  const counts: Record<HubDraftStatus, number> = {
    all: active.length,
    live: active.filter((key) => !key.isComplete).length,
    done: active.filter((key) => key.isComplete).length,
    archived: isOwner ? keys.length - active.length : 0,
  };
  const matching =
    status === "archived"
      ? keys.filter((key) => key.archived)
      : status === "live"
        ? active.filter((key) => !key.isComplete)
        : status === "done"
          ? active.filter((key) => key.isComplete)
          : active;

  const cursor = decodeCursor(search.cursor);
  const info = pageInfo(matching, cursor, HUB_PAGE_SIZE);
  const rows = await hubDraftPage(hubId, { status, q }, cursor, HUB_PAGE_SIZE);

  return {
    ...info,
    counts,
    drafts: rows.map((row) => {
      let players: HubDraftPlayer[] = [];
      try {
        players = draftPlayers(JSON.parse(row.data as string) as Draft);
      } catch {
        // Unreadable legacy draft: show it without players.
      }
      return {
        draftId: row.draftId,
        urlName: row.urlName!,
        label: row.label,
        source: row.source,
        type: row.type,
        mode: row.mode,
        phase: row.phase,
        isComplete: Boolean(row.isComplete),
        picks: row.selectionsCount ?? 0,
        totalPicks: row.pickOrderCount ?? 0,
        players,
        imageUrl: (row.isComplete ? row.imageUrl : row.incompleteImageUrl) ?? null,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        archived: Boolean(row.archivedAt),
      };
    }),
  };
}

export const getHub = createServerFn()
  .validator((input: { slug: string } & HubSearch) => {
    expectRecord(input);
    return { slug: sanitizeHubSlug(expectString(input.slug, "Hub")), ...parseHubSearch(input) };
  })
  .handler(async ({ data: { slug, ...search } }) => {
    const hub = await hubBySlug(slug);
    if (!hub) throw notFound();

    const [owner, viewerId, recordRows] = await Promise.all([
      userById(hub.ownerId),
      sessionUserId(),
      hubRecordRows(hub.id),
    ]);
    const isOwner = viewerId === hub.ownerId;
    const [draftsPage, sliceSetsPage] = await Promise.all([
      loadDraftsPage(hub.id, isOwner, search),
      loadSliceSetsPage(hub.id, isOwner, search),
    ]);

    const recordDrafts: HubRecordDraft[] = recordRows.map((row) => ({
      draftId: row.draftId,
      urlName: row.urlName!,
      label: row.label,
      phase: row.phase,
      isComplete: Boolean(row.isComplete),
      picks: row.selectionsCount ?? 0,
      totalPicks: row.pickOrderCount ?? 0,
      createdAt: row.createdAt,
    }));
    const record: HubRecord = {
      drafts: recordDrafts.slice(-RECORD_LIMIT),
      total: recordDrafts.length,
      finished: recordDrafts.filter((d) => d.isComplete).length,
      live: recordDrafts.filter((d) => !d.isComplete && d.picks > 0).length,
      since: recordDrafts[0]?.createdAt ?? null,
    };

    return {
      hub: {
        slug: hub.slug,
        name: hub.name,
        description: hub.description,
        createdAt: hub.createdAt,
      },
      owner: owner
        ? { name: owner.globalName ?? owner.username, avatarUrl: avatarUrl(owner) }
        : null,
      isOwner,
      record,
      draftsPage,
      sliceSetsPage,
    };
  });

export type HubPageData = Awaited<ReturnType<typeof getHub>>;

// ---------------------------------------------------------------- editing

function cleanText(value: unknown, max: number) {
  return typeof value === "string" ? value.replace(/\s+/g, " ").trim().slice(0, max) : "";
}

export const saveHubSettings = createServerFn({ method: "POST" })
  .validator((input: { name: string; description: string; slug: string }) => {
    expectRecord(input);
    return {
      name: cleanText(input.name, HUB_NAME_MAX_LENGTH),
      description: cleanText(input.description, HUB_DESCRIPTION_MAX_LENGTH),
      slug: sanitizeHubSlug(String(input.slug ?? "")),
    };
  })
  .handler(async ({ data }) => {
    const hub = await requireOwnHub();
    if (!data.name) return { ok: false as const, error: "Give your hub a name." };
    if (data.slug.length < 3) {
      return { ok: false as const, error: "Use at least 3 letters or numbers for the link." };
    }
    const error = await updateHub(hub.id, data);
    if (error) return { ok: false as const, error };
    return { ok: true as const, slug: data.slug };
  });

export const editHubDraft = createServerFn({ method: "POST" })
  .validator((input: { draftId: string; archived?: boolean; label?: string | null }) => {
    expectRecord(input);
    return {
      draftId: expectString(input.draftId, "Draft"),
      archived: typeof input.archived === "boolean" ? input.archived : undefined,
      label:
        input.label === undefined
          ? undefined
          : cleanText(input.label, HUB_LABEL_MAX_LENGTH) || null,
    };
  })
  .handler(async ({ data: { draftId, ...patch } }) => {
    const hub = await requireOwnHub();
    await updateHubDraft(hub.id, draftId, patch);
  });

export const editHubSliceSet = createServerFn({ method: "POST" })
  .validator((input: { sliceSetId: string; archived?: boolean; title?: string }) => {
    expectRecord(input);
    const title = input.title === undefined ? undefined : cleanText(input.title, HUB_LABEL_MAX_LENGTH);
    return {
      sliceSetId: expectString(input.sliceSetId, "Slice set"),
      archived: typeof input.archived === "boolean" ? input.archived : undefined,
      title: title || undefined,
    };
  })
  .handler(async ({ data: { sliceSetId, ...patch } }) => {
    const hub = await requireOwnHub();
    await updateHubSliceSet(hub.id, sliceSetId, patch);
  });

// ---------------------------------------------------------------- save slices

export type SaveSliceSetInput = {
  title: string;
  keepFactions: boolean;
  playerCount: number;
  data: DraftPresetData;
};

export type SaveSliceSetResponse =
  | { success: true; title: string; presetName: string; hubSlug: string }
  | { success: false; error: string };

function presetNameFromTitle(title: string) {
  const suffix = Math.random().toString(36).slice(2, 6);
  const base = finalizeDraftPresetName(title).slice(0, DRAFT_PRESET_NAME_MAX_LENGTH - 5);
  return `${base || "slices"}-${suffix}`;
}

/** Saves the builder's slices as a named slice set on the signed-in user's hub. */
export const saveSliceSetToHub = createServerFn({ method: "POST" })
  .validator((input: SaveSliceSetInput) => expectRecord(input) as Partial<SaveSliceSetInput>)
  .handler(async ({ data: body }): Promise<SaveSliceSetResponse> => {
    const hub = await requireOwnHub();
    const title = cleanText(body.title, HUB_LABEL_MAX_LENGTH);
    if (!title) return { success: false, error: "Give the slice set a name." };

    const { playerCount, data: presetData } = body;
    if (
      !isRecord(presetData) ||
      !presetData.settings ||
      typeof playerCount !== "number" ||
      !Number.isInteger(playerCount) ||
      playerCount < 1
    ) {
      return { success: false, error: "Missing draft data." };
    }
    if (presetData.settings.draftGameMode === "texasStyle") {
      return { success: false, error: "Texas style drafts can't be saved as slice sets." };
    }

    // Preset names are global; retry on the rare suffix collision.
    for (let attempt = 0; attempt < 5; attempt++) {
      const preset = await createDraftPreset({
        name: presetNameFromTitle(title),
        keepFactions: body.keepFactions !== false,
        playerCount,
        data: draftToPresetData(presetData),
      });
      if (preset) {
        await addSliceSetToHub(hub.id, preset.id, title);
        return { success: true, title, presetName: preset.name, hubSlug: hub.slug };
      }
    }
    return { success: false, error: "Couldn't pick a unique preset name. Try again." };
  });

// ---------------------------------------------------------------- import

export type ImportResult = {
  input: string;
  status: "added" | "already" | "notFound" | "invalid";
  /** What was added: a draft url name, or a slice set title. */
  name?: string;
  kind?: "draft" | "sliceSet";
};

/**
 * Adds historical drafts (and multidraft groups, and saved presets by name)
 * to the signed-in user's hub.
 */
export const importToHub = createServerFn({ method: "POST" })
  .validator((input: { text: string }) => {
    expectRecord(input);
    return { text: String(input.text ?? "").slice(0, 40_000) };
  })
  .handler(async ({ data: { text } }) => {
    const hub = await requireOwnHub();
    const targets = parseImportText(text).slice(0, MAX_IMPORT_ITEMS);

    const urlNames = targets.flatMap((t) => (t.kind === "draft" ? [t.key] : []));
    const ids = targets.flatMap((t) => (t.kind === "draftId" ? [t.key] : []));
    const [idByUrlName, existingIds] = await Promise.all([
      draftIdsByUrlNames(urlNames),
      draftIdsByIds(ids),
    ]);

    const results: ImportResult[] = [];
    const addDraft = async (input: string, draftId: string, name: string) => {
      const added = await addDraftToHub(hub.id, draftId, "imported");
      results.push({ input, status: added ? "added" : "already", name, kind: "draft" });
    };

    for (const target of targets) {
      if (target.kind === "invalid") {
        results.push({ input: target.input, status: "invalid" });
        continue;
      }

      if (target.kind === "draftId") {
        if (existingIds.has(target.key)) await addDraft(target.input, target.key, target.key);
        else results.push({ input: target.input, status: "notFound" });
        continue;
      }

      if (target.kind === "multidraft") {
        const multidraft = await multiDraftByPrettyUrl(target.key);
        const names = multidraft?.draftUrlNames?.split(",").filter(Boolean) ?? [];
        if (names.length === 0) {
          results.push({ input: target.input, status: "notFound" });
          continue;
        }
        const groupIds = await draftIdsByUrlNames(names);
        for (const name of names) {
          const draftId = groupIds.get(name);
          if (draftId) await addDraft(target.input, draftId, name);
        }
        continue;
      }

      const draftId = idByUrlName.get(target.key);
      if (draftId) {
        await addDraft(target.input, draftId, target.key);
        continue;
      }

      // Not a draft: maybe the name of a preset saved before the hub existed.
      const preset = await presetByNameForImport(target.key);
      if (preset) {
        const added = await addSliceSetToHub(hub.id, preset.id, preset.name);
        results.push({
          input: target.input,
          status: added ? "added" : "already",
          name: preset.name,
          kind: "sliceSet",
        });
        continue;
      }

      results.push({ input: target.input, status: "notFound" });
    }

    return { results };
  });
