import {
  Button,
  Checkbox,
  Code,
  Group,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Draft } from "~/types";
import { draftToPresetData } from "~/utils/draftPreset";
import type {
  SaveDraftPresetInput,
  SaveDraftPresetResponse,
} from "~/routes/api.draft-presets";
import { PresetNameInput, usePresetName } from "./PresetNameInput";

type Props = {
  draft: Draft;
  opened: boolean;
  onClose: () => void;
};

export function SaveDraftPresetModal({ draft, opened, onClose }: Props) {
  const fetcher = useFetcher<SaveDraftPresetResponse>();
  const presetName = usePresetName();
  const { setValue: setPresetName } = presetName;
  const [keepFactions, setKeepFactions] = useState(true);
  const saving = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;
    const result = fetcher.data;

    if (result.success) {
      notifications.show({
        color: "green",
        title: "Preset saved",
        message: `Continue from preset ${result.name} in TI4 Lab, or start it with /labdraft preset:${result.name} in Discord.`,
      });
      setPresetName("");
      setKeepFactions(true);
      onClose();
    } else {
      notifications.show({
        color: "red",
        title: "Could not save preset",
        message: result.error,
      });
    }
  }, [fetcher.state, fetcher.data, onClose, setPresetName]);

  const handleSave = () => {
    if (!presetName.isValid || saving) return;
    const input: SaveDraftPresetInput = {
      name: presetName.name,
      keepFactions,
      playerCount: draft.players.length,
      data: draftToPresetData(draft),
    };
    fetcher.submit(input, {
      method: "POST",
      encType: "application/json",
      action: "/api/draft-presets",
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Save as preset"
      size="md"
      removeScrollProps={{ removeScrollBar: false }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Save the current map, slices and settings so you can continue from
          them later. You can also start a draft through the Discord bot with{" "}
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
          description="Keep the exact factions (and minor factions / kings) shown here. When off, factions are re-rolled when you continue from the preset or start it through the bot."
          checked={keepFactions}
          onChange={(e) => setKeepFactions(e.currentTarget.checked)}
        />

        <Group justify="flex-end" mt="xs">
          <Button variant="default" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!presetName.isValid}
            loading={saving}
          >
            Save preset
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
