import { Modal, Stack, TextInput, Button, CopyButton, Text, Anchor } from "@mantine/core";
import { IconCheck, IconCopy } from "@tabler/icons-react";

type Props = {
  mapString: string;
  shareUrl: string;
  opened: boolean;
  onClose: () => void;
};

export function ShareMapModal({ mapString, shareUrl, opened, onClose }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="lg"
      title="Share Map"
    >
      <Stack gap="md">
        <div>
          <Text size="sm" fw={500} mb="xs">Map String</Text>
          <TextInput
            value={mapString}
            readOnly
            rightSection={
              <CopyButton value={mapString}>
                {({ copied, copy }) => (
                  <Button
                    size="xs"
                    color={copied ? "teal" : "gray"}
                    onClick={copy}
                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </CopyButton>
            }
            rightSectionWidth={100}
          />
        </div>

        <div>
          <Text size="sm" fw={500} mb="xs">Shareable Link</Text>
          <TextInput
            value={shareUrl}
            readOnly
            rightSection={
              <CopyButton value={shareUrl}>
                {({ copied, copy }) => (
                  <Button
                    size="xs"
                    color={copied ? "teal" : "gray"}
                    onClick={copy}
                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                  >
                    {copied ? "Copied" : "Copy"}
                  </Button>
                )}
              </CopyButton>
            }
            rightSectionWidth={100}
          />
          <Anchor href={shareUrl} target="_blank" size="sm" mt="xs">
            Open in new tab
          </Anchor>
        </div>
      </Stack>
    </Modal>
  );
}
