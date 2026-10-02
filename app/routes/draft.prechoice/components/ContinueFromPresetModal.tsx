import { Button, Modal, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useState } from "react";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import type { LoadDraftPresetResponse } from "~/routes/api.draft-presets";
import {
  PresetNameInput,
  usePresetName,
} from "~/routes/draft.new/components/PresetNameInput";

type Props = {
  opened: boolean;
  onClose: () => void;
  onContinue: (preset: DraftPreset) => void;
};

async function loadPreset(name: string): Promise<LoadDraftPresetResponse> {
  try {
    const response = await fetch(
      `/api/draft-presets?name=${encodeURIComponent(name)}`,
    );
    return (await response.json()) as LoadDraftPresetResponse;
  } catch {
    return { success: false, error: "Something went wrong. Try again." };
  }
}

export function ContinueFromPresetModal({
  opened,
  onClose,
  onContinue,
}: Props) {
  const presetName = usePresetName();
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!presetName.isValid || loading) return;
    setLoading(true);
    const result = await loadPreset(presetName.name);
    setLoading(false);

    if (result.success) {
      onContinue(result.preset);
      return;
    }

    notifications.show({
      color: "red",
      title: "Could not load preset",
      message: result.error,
    });
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
        <PresetNameInput
          preset={presetName}
          onSubmit={handleContinue}
          placeholder="my-game"
        />
        <Button
          onClick={handleContinue}
          disabled={!presetName.isValid}
          loading={loading}
        >
          Continue
        </Button>
      </Stack>
    </Modal>
  );
}
