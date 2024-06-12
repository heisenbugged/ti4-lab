import { Modal, Textarea } from "@mantine/core";

type Props = {
  mapString: string;
  opened?: boolean;
  onClose: () => void;
};

export function ExportMapModal({ mapString, opened, onClose }: Props) {
  return (
    <Modal
      opened={!!opened}
      onClose={onClose}
      size="md"
      title="Export Map"
      removeScrollProps={{ removeScrollBar: false }}
    >
      <Textarea>{mapString}</Textarea>
    </Modal>
  );
}
