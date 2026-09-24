import {
  Button,
  Checkbox,
  Code,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { Draft } from "~/types";
import {
  finalizeDraftPresetName,
  isValidDraftPresetName,
  sanitizeDraftPresetName,
} from "~/utils/draftPresetName";
import type {
  SaveDraftPresetInput,
  SaveDraftPresetResponse,
} from "~/routes/api.draft-presets";

type Props = {
  draft: Draft;
  opened: boolean;
  onClose: () => void;
};

export function SaveDraftPresetModal({ draft, opened, onClose }: Props) {
  const fetcher = useFetcher<SaveDraftPresetResponse>();
  const [name, setName] = useState("");
  const [keepFactions, setKeepFactions] = useState(true);

  const finalName = finalizeDraftPresetName(name);
  const nameIsValid = isValidDraftPresetName(finalName);
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
      setName("");
      setKeepFactions(true);
      onClose();
    } else {
      notifications.show({
        color: "red",
        title: "Could not save preset",
        message: result.error,
      });
    }
  }, [fetcher.state, fetcher.data, onClose]);

  const handleSave = () => {
    if (!nameIsValid || saving) return;
    const input: SaveDraftPresetInput = {
      name: finalName,
      keepFactions,
      draft,
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

        <TextInput
          label="Preset name"
          description="Lowercase letters, numbers and hyphens only."
          placeholder="my-tournament-round-1"
          value={name}
          onChange={(e) =>
            setName(sanitizeDraftPresetName(e.currentTarget.value))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
          }}
          error={
            name.length > 0 && !nameIsValid ? "Enter a valid name" : undefined
          }
          data-autofocus
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
          <Button onClick={handleSave} disabled={!nameIsValid} loading={saving}>
            Save preset
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
