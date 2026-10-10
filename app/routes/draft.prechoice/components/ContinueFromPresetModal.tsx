import { useState } from "react";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import type { LoadDraftPresetResponse } from "~/routes/api.draft-presets";
import { usePresetName } from "~/routes/draft.new/components/PresetNameInput";
import {
  DRAFT_PRESET_NAME_MAX_LENGTH,
  sanitizeDraftPresetName,
} from "~/utils/draftPresetName";
import { Button, Modal, Stack, Text, TextInput, notify } from "~/ui";

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

    notify({
      tone: "danger",
      title: "Could not load preset",
      message: result.error,
    });
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Continue from preset"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleContinue}
            disabled={!presetName.isValid}
            loading={loading}
          >
            Continue
          </Button>
        </>
      }
    >
      <Stack gap={4}>
        <Text size="sm" tone="muted">
          Enter the name that you used when you saved the preset. The preset
          will open in the draft builder so you can review or change it before
          you create a draft.
        </Text>
        <TextInput
          label="Preset name"
          hint={`Lowercase with hyphens, up to ${DRAFT_PRESET_NAME_MAX_LENGTH} characters. Press Enter to continue.`}
          placeholder="my-game"
          value={presetName.value}
          onChange={(e) =>
            presetName.setValue(sanitizeDraftPresetName(e.currentTarget.value))
          }
          onKeyDown={(e) => {
            if (e.key === "Enter") handleContinue();
          }}
          // The field is the whole point of this dialog, as before.
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
        />
      </Stack>
    </Modal>
  );
}
