import { Button, Modal, Text } from "~/ui";
import {
  hasAudioAlertConsent,
  setAudioAlertEnabled,
  markAudioAlertConsentGiven,
} from "~/utils/audioAlert";
import { useState, useEffect } from "react";

/** Asked once: play a sound when it's your turn? */
export function AudioAlertConsentModal() {
  const [opened, setOpened] = useState(false);

  useEffect(() => {
    // Show modal only if user hasn't given consent yet
    if (!hasAudioAlertConsent()) {
      setOpened(true);
    }
  }, []);

  const handleEnable = () => {
    setAudioAlertEnabled(true);
    markAudioAlertConsentGiven();
    setOpened(false);
  };

  const handleDisable = () => {
    setAudioAlertEnabled(false);
    markAudioAlertConsentGiven();
    setOpened(false);
  };

  return (
    <Modal
      opened={opened}
      onClose={handleDisable}
      title="Sound alerts"
      dismissible={false}
      withCloseButton={false}
      footer={
        <>
          <Button variant="tertiary" onClick={handleDisable}>
            No sound
          </Button>
          <Button variant="primary" onClick={handleEnable}>
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
