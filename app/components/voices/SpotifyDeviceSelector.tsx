import { Modal, Alert, Text, Stack, Button, Group, List } from "@mantine/core";
import {
  IconRefresh,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceSpeaker,
  IconDeviceUnknown,
} from "@tabler/icons-react";

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

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="No Active Spotify Device"
      centered
      size="md"
    >
      <Alert color="blue" title="Playback requires an active device" mb="md">
        Spotify requires an active device to play music. Please select one of
        your available devices below or open the Spotify app on a device.
      </Alert>

      {isLoading ? (
        <Text>Loading available devices...</Text>
      ) : devices.length === 0 ? (
        <Stack>
          <Text>
            No Spotify devices found. Please open Spotify on any device.
          </Text>
          <Button
            onClick={() => window.open("https://open.spotify.com", "_blank")}
            fullWidth
          >
            Open Spotify Web Player
          </Button>
          <Group grow mt="md">
            <Button
              onClick={() => onSelectDevice("refresh")}
              variant="filled"
              leftSection={<IconRefresh size={16} />}
            >
              Refresh Devices
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack>
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm">
              Select a device:
            </Text>
            <Button
              variant="subtle"
              size="xs"
              onClick={() => onSelectDevice("refresh")}
              leftSection={<IconRefresh size={14} />}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Group>
          <List spacing="xs">
            {devices.map((device: SpotifyDeviceType) => (
              <List.Item key={device.id} icon={getDeviceIcon(device.type)}>
                <Button
                  variant={device.is_active ? "filled" : "outline"}
                  onClick={() => onSelectDevice(device.id)}
                  fullWidth
                >
                  {device.name} {device.is_active && "(active)"}
                </Button>
              </List.Item>
            ))}
          </List>
          <Button onClick={onClose} variant="outline" mt="md">
            Cancel
          </Button>
        </Stack>
      )}
    </Modal>
  );
};

export type { SpotifyDeviceType, SpotifyDeviceSelectorProps };
