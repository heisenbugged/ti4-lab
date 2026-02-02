import {
  Modal,
  Stack,
  TextInput,
  Textarea,
  Button,
  CopyButton,
  Text,
  Group,
  Box,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconUpload,
  IconFileExport,
} from "@tabler/icons-react";
import { useState } from "react";

type Props = {
  ttsExportString: string;
  opened: boolean;
  onClose: () => void;
  onImport: (ttsString: string) => void;
};

export function TtsImportExportModal({
  ttsExportString,
  opened,
  onClose,
  onImport,
}: Props) {
  const [importString, setImportString] = useState("");

  const handleImport = () => {
    onImport(importString);
    setImportString("");
    onClose();
  };

  const handleClose = () => {
    setImportString("");
    onClose();
  };

  const hasExportData = ttsExportString.trim().length > 0;

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="lg"
      title={
        <Group gap="xs">
          <ThemeIcon variant="light" color="violet" size="sm">
            <IconFileExport size={14} />
          </ThemeIcon>
          <Text fw={600} size="sm">
            TTS Import / Export
          </Text>
        </Group>
      }
      styles={{
        header: {
          borderBottom: "1px solid var(--mantine-color-dark-4)",
          paddingBottom: 12,
        },
        body: {
          paddingTop: 20,
        },
      }}
    >
      <Stack gap="xl">
        {/* Export Section */}
        <Box>
          <Group gap="xs" mb="sm">
            <ThemeIcon variant="subtle" color="teal" size="xs">
              <IconUpload size={12} />
            </ThemeIcon>
            <Text size="xs" fw={600} tt="uppercase" c="teal.4" style={{ letterSpacing: "0.05em" }}>
              Export
            </Text>
          </Group>

          <Text size="xs" c="dimmed" mb="sm">
            Copy this string to use in Tabletop Simulator
          </Text>

          <Box
            p="sm"
            style={{
              background: "var(--mantine-color-dark-7)",
              borderRadius: 6,
              border: "1px solid var(--mantine-color-dark-5)",
            }}
          >
            <TextInput
              value={hasExportData ? ttsExportString : "No map data to export"}
              readOnly
              variant="unstyled"
              styles={{
                input: {
                  fontFamily: "monospace",
                  fontSize: 12,
                  color: hasExportData
                    ? "var(--mantine-color-gray-3)"
                    : "var(--mantine-color-dark-3)",
                  background: "transparent",
                },
              }}
            />
            <Group justify="flex-end" mt="xs">
              <CopyButton value={ttsExportString}>
                {({ copied, copy }) => (
                  <Button
                    size="xs"
                    variant={copied ? "light" : "subtle"}
                    color={copied ? "teal" : "gray"}
                    onClick={copy}
                    disabled={!hasExportData}
                    leftSection={
                      copied ? <IconCheck size={14} /> : <IconCopy size={14} />
                    }
                  >
                    {copied ? "Copied" : "Copy to Clipboard"}
                  </Button>
                )}
              </CopyButton>
            </Group>
          </Box>
        </Box>

        <Divider color="dark.5" />

        {/* Import Section */}
        <Box>
          <Group gap="xs" mb="sm">
            <ThemeIcon variant="subtle" color="blue" size="xs">
              <IconDownload size={12} />
            </ThemeIcon>
            <Text size="xs" fw={600} tt="uppercase" c="blue.4" style={{ letterSpacing: "0.05em" }}>
              Import
            </Text>
          </Group>

          <Text size="xs" c="dimmed" mb="sm">
            Paste a TTS map string to import it into the generator
          </Text>

          <Textarea
            placeholder="Paste TTS string here (space-separated system IDs)..."
            value={importString}
            onChange={(e) => setImportString(e.currentTarget.value)}
            minRows={3}
            autosize
            maxRows={6}
            styles={{
              input: {
                fontFamily: "monospace",
                fontSize: 12,
                background: "var(--mantine-color-dark-7)",
                border: "1px solid var(--mantine-color-dark-5)",
                "&:focus": {
                  borderColor: "var(--mantine-color-blue-6)",
                },
              },
            }}
          />

          <Group justify="flex-end" mt="md">
            <Button variant="subtle" color="gray" size="sm" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              leftSection={<IconDownload size={16} />}
              onClick={handleImport}
              disabled={!importString.trim()}
              size="sm"
            >
              Import Map
            </Button>
          </Group>
        </Box>
      </Stack>
    </Modal>
  );
}
