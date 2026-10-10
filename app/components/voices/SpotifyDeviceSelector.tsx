import { Button, Modal, Notice, Row, Spinner, Stack, Tag, Text, cx } from "~/ui";
import {
  IconBrandSpotify,
  IconRefresh,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceSpeaker,
  IconDeviceUnknown,
} from "@tabler/icons-react";
import styles from "./Spotify.module.css";

interface SpotifyDeviceType {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
}

interface SpotifyDeviceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  devices: SpotifyDeviceType[];
  isLoading: boolean;
  onSelectDevice: (deviceId: string) => void;
}

export const SpotifyDeviceSelector = ({
  isOpen,
  onClose,
  devices,
  isLoading,
  onSelectDevice,
}: SpotifyDeviceSelectorProps) => {
  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "computer":
        return <IconDeviceDesktop size={20} />;
      case "smartphone":
        return <IconDeviceMobile size={20} />;
      case "speaker":
        return <IconDeviceSpeaker size={20} />;
      default:
        return <IconDeviceUnknown size={20} />;
    }
  };

  const noDevices = !isLoading && devices.length === 0;

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="No active Spotify device"
      size="md"
      footer={
        noDevices ? (
          <>
            <Button variant="tertiary" onClick={onClose}>
              Cancel
            </Button>
            <Button
              icon={<IconRefresh size={16} />}
              onClick={() => onSelectDevice("refresh")}
            >
              Refresh devices
            </Button>
            <Button
              variant="primary"
              icon={<IconBrandSpotify size={16} />}
              onClick={() => window.open("https://open.spotify.com", "_blank")}
            >
              Open Spotify web player
            </Button>
          </>
        ) : (
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
        )
      }
    >
      <Notice tone="info" title="Playback requires an active device">
        Spotify requires an active device to play music. Please select one of
        your available devices below or open the Spotify app on a device.
      </Notice>

      {isLoading ? (
        <Row gap={2}>
          <Spinner size={16} />
          <Text size="sm" tone="muted">
            Loading available devices...
          </Text>
        </Row>
      ) : noDevices ? (
        <Text size="sm">
          No Spotify devices found. Please open Spotify on any device.
        </Text>
      ) : (
        <Stack gap={2}>
          <Row justify="between">
            <Text size="sm" weight={600}>
              Select a device
            </Text>
            <Button
              variant="tertiary"
              size="sm"
              onClick={() => onSelectDevice("refresh")}
              icon={<IconRefresh size={14} />}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Row>
          <ul className={styles.devices}>
            {devices.map((device: SpotifyDeviceType) => (
              <li key={device.id}>
                <button
                  type="button"
                  className={cx(
                    styles.device,
                    device.is_active && styles.deviceActive,
                  )}
                  onClick={() => onSelectDevice(device.id)}
                >
                  {getDeviceIcon(device.type)}
                  <span>{device.name}</span>
                  {device.is_active && <Tag tone="gold">Active</Tag>}
                </button>
              </li>
            ))}
          </ul>
        </Stack>
      )}
    </Modal>
  );
};

export type { SpotifyDeviceType, SpotifyDeviceSelectorProps };
