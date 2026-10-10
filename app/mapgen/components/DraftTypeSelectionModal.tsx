import { Button, Modal, Stack, Text } from "~/ui";
import { DraftType } from "~/draft/types";

const DRAFT_TYPE_LABELS: Record<string, string> = {
  milty: "Milty",
  miltyeq: "Milty EQ",
  heisen: "Nucleus",
  milty4p: "Milty",
  miltyeq4p: "Milty EQ",
  milty5p: "Milty",
  miltyeq5p: "Milty EQ",
  milty7p: "Milty",
  miltyeq7p: "Milty EQ",
  miltyeq7plarge: "Milty EQ Large",
  milty8p: "Milty",
  miltyeq8p: "Milty EQ",
  std4p: "Standard",
};

type Props = {
  opened: boolean;
  compatibleTypes: DraftType[];
  onClose: () => void;
  onSelect: (draftType: DraftType) => void;
};

export function DraftTypeSelectionModal({
  opened,
  compatibleTypes,
  onClose,
  onSelect,
}: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Select draft format"
      size="sm"
    >
      <Text size="sm" tone="muted">
        This map supports more than one slice format.
      </Text>
      <Stack gap={2}>
        {compatibleTypes.map((type) => (
          <Button key={type} block onClick={() => onSelect(type)}>
            {DRAFT_TYPE_LABELS[type] ?? type}
          </Button>
        ))}
      </Stack>
    </Modal>
  );
}
