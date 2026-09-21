import { Button, Modal, Stack, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import type { LoadDraftPresetResponse } from "~/routes/api.draft-presets";
import {
  finalizeDraftPresetName,
  isValidDraftPresetName,
  sanitizeDraftPresetName,
} from "~/utils/draftPresetName";

type Props = {
  opened: boolean;
  onClose: () => void;
  onContinue: (preset: DraftPreset) => void;
};

export function ContinueFromPresetModal({
  opened,
  onClose,
  onContinue,
}: Props) {
  const fetcher = useFetcher<LoadDraftPresetResponse>();
  const [name, setName] = useState("");
  const finalName = finalizeDraftPresetName(name);
  const nameIsValid = isValidDraftPresetName(finalName);
  const loading = fetcher.state !== "idle";

  useEffect(() => {
    if (fetcher.state !== "idle" || !fetcher.data) return;

    if (fetcher.data.success) {
      onContinue(fetcher.data.preset);
      return;
    }

    notifications.show({
      color: "red",
      title: "Could not load preset",
      message: fetcher.data.error,
    });
  }, [fetcher.state, fetcher.data, onContinue]);

  const handleContinue = () => {
    if (!nameIsValid || loading) return;
    fetcher.load(`/api/draft-presets?name=${encodeURIComponent(finalName)}`);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Continue from preset"
      removeScrollProps={{ removeScrollBar: false }}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          Enter the name that you used when you saved the preset. The preset
          will open in the draft builder so you can review or change it before
          you create a draft.
        </Text>
        <TextInput
          label="Preset name"
          placeholder="my-game"
          value={name}
          onChange={(event) =>
            setName(sanitizeDraftPresetName(event.currentTarget.value))
          }
          onKeyDown={(event) => {
            if (event.key === "Enter") handleContinue();
          }}
          error={
            name.length > 0 && !nameIsValid ? "Enter a valid name" : undefined
          }
          data-autofocus
        />
        <Button
          onClick={handleContinue}
          disabled={!nameIsValid}
          loading={loading}
        >
          Continue
        </Button>
      </Stack>
    </Modal>
  );
}
