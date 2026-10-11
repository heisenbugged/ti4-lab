import { Button, Modal, Text } from "~/ui";
import { setAudioAlertEnabled } from "~/utils/audioAlert";
import { useAudioAlertPreference } from "./useAudioAlertPreference";

/** Asked once: play a sound when it's your turn? */
export function AudioAlertConsentModal() {
  const { consentGiven } = useAudioAlertPreference();
  // Saving either answer records consent, which closes the modal.
  const handleDisable = () => setAudioAlertEnabled(false);

  return (
    <Modal
      opened={!consentGiven}
      onClose={handleDisable}
      title="Sound alerts"
      dismissible={false}
      withCloseButton={false}
      footer={
        <>
          <Button variant="tertiary" onClick={handleDisable}>
            No sound
          </Button>
          <Button variant="primary" onClick={() => setAudioAlertEnabled(true)}>
            Turn on alerts
          </Button>
        </>
      }
    >
      <Text>
        Play a sound when it&apos;s your turn to pick? You can change this any
        time with the bell in the draft tools.
      </Text>
    </Modal>
  );
}
