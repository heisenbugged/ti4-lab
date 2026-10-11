import { useState } from "react";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import {
  loadDraftPreset,
  type LoadDraftPresetResponse,
} from "~/server/draftPresets.functions";
import {
  PresetNameInput,
  usePresetName,
} from "~/routes/draft/new/-components/PresetNameInput";
import { DRAFT_PRESET_NAME_MAX_LENGTH } from "~/utils/draftPresetName";
import { Button, Modal, Stack, Text, notify } from "~/ui";

type Props = {
  opened: boolean;
  onClose: () => void;
  onContinue: (preset: DraftPreset) => void;
};

async function loadPreset(name: string): Promise<LoadDraftPresetResponse> {
  try {
    return await loadDraftPreset({ data: name });
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
        <PresetNameInput
          preset={presetName}
          onSubmit={handleContinue}
          description={`Lowercase with hyphens, up to ${DRAFT_PRESET_NAME_MAX_LENGTH} characters. Press Enter to continue.`}
          placeholder="my-game"
        />
      </Stack>
    </Modal>
  );
}
