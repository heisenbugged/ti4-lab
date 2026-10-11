import { createServerFn } from "@tanstack/react-start";
import {
  createDraftPreset,
  draftPresetByName,
} from "~/drizzle/draftPreset.server";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import { finalizeDraftPresetName } from "~/utils/draftPresetName";
import { DraftPresetData, draftToPresetData } from "~/utils/draftPreset";
import { draftPresetDataForNewDraft } from "~/utils/draftFromPreset.server";
import { expectRecord, isRecord } from "./validate";

export type SaveDraftPresetInput = {
  name: string;
  keepFactions: boolean;
  playerCount: number;
  data: DraftPresetData;
};

export type SaveDraftPresetResponse =
  | { success: true; name: string }
  | { success: false; error: string };

export type LoadDraftPresetResponse =
  | { success: true; preset: DraftPreset }
  | { success: false; error: string };

const INVALID_NAME_ERROR = "Enter a valid preset name.";

export const loadDraftPreset = createServerFn()
  .validator((name: string) => finalizeDraftPresetName(String(name ?? "")))
  .handler(async ({ data: name }): Promise<LoadDraftPresetResponse> => {
    if (!name) return { success: false, error: INVALID_NAME_ERROR };

    const preset = await draftPresetByName(name);
    if (!preset) {
      return { success: false, error: `No preset named "${name}" was found.` };
    }

    return {
      success: true,
      preset: { ...preset, data: draftPresetDataForNewDraft(preset) },
    };
  });

export const saveDraftPreset = createServerFn({ method: "POST" })
  .validator((input: SaveDraftPresetInput) => expectRecord(input) as Partial<SaveDraftPresetInput>)
  .handler(async ({ data: body }): Promise<SaveDraftPresetResponse> => {
    const name = finalizeDraftPresetName(body.name ?? "");
    const { playerCount, data: presetData } = body;

    if (!name) return { success: false, error: INVALID_NAME_ERROR };

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
      return {
        success: false,
        error: "Texas style drafts cannot be saved as presets.",
      };
    }

    const preset = await createDraftPreset({
      name,
      keepFactions: body.keepFactions !== false,
      playerCount,
      data: draftToPresetData(presetData),
    });

    if (!preset) {
      return { success: false, error: `A preset named "${name}" already exists.` };
    }

    return { success: true, name: preset.name };
  });
