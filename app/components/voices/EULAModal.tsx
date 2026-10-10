import { Modal, Text, Button, Heading } from "~/ui";
import styles from "./LegalModal.module.css";

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
      title="End user license agreement"
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
        <Heading variant="heading">End User License Agreement (EULA)</Heading>
        <Text size="sm" tone="muted">
          Effective date: March 12, 2025
          <br />
          Last updated: March 12, 2025
        </Text>

        <Text size="sm">
          This End User License Agreement (“Agreement”) governs your use of TI4
          Lab (“Application”). By using this Application, you agree to the terms
          outlined below.
        </Text>

        <h4 className={styles.h}>1. License grant</h4>
        <Text size="sm">
          We grant you a limited, non-exclusive, non-transferable, revocable
          license to use this Application for personal and non-commercial
          purposes in accordance with this Agreement.
        </Text>

        <h4 className={styles.h}>2. Restrictions</h4>
        <Text size="sm">You may not:</Text>
        <Text size="sm" className={styles.list}>
          • Reverse engineer, modify, or distribute the Application.
          <br />
          • Use the Application for any unlawful purpose or in violation of
          Spotify’s Developer Terms of Service.
          <br />• Use the Application in a way that interferes with Spotify’s
          services or infringes on third-party rights.
        </Text>

        <h4 className={styles.h}>3. Ownership</h4>
        <Text size="sm">
          All intellectual property rights in this Application remain with TI4
          Lab. This Agreement does not transfer any ownership rights.
        </Text>

        <h4 className={styles.h}>4. User data</h4>
        <Text size="sm">
          Your use of this Application is subject to our Privacy Policy, which
          outlines how we collect and process data.
        </Text>

        <h4 className={styles.h}>5. Disclaimers & limitation of liability</h4>
        <Text size="sm">
          This Application is provided “as is” without warranties of any kind.
          We are not responsible for any damages or losses resulting from your
          use of the Application.
        </Text>

        <h4 className={styles.h}>6. Termination</h4>
        <Text size="sm">
          We may suspend or terminate your access to this Application at any
          time if you violate this Agreement.
        </Text>

        <h4 className={styles.h}>7. Governing law</h4>
        <Text size="sm">
          This Agreement is governed by the laws of the United States. Any
          disputes shall be resolved in the courts of the United States.
        </Text>

        <Text size="sm" tone="muted">
          For questions, contact james@thestrongfamily.org
        </Text>
      </div>
    </Modal>
  );
}
