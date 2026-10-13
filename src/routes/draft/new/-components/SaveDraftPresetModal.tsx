import { IconDeviceFloppy } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { Button, Checkbox, Code, Modal, Stack, Text, TextInput, notify } from "~/ui";
import { useState } from "react";
import { Draft } from "~/types";
import { draftToPresetData } from "~/utils/draftPreset";
import {
  saveDraftPreset,
  type SaveDraftPresetInput,
  type SaveDraftPresetResponse,
} from "~/server/draftPresets.functions";
import { saveSliceSetToHub } from "~/server/hub.functions";
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

/** Signed in: name the slices and keep them on the hub (also a bot preset). */
export function SaveToHubModal({ draft, opened, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [keepFactions, setKeepFactions] = useState(true);
  const [saving, setSaving] = useState(false);
  const valid = title.trim().length > 0;

  const handleSave = async () => {
    if (!valid || saving) return;
    setSaving(true);
    let result: Awaited<ReturnType<typeof saveSliceSetToHub>>;
    try {
      result = await saveSliceSetToHub({
        data: {
          title,
          keepFactions,
          playerCount: draft.players.length,
          data: draftToPresetData(draft),
        },
      });
    } catch {
      result = { success: false, error: "Something went wrong. Try again." };
    }
    setSaving(false);

    if (!result.success) {
      notify({ tone: "danger", title: "Could not save to your hub", message: result.error });
      return;
    }

    const { hubSlug, presetName } = result;
    notify({
      tone: "success",
      title: `Saved “${result.title}” to your hub`,
      message: (
        <>
          Start it from <Link to="/hub/$slug" params={{ slug: hubSlug }}>your hub</Link>, or in Discord with /labdraft preset:{presetName}.
        </>
      ),
    });
    setTitle("");
    setKeepFactions(true);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Save to your hub"
      size="md"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="primary" icon={<IconDeviceFloppy />} onClick={handleSave} disabled={!valid} loading={saving}>
            Save to hub
          </Button>
        </>
      }
    >
      <Stack gap={4}>
        <Text size="sm" tone="muted">
          Keep this map, these slices and settings on your hub under a name. You can search for it there and start a new
          draft from it, or start it with the Discord bot.
        </Text>
        <TextInput
          label="Name"
          placeholder="Friday league, week 3"
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          // The field is the whole point of the dialog.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
        <Checkbox
          label="Save factions"
          description="Keep the exact factions (and minor factions or kings) shown here. When off, factions are re-rolled each time you start a draft from it."
          checked={keepFactions}
          onChange={setKeepFactions}
        />
      </Stack>
    </Modal>
  );
}

/** A preset saved under a hyphenated name, for Continue from preset and /labdraft. */
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
