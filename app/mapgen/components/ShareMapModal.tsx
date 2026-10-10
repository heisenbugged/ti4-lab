import { IconExternalLink } from "@tabler/icons-react";
import { ButtonAnchor, CopyButton, Field, Modal, TextInput } from "~/ui";
import classes from "./MapGenerator.module.css";

type Props = {
  mapString: string;
  shareUrl: string;
  opened: boolean;
  onClose: () => void;
};

export function ShareMapModal({ mapString, shareUrl, opened, onClose }: Props) {
  return (
    <Modal opened={opened} onClose={onClose} size="lg" title="Share map">
      <Field label="Map string">
        <div className={classes.copyField}>
          <TextInput
            value={mapString}
            readOnly
            aria-label="Map string"
            onFocus={(e) => e.currentTarget.select()}
          />
          <CopyButton value={mapString} />
        </div>
      </Field>
      <Field label="Shareable link">
        <div className={classes.copyField}>
          <TextInput
            value={shareUrl}
            readOnly
            aria-label="Shareable link"
            onFocus={(e) => e.currentTarget.select()}
          />
          <CopyButton value={shareUrl} />
        </div>
      </Field>
      <ButtonAnchor
        href={shareUrl}
        target="_blank"
        rel="noreferrer"
        variant="tertiary"
        size="sm"
        iconRight={<IconExternalLink size={14} />}
        className={classes.selfStart}
      >
        Open in new tab
      </ButtonAnchor>
    </Modal>
  );
}
