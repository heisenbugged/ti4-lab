import { Box, Group, Modal, SegmentedControl, Text } from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { IconPalette } from "@tabler/icons-react";
import { useSafeOutletContext } from "~/useSafeOutletContext";

type Props = {
  showWarning?: boolean;
};

export function OriginalArtToggle({ showWarning = false }: Props) {
  const [hasSeenOriginalArtWarning, setHasSeenOriginalArtWarning] =
    useLocalStorage({
      key: "hasSeenOriginalArtWarning",
      defaultValue: false,
    });
  const [showWarningModal, setShowWarningModal] = useDisclosure(false);

  const { originalArt, setOriginalArt } = useSafeOutletContext();
  return (
    <Box>
      <SegmentedControl
        onChange={(value) => {
          if (
            value === "original" &&
            showWarning &&
            !hasSeenOriginalArtWarning
          ) {
            setShowWarningModal.open();
            setHasSeenOriginalArtWarning(true);
          }
          setOriginalArt(value === "original");
        }}
        value={originalArt ? "original" : "lab"}
        color="blue"
        data={[
          {
            label: (
              <Group gap="xs">
                <IconPalette size={16} />
                <span>Lab Art</span>
              </Group>
            ),
            value: "lab",
          },
          { label: "Original Art", value: "original" },
        ]}
      />
      <Modal
        opened={showWarningModal}
        onClose={setShowWarningModal.close}
        title="Original Art Mode"
      >
        <Text>
          Please note that editing features do not work in &apos;Original
          Art&apos; mode. You can switch back to &apos;Lab Art&apos; mode to use
          all editing features.
        </Text>
      </Modal>
    </Box>
  );
}
