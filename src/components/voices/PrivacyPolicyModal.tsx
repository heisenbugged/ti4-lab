import { Modal, Text, Button, Heading } from "~/ui";
import styles from "./LegalModal.module.css";

type Props = {
  opened: boolean;
  onClose: () => void;
  onAccept: () => void;
};

export function PrivacyPolicyModal({ opened, onClose, onAccept }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Privacy policy"
      size="lg"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Decline
          </Button>
          <Button variant="primary" onClick={onAccept}>
            Accept
          </Button>
        </>
      }
    >
      <div className={styles.legal}>
        <Heading variant="heading">Privacy Policy</Heading>
        <Text size="sm" tone="muted">
          Effective date: March 12, 2025
          <br />
          Last updated: March 12, 2025
        </Text>

        <Text size="sm">
          This Privacy Policy describes how TI4 Lab (“we,” “our,” or “us”)
          collects, uses, and shares your personal information when you use our
          Application.
        </Text>

        <h4 className={styles.h}>1. Information we collect</h4>
        <Text size="sm">
          We collect information that you provide directly to us when using our
          Application, including:
        </Text>
        <Text size="sm" className={styles.list}>
          • Spotify account information (through Spotify’s API)
          <br />
          • Usage data and preferences
          <br />• Technical information about your device and browser
        </Text>

        <h4 className={styles.h}>2. How we use your information</h4>
        <Text size="sm">We use the collected information to:</Text>
        <Text size="sm" className={styles.list}>
          • Provide and maintain our Application
          <br />• Improve and personalize your experience
        </Text>

        <h4 className={styles.h}>3. Data sharing</h4>
        <Text size="sm">
          We do not sell your personal information. We may share your
          information with:
        </Text>
        <Text size="sm" className={styles.list}>
          • Service providers who assist in operating our Application
          <br />
          • Law enforcement when required by law
          <br />• Other users only with your explicit consent
        </Text>

        <h4 className={styles.h}>4. Data security</h4>
        <Text size="sm">
          We implement appropriate security measures to protect your personal
          information from unauthorized access, alteration, disclosure, or
          destruction.
        </Text>

        <h4 className={styles.h}>5. Your rights</h4>
        <Text size="sm">You have the right to:</Text>
        <Text size="sm" className={styles.list}>
          • Access your personal information
          <br />
          • Correct inaccurate data
          <br />
          • Request deletion of your data
          <br />• Opt-out of certain data processing
        </Text>

        <h4 className={styles.h}>6. Contact us</h4>
        <Text size="sm">
          If you have any questions about this Privacy Policy, please contact at
          james@thestrongfamily.org
        </Text>
      </div>
    </Modal>
  );
}
