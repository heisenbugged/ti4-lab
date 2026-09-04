import { ActionFunctionArgs, data } from "react-router";
import {
  createDraftPreset,
  draftPresetByName,
  draftToPresetData,
} from "~/drizzle/draftPreset.server";
import { Draft } from "~/types";
import {
  finalizeDraftPresetName,
  isValidDraftPresetName,
} from "~/utils/draftPresetName";

export type SaveDraftPresetInput = {
  name: string;
  keepFactions: boolean;
  draft: Draft;
};

export type SaveDraftPresetResponse =
  | { success: true; name: string }
  | { success: false; error: string };

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== "POST") {
    return data<SaveDraftPresetResponse>(
      { success: false, error: "Method not allowed" },
      { status: 405 },
    );
  }

  const body = (await request.json()) as Partial<SaveDraftPresetInput>;
  const name = finalizeDraftPresetName(body.name ?? "");
  const draft = body.draft;

  if (!isValidDraftPresetName(name)) {
    return data<SaveDraftPresetResponse>(
      {
        success: false,
        error: "Preset name must contain only letters, numbers and hyphens.",
      },
      { status: 400 },
    );
  }

  if (!draft?.settings || !Array.isArray(draft.players)) {
    return data<SaveDraftPresetResponse>(
      { success: false, error: "Missing draft data." },
      { status: 400 },
    );
  }

  if (draft.settings.draftGameMode === "texasStyle") {
    return data<SaveDraftPresetResponse>(
      {
        success: false,
        error: "Texas style drafts cannot be saved as presets.",
      },
      { status: 400 },
    );
  }

  if (await draftPresetByName(name)) {
    return data<SaveDraftPresetResponse>(
      { success: false, error: `A preset named "${name}" already exists.` },
      { status: 409 },
    );
  }

  const preset = await createDraftPreset({
    name,
    keepFactions: body.keepFactions !== false,
    playerCount: draft.players.length,
    data: draftToPresetData(draft),
  });

  return data<SaveDraftPresetResponse>({ success: true, name: preset.name });
}
