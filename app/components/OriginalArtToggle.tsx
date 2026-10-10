import { IconHexagons } from "@tabler/icons-react";
import { Button, Modal, Segmented, Text, useDisclosure, useLocalStorage } from "~/ui";
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
  const [showWarningModal, warningModal] = useDisclosure(false);

  const { originalArt, setOriginalArt } = useSafeOutletContext();
  return (
    <>
      <Segmented
        label="Tile art"
        value={originalArt ? "original" : "lab"}
        onChange={(value) => {
          if (
            value === "original" &&
            showWarning &&
            !hasSeenOriginalArtWarning
          ) {
            warningModal.open();
            setHasSeenOriginalArtWarning(true);
          }
          setOriginalArt(value === "original");
        }}
        options={[
          {
            label: (
              <>
                <IconHexagons aria-hidden />
                Lab art
              </>
            ),
            value: "lab",
          },
          { label: "Original art", value: "original" },
        ]}
      />
      <Modal
        opened={showWarningModal}
        onClose={warningModal.close}
        title="Original art"
        size="sm"
        footer={
          <Button variant="primary" onClick={warningModal.close}>
            Got it
          </Button>
        }
      >
        <Text>
          Editing doesn&apos;t work with original art. Switch back to Lab art
          to reroll, swap or delete systems.
        </Text>
      </Modal>
    </>
  );
}
