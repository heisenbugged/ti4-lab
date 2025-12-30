import { useState } from "react";
import {
  Button,
  Modal,
  Box,
  Textarea,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { IconCopy } from "@tabler/icons-react";
import { useDraft } from "~/draftStore";

export function ExportDraftState() {
  const draftState = useDraft((state) => state.draft);
  const [modalOpen, setModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const saveableState = JSON.stringify({
    ...draftState,
    selections: [],
    pickOrder: [],
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(saveableState);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Button
        onClick={() => setModalOpen(true)}
        size="compact-xs"
        variant="subtle"
        color="gray"
      >
        Export
      </Button>
      <Modal
        opened={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Draft State"
        size="lg"
      >
        <Box style={{ position: "relative" }}>
          <Textarea
            value={saveableState}
            readOnly
            autosize
            minRows={10}
            maxRows={20}
          />
          <Tooltip
            label={copied ? "Copied!" : "Copy to clipboard"}
            position="top"
            withArrow
          >
            <ActionIcon
              onClick={handleCopy}
              variant="filled"
              color={copied ? "green" : "blue"}
              size="lg"
              style={{
                position: "absolute",
                top: 5,
                right: 15,
              }}
            >
              <IconCopy size="1.1rem" />
            </ActionIcon>
          </Tooltip>
        </Box>
      </Modal>
    </>
  );
}
