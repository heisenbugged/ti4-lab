import { ActionFunctionArgs, data, LoaderFunctionArgs } from "react-router";
import {
  createDraftPreset,
  draftPresetByName,
} from "~/drizzle/draftPreset.server";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import { finalizeDraftPresetName } from "~/utils/draftPresetName";
import { DraftPresetData, draftToPresetData } from "~/utils/draftPreset";
import { draftPresetDataForNewDraft } from "~/utils/draftFromPreset.server";

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

export async function loader({ request }: LoaderFunctionArgs) {
  const name = finalizeDraftPresetName(
    new URL(request.url).searchParams.get("name") ?? "",
  );

  if (!name) {
    return data<LoadDraftPresetResponse>(
      { success: false, error: INVALID_NAME_ERROR },
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
  const { playerCount, data: presetData } = body;

  if (!name) {
    return data<SaveDraftPresetResponse>(
      { success: false, error: INVALID_NAME_ERROR },
      { status: 400 },
    );
  }

  if (
    !presetData?.settings ||
    typeof playerCount !== "number" ||
    !Number.isInteger(playerCount) ||
    playerCount < 1
  ) {
    return data<SaveDraftPresetResponse>(
      { success: false, error: "Missing draft data." },
      { status: 400 },
    );
  }

  if (presetData.settings.draftGameMode === "texasStyle") {
    return data<SaveDraftPresetResponse>(
      {
        success: false,
        error: "Texas style drafts cannot be saved as presets.",
      },
      { status: 400 },
    );
  }

  const preset = await createDraftPreset({
    name,
    keepFactions: body.keepFactions !== false,
    playerCount,
    data: draftToPresetData(presetData),
  });

  if (!preset) {
    return data<SaveDraftPresetResponse>(
      { success: false, error: `A preset named "${name}" already exists.` },
      { status: 409 },
    );
  }

  return data<SaveDraftPresetResponse>({ success: true, name: preset.name });
}
