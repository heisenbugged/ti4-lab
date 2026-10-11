import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { notifyPick } from "~/discord/notify.server";
import { buildInitialDraft } from "~/draft/buildInitialDraft";
import {
  applyTexasFactionCommit,
  applyTexasTileCommit,
  isTexasTilePhase,
} from "~/draft/texas/texasDraft";
import {
  clearStagedSelections,
  createDraft as insertDraft,
  deleteStagedSelection,
  draftByPrettyUrl,
  getDraftStagedSelections,
  getStagedSelections,
  updateDraft,
  upsertStagedSelection,
} from "~/drizzle/draft.server";
import {
  createMultiDraft as insertMultiDraft,
  multiDraftByPrettyUrl,
} from "~/drizzle/multiDraft.server";
import {
  DiscordData,
  Draft,
  DraftSettings,
  HOME_PHASE,
  Player,
  PlayerId,
  PRIORITY_PHASE,
  SimultaneousPickType,
} from "~/types";
import {
  broadcastDraftWithStaged,
  draftNotFound,
  loadDraft,
  loadDraftRecord,
  undoLastSelection,
  undoOutOfSync,
} from "~/utils/draftApi.server";
import { withDraftOrder } from "~/utils/draftOrder.server";
import { loadDraftByUrlParam } from "~/utils/draftRedirect.server";
import { validateDraftSync } from "~/utils/draftSync.server";
import {
  expectNumber,
  expectRecord,
  expectString,
  optionalNumber,
} from "./validate";

export type DraftInput = Omit<Draft, "pickOrder"> & { presetUrl?: string };

// ---------------------------------------------------------------- reads

/** A live draft by its pretty url (legacy UUID urls redirect), with staged picks. */
export const getDraft = createServerFn()
  .validator((urlParam: string) => expectString(urlParam, "Draft id"))
  .handler(async ({ data: urlParam }) => {
    const result = await loadDraftByUrlParam(urlParam);
    const stagedSelections = await getDraftStagedSelections(result.id);
    return { ...result, data: { ...result.data, stagedSelections } };
  });

export const getDraftForReplay = createServerFn()
  .validator((urlParam: string) => expectString(urlParam, "Draft id"))
  .handler(({ data: urlParam }) =>
    loadDraftByUrlParam(urlParam, "/draft/$id/replay"),
  );

export const getMultiDraft = createServerFn()
  .validator((urlName: string) => expectString(urlName, "Multidraft id"))
  .handler(async ({ data: urlName }) => {
    const multidraft = await multiDraftByPrettyUrl(urlName);
    if (!multidraft) throw notFound();

    const urlNames = multidraft.draftUrlNames?.split(",") || [];
    const drafts = await Promise.all(
      urlNames.map(async (urlName) => {
        const record = await draftByPrettyUrl(urlName);
        const draft = record?.data
          ? (JSON.parse(record.data as string) as Draft)
          : null;
        return { urlName, draft };
      }),
    );
    return { multidraft, drafts };
  });

// ---------------------------------------------------------------- create

/** Persists a new draft and returns its pretty url. */
export const createDraft = createServerFn({ method: "POST" })
  .validator((input: DraftInput) => {
    expectRecord(input, "draft");
    return input;
  })
  .handler(async ({ data: input }) => {
    const { presetUrl, ...body } = input;
    const draft: Draft = withDraftOrder(body);

    const { prettyUrl, id } = await insertDraft(draft, presetUrl);
    if (draft.integrations?.discord) {
      await notifyPick(id, prettyUrl, draft);
    }
    return { prettyUrl };
  });

const MIN_DRAFTS = 2;
const MAX_DRAFTS = 9;

/** Generates several drafts from the same settings and groups them. */
export const createMultiDraft = createServerFn({ method: "POST" })
  .validator(
    (input: {
      settings: DraftSettings;
      players: Player[];
      discordData?: DiscordData;
      numDrafts: number;
    }) => {
      expectRecord(input);
      expectRecord(input.settings, "draft settings");
      if (!Array.isArray(input.players)) throw new Error("Players are required");
      return input;
    },
  )
  .handler(async ({ data: { settings, players, discordData, numDrafts } }) => {
    const count = Math.min(
      MAX_DRAFTS,
      Math.max(MIN_DRAFTS, optionalNumber(numDrafts) ?? MIN_DRAFTS),
    );

    const drafts: Draft[] = [];
    for (let i = 0; i < count; i++) {
      const initial = buildInitialDraft(settings, players, {
        discord: discordData,
      });
      if (!initial) {
        throw new Error("Could not generate a valid map with the given settings.");
      }
      drafts.push(withDraftOrder(initial));
    }

    const draftUrlNames: string[] = [];
    for (const draft of drafts) {
      const { prettyUrl } = await insertDraft(draft);
      draftUrlNames.push(prettyUrl);
    }

    return { prettyUrl: await insertMultiDraft(draftUrlNames) };
  });

// ---------------------------------------------------------------- live draft

/**
 * Saves the client's draft after a pick (or an admin edit). The client may be
 * at most one pick ahead of the server, and must agree on every earlier pick.
 */
export const syncDraft = createServerFn({ method: "POST" })
  .validator((input: { id: string; draft: Draft }) => {
    expectRecord(input);
    expectString(input.id, "Draft id");
    const draft = expectRecord(input.draft, "draft");
    // Legacy drafts can't be read by the current client.
    if (Object.prototype.hasOwnProperty.call(draft, "mapString")) {
      throw new Error("Cannot read old draft!");
    }
    return input;
  })
  .handler(async ({ data: { id, draft } }) => {
    const existingDraft = await loadDraftRecord(id);
    if (!existingDraft) return draftNotFound();
    const serverSelections = existingDraft.draft.selections;

    const validation = validateDraftSync(serverSelections, draft.selections);
    if (!validation.valid) return validation.response;

    await updateDraft(id, draft);

    // only notify if a selection was made
    if (serverSelections.length !== draft.selections.length) {
      const notifyResult = await notifyPick(id, existingDraft.urlName!, draft);
      if (!notifyResult.success) {
        return {
          success: true as const,
          discordError: "error" in notifyResult ? notifyResult.error : undefined,
          discordMessage:
            "message" in notifyResult ? notifyResult.message : undefined,
        };
      }
    }

    return { success: true as const };
  });

function expectPhase(value: unknown) {
  return expectString(value, "Phase") as SimultaneousPickType;
}

function applySimultaneousCommit(
  draft: Draft,
  phase: SimultaneousPickType,
  selections: { playerId: PlayerId; value: string }[],
) {
  if (phase === "texasFaction") {
    return applyTexasFactionCommit(draft, selections);
  }

  if (isTexasTilePhase(phase)) {
    applyTexasTileCommit(draft, phase, selections);
  }

  return selections;
}

/** Stages one player's hidden pick; commits the phase once everyone has picked. */
export const stageSimultaneousPick = createServerFn({ method: "POST" })
  .validator(
    (input: {
      id: string;
      phase: SimultaneousPickType;
      playerId: PlayerId;
      value: string;
    }) => {
      expectRecord(input);
      return {
        id: expectString(input.id, "Draft id"),
        phase: expectPhase(input.phase),
        playerId: expectNumber(input.playerId, "Player ID"),
        value: expectString(input.value, "Value"),
      };
    },
  )
  .handler(async ({ data: { id, phase, playerId, value } }) => {
    const draft = await loadDraft(id);
    if (!draft) return draftNotFound();

    const currentPick = draft.pickOrder[draft.selections.length];
    const isLegacyPhase =
      (phase === "priorityValue" && currentPick === PRIORITY_PHASE) ||
      (phase === "homeSystem" && currentPick === HOME_PHASE);

    if (
      !isLegacyPhase &&
      (typeof currentPick !== "object" ||
        currentPick.kind !== "simultaneous" ||
        currentPick.phase !== phase)
    ) {
      return {
        success: false as const,
        error: "Not in simultaneous selection phase",
      };
    }

    await upsertStagedSelection(id, phase, playerId, value);

    const stagingState = await getStagedSelections(id, phase);
    const allPlayersReady = draft.players.every(
      (player) => stagingState[player.id] !== undefined,
    );

    if (allPlayersReady) {
      const selections = draft.players.map((player) => ({
        playerId: player.id,
        value: stagingState[player.id],
      }));

      draft.selections.push({
        type: "COMMIT_SIMULTANEOUS",
        phase,
        selections: applySimultaneousCommit(draft, phase, selections),
      });

      await clearStagedSelections(id, phase);
      await updateDraft(id, draft);
    }

    const latestDraft = (await loadDraft(id)) ?? draft;
    const payload = await broadcastDraftWithStaged(id, latestDraft);

    return { success: true as const, allPlayersReady, draft: payload };
  });

/** Withdraws one player's staged (uncommitted) pick. */
export const undoStagedPick = createServerFn({ method: "POST" })
  .validator(
    (input: { id: string; phase: SimultaneousPickType; playerId: PlayerId }) => {
      expectRecord(input);
      return {
        id: expectString(input.id, "Draft id"),
        phase: expectPhase(input.phase),
        playerId: expectNumber(input.playerId, "Player ID"),
      };
    },
  )
  .handler(async ({ data: { id, phase, playerId } }) => {
    const draft = await loadDraft(id);
    if (!draft) return draftNotFound();

    await deleteStagedSelection(id, phase, playerId);
    const payload = await broadcastDraftWithStaged(id, draft);

    return {
      success: true as const,
      draft: payload,
      newSelectionCount: payload.selections.length,
    };
  });

type UndoInput = { id: string; expectedSelectionCount?: number };

function validateUndo(input: UndoInput) {
  expectRecord(input);
  return {
    id: expectString(input.id, "Draft id"),
    expectedSelectionCount: optionalNumber(input.expectedSelectionCount),
  };
}

/** Clears a committed simultaneous phase (and anything staged for it). */
export const undoSimultaneousPhase = createServerFn({ method: "POST" })
  .validator((input: UndoInput & { phase: SimultaneousPickType }) => ({
    ...validateUndo(input),
    phase: expectPhase(input.phase),
  }))
  .handler(async ({ data: { id, phase, expectedSelectionCount } }) => {
    const draft = await loadDraft(id);
    if (!draft) return draftNotFound();

    const outOfSync = undoOutOfSync(draft, expectedSelectionCount);
    if (outOfSync) return outOfSync;

    await clearStagedSelections(id, phase);
    return undoLastSelection(id, draft);
  });

export const undoLastPick = createServerFn({ method: "POST" })
  .validator(validateUndo)
  .handler(async ({ data: { id, expectedSelectionCount } }) => {
    const draft = await loadDraft(id);
    if (!draft) return draftNotFound();

    const outOfSync = undoOutOfSync(draft, expectedSelectionCount);
    if (outOfSync) return outOfSync;

    if (draft.selections.length === 0) {
      return { success: false as const, error: "No selections to undo" };
    }

    return undoLastSelection(id, draft);
  });
