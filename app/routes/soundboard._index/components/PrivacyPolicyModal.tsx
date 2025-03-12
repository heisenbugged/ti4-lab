import { Modal, Text, Group, Button } from "@mantine/core";

type Props = {
  opened: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export function PrivacyPolicyModal({ opened, onClose, onAccept }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} title="Privacy Policy" size="xl">
      <Text fw={700} size="lg" mb="md">
        Privacy Policy
      </Text>
      <Text size="sm" c="dimmed" mb="xl">
        Effective Date: March 12, 2025
        <br />
        Last Updated: March 12, 2025
      </Text>

      <Text size="sm" mb="md">
        This Privacy Policy describes how TI4 Lab ("we," "our," or "us")
        collects, uses, and shares your personal information when you use our
        Application.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        1. Information We Collect
      </Text>
      <Text size="sm" mb="md">
        We collect information that you provide directly to us when using our
        Application, including:
      </Text>
      <Text size="sm" ml="md" mb="md">
        • Spotify account information (through Spotify's API)
        <br />
        • Usage data and preferences
        <br />• Technical information about your device and browser
      </Text>

      <Text fw={600} size="sm" mb="xs">
        2. How We Use Your Information
      </Text>
      <Text size="sm" mb="md">
        We use the collected information to:
      </Text>
      <Text size="sm" ml="md" mb="md">
        • Provide and maintain our Application
        <br />• Improve and personalize your experience
      </Text>

      <Text fw={600} size="sm" mb="xs">
        3. Data Sharing
      </Text>
      <Text size="sm" mb="md">
        We do not sell your personal information. We may share your information
        with:
      </Text>
      <Text size="sm" ml="md" mb="md">
        • Service providers who assist in operating our Application
        <br />
        • Law enforcement when required by law
        <br />• Other users only with your explicit consent
      </Text>

      <Text fw={600} size="sm" mb="xs">
        4. Data Security
      </Text>
      <Text size="sm" mb="md">
        We implement appropriate security measures to protect your personal
        information from unauthorized access, alteration, disclosure, or
        destruction.
      </Text>

      <Text fw={600} size="sm" mb="xs">
        5. Your Rights
      </Text>
      <Text size="sm" mb="md">
        You have the right to:
      </Text>
      <Text size="sm" ml="md" mb="md">
        • Access your personal information
        <br />
        • Correct inaccurate data
        <br />
        • Request deletion of your data
        <br />• Opt-out of certain data processing
      </Text>

      <Text fw={600} size="sm" mb="xs">
        6. Contact Us
      </Text>
      <Text size="sm" mb="xl">
        If you have any questions about this Privacy Policy, please contact at
        james@thestrongfamily.org
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
