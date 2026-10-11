import { IconDeviceFloppy } from "@tabler/icons-react";
import { Button, Checkbox, Code, Modal, Stack, Text, notify } from "~/ui";
import { useState } from "react";
import { Draft } from "~/types";
import { draftToPresetData } from "~/utils/draftPreset";
import {
  saveDraftPreset,
  type SaveDraftPresetInput,
  type SaveDraftPresetResponse,
} from "~/server/draftPresets.functions";
import { PresetNameInput, usePresetName } from "./PresetNameInput";

type Props = {
  draft: Draft;
  opened: boolean;
  onClose: () => void;
};

async function savePreset(
  input: SaveDraftPresetInput,
): Promise<SaveDraftPresetResponse> {
  try {
    return await saveDraftPreset({ data: input });
  } catch {
    return { success: false, error: "Something went wrong. Try again." };
  }
}

export function SaveDraftPresetModal({ draft, opened, onClose }: Props) {
  const presetName = usePresetName();
  const [keepFactions, setKeepFactions] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!presetName.isValid || saving) return;
    setSaving(true);
    const result = await savePreset({
      name: presetName.name,
      keepFactions,
      playerCount: draft.players.length,
      data: draftToPresetData(draft),
    });
    setSaving(false);

    if (!result.success) {
      notify({
        tone: "danger",
        title: "Could not save preset",
        message: result.error,
      });
      return;
    }

    notify({
      tone: "success",
      title: "Preset saved",
      message: `Continue from preset ${result.name} in TI4 Lab, or start it with /labdraft preset:${result.name} in Discord.`,
    });
    presetName.setValue("");
    setKeepFactions(true);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Save as preset"
      size="md"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<IconDeviceFloppy />}
            onClick={handleSave}
            disabled={!presetName.isValid}
            loading={saving}
          >
            Save preset
          </Button>
        </>
      }
    >
      <Stack gap={4}>
        <Text size="sm" tone="muted">
          Save the current map, slices and settings so you can continue from
          them later. You can also start a draft with the Discord bot:{" "}
          <Code>/labdraft preset:&lt;name&gt;</Code>. The bot uses the players
          from the command and always randomizes player order.
        </Text>

        <PresetNameInput
          preset={presetName}
          onSubmit={handleSave}
          description="Lowercase letters, numbers and hyphens only."
          placeholder="my-tournament-round-1"
        />

        <Checkbox
          label="Save factions"
          description="Keep the exact factions (and minor factions or kings) shown here. When off, factions are re-rolled when you continue from the preset or start it through the bot."
          checked={keepFactions}
          onChange={setKeepFactions}
        />
      </Stack>
    </Modal>
  );
}
