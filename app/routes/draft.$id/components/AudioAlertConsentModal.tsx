import { Button, Modal, Stack, Text } from "@mantine/core";
import {
  hasAudioAlertConsent,
  setAudioAlertEnabled,
  markAudioAlertConsentGiven,
} from "~/utils/audioAlert";
import { useState, useEffect } from "react";

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
      title="Audio Alerts"
      centered
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Stack gap="md">
        <Text>
          Would you like to play a sound alert when it&apos;s your turn to draft?
          You can change this setting anytime using the sound icon in the draft
          controls.
        </Text>
        <Button.Group>
          <Button onClick={handleEnable} flex={1}>
            Enable
          </Button>
          <Button onClick={handleDisable} variant="outline" flex={1}>
            Disable
          </Button>
        </Button.Group>
      </Stack>
    </Modal>
  );
}

