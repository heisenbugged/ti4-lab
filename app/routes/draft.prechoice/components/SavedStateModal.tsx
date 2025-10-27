import { Button, Modal, Stack, Textarea } from "@mantine/core";

type Props = {
  opened: boolean;
  savedStateJson: string;
  onClose: () => void;
  onSavedStateChange: (value: string) => void;
  onContinue: () => void;
};

export function SavedStateModal({
  opened,
  savedStateJson,
  onClose,
  onSavedStateChange,
  onContinue,
}: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="Continue from saved state">
      <Stack>
        <Textarea
          placeholder="Paste your saved draft state JSON here"
          autosize
          minRows={15}
          maxRows={30}
          value={savedStateJson}
          onChange={(event) => onSavedStateChange(event.currentTarget.value)}
        />
        <Button onClick={onContinue}>Continue</Button>
      </Stack>
    </Modal>
  );
}
