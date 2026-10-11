import { Button, Modal, Stack, Steps, Text } from "~/ui";

type Props = {
  opened: boolean;
  onClose: () => void;
};

export function MinorFactionsInfoModal({ opened, onClose }: Props) {
  return (
    <Modal
      size="lg"
      opened={opened}
      onClose={onClose}
      title="How to run a minor factions draft"
      footer={<Button onClick={onClose}>Close</Button>}
    >
      <Stack gap={4}>
        <Text size="md" weight={600}>
          TI4 Lab supports minor factions (unofficially).
        </Text>
        <Steps
          active={-1}
          items={[
            { title: "Choose a Milty or Milty EQ style." },
            {
              title:
                "Turn on Enable minor factions in the Minor factions panel.",
            },
            {
              title:
                "With Milty EQ, choose Random, Shared or Separate, and set how many to draft.",
            },
          ]}
        />
        <Text size="sm" tone="muted">
          Minor factions are drafted like regular factions, but they are placed
          in the left equidistant system slots.
        </Text>
      </Stack>
    </Modal>
  );
}
