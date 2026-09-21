import { ActionFunctionArgs, data, LoaderFunctionArgs } from "react-router";
import {
  createDraftPreset,
  draftPresetByName,
  draftToPresetData,
} from "~/drizzle/draftPreset.server";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import { Draft } from "~/types";
import {
  finalizeDraftPresetName,
  isValidDraftPresetName,
} from "~/utils/draftPresetName";
import { draftPresetDataForNewDraft } from "~/utils/draftFromPreset.server";

export type SaveDraftPresetInput = {
  name: string;
  keepFactions: boolean;
  draft: Draft;
};

export type SaveDraftPresetResponse =
  | { success: true; name: string }
  | { success: false; error: string };

export type LoadDraftPresetResponse =
  | { success: true; preset: DraftPreset }
  | { success: false; error: string };

export async function loader({ request }: LoaderFunctionArgs) {
  const name = finalizeDraftPresetName(
    new URL(request.url).searchParams.get("name") ?? "",
  );

  if (!isValidDraftPresetName(name)) {
    return data<LoadDraftPresetResponse>(
      { success: false, error: "Enter a valid preset name." },
      { status: 400 },
    );
  }

  const preset = await draftPresetByName(name);
  if (!preset) {
    return data<LoadDraftPresetResponse>(
      { success: false, error: `No preset named "${name}" was found.` },
      { status: 404 },
    );
  }

  return data<LoadDraftPresetResponse>({
    success: true,
    preset: {
      ...preset,
      data: draftPresetDataForNewDraft(preset),
    },
  });
}

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
