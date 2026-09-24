import { Modal, Text, Group, Button } from "@mantine/core";

type Props = {
  opened: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export function EULAModal({ opened, onClose, onAccept }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="End User License Agreement"
      size="xl"
    >
      <Text fw={700} size="lg" mb="md">
        End User License Agreement (EULA)
      </Text>
      <Text size="sm" c="dimmed" mb="xl">
        Effective Date: March 12, 2025
        <br />
        Last Updated: March 12, 2025
      </Text>

      <Text size="sm" mb="md">
        This End User License Agreement ("Agreement") governs your use of TI4
        Lab ("Application"). By using this Application, you agree to the terms
        outlined below.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        1. License Grant
      </Text>
      <Text size="sm" mb="md">
        We grant you a limited, non-exclusive, non-transferable, revocable
        license to use this Application for personal and non-commercial purposes
        in accordance with this Agreement.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        2. Restrictions
      </Text>
      <Text size="sm" mb="xs">
        You may not:
      </Text>
      <Text size="sm" ml="md" mb="md">
        • Reverse engineer, modify, or distribute the Application.
        <br />
        • Use the Application for any unlawful purpose or in violation of
        Spotify's Developer Terms of Service.
        <br />• Use the Application in a way that interferes with Spotify's
        services or infringes on third-party rights.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        3. Ownership
      </Text>
      <Text size="sm" mb="md">
        All intellectual property rights in this Application remain with TI4
        Lab. This Agreement does not transfer any ownership rights.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        4. User Data
      </Text>
      <Text size="sm" mb="md">
        Your use of this Application is subject to our Privacy Policy, which
        outlines how we collect and process data.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        5. Disclaimers & Limitation of Liability
      </Text>
      <Text size="sm" mb="md">
        This Application is provided "as is" without warranties of any kind. We
        are not responsible for any damages or losses resulting from your use of
        the Application.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        6. Termination
      </Text>
      <Text size="sm" mb="md">
        We may suspend or terminate your access to this Application at any time
        if you violate this Agreement.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        7. Governing Law
      </Text>
      <Text size="sm" mb="xl">
        This Agreement is governed by the laws of the United States. Any
        disputes shall be resolved in the courts of the United States.
      </Text>

      <Text size="sm" c="dimmed" mb="xl">
        For questions, contact james@thestrongfamily.org
      </Text>

      <Group justify="flex-end" mt="md">
        <Button variant="subtle" onClick={onClose}>
          Decline
        </Button>
        <Button onClick={onAccept}>Accept</Button>
      </Group>
    </Modal>
  );
}
