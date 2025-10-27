import { List, Modal, Text } from "@mantine/core";

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
    >
      <Text size="lg" fw="bold">
        TI4 Lab supports minor factions (unofficially)!
      </Text>

      <Text mt="lg">To run a minor factions draft:</Text>
      <List mt="lg" mx="sm">
        <List.Item>Use Milty EQ as the draft format.</List.Item>
        <List.Item>
          Click &apos;Minor factions&apos; in advanced settings.
        </List.Item>
        <List.Item>Specify the number of minor factions to draft.</List.Item>
      </List>
      <Text mt="lg">
        Minor factions are drafted like regular factions, but they are placed in
        the left equidistant system slots.
      </Text>
    </Modal>
  );
}
