import { FactionId } from "~/types";
import { Button, Heading, Text, cx } from "~/ui";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { useState } from "react";
import styles from "../session.module.css";

type Props = {
  factionIds: FactionId[];
  onFactionSelected: (factionId: FactionId) => void;
};

export function SelectFaction({ factionIds, onFactionSelected }: Props) {
  const [selectedFaction, setSelectedFaction] = useState<FactionId | undefined>(
    undefined,
  );
  const handleFactionPressed = (factionId: FactionId) => {
    setSelectedFaction(factionId);
  };

  const handleContinuePressed = () => {
    if (!selectedFaction) return;
    onFactionSelected(selectedFaction);
  };
  return (
    <div className={styles.page}>
      <div className={styles.pickerHead}>
        <Heading variant="title" as="h1">
          Select faction
        </Heading>
        <Text size="sm" tone="muted">
          Pick the faction you&apos;re playing. Your buttons play its lines on
          the table&apos;s soundboard.
        </Text>
      </div>
      <div className={styles.factionList} role="radiogroup">
        {factionIds.map((factionId) => {
          const selected = selectedFaction === factionId;
          return (
            <button
              key={factionId}
              type="button"
              role="radio"
              aria-checked={selected}
              className={cx(
                styles.factionOption,
                selected && styles.factionOptionSelected,
                selected && "ui-bracket",
              )}
              onClick={() => handleFactionPressed(factionId)}
            >
              <FactionIcon
                faction={factionId}
                style={{ width: 32, height: 32 }}
              />
              <span>{factions[factionId].name}</span>
            </button>
          );
        })}
      </div>

      <div className={styles.stickyFoot}>
        <div className={styles.stickyInner}>
          <Button
            variant="primary"
            size="lg"
            onClick={handleContinuePressed}
            disabled={!selectedFaction}
            block
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}
