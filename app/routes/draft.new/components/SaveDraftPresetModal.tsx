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
        message: `Start a draft from it with /labdraft preset:${result.name}`,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.state, fetcher.data]);

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
          Saves the current map, slices and settings so new drafts can be
          started from them, e.g. from Discord with{" "}
          <Code>/labdraft preset:&lt;name&gt;</Code>. Player order is always
          re-randomized and players come from the command.
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
          description="Keep the exact factions (and minor factions / kings) shown here. When off, factions are re-rolled for each new draft, using the same faction pool, stratification and required factions."
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
