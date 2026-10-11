import { Heading, Modal, Text } from "~/ui";
import classes from "./MapGenerator.module.css";

type Props = {
  opened: boolean;
  onClose: () => void;
};

const SCORE_CARDS = [
  {
    title: "System value",
    items: [
      "Sum of all planet resources + influence",
      "+1 per tech specialty",
      "+1 for legendary planets",
      "+2 for an entropic scar",
    ],
  },
  {
    title: "Distance weighting",
    items: [
      "Adjacent (distance 1): full value, 1.0×",
      "Distance 2: half value, 0.5×",
      "Distance 3: quarter value, 0.25×",
    ],
  },
  {
    title: "Slice score",
    items: [
      "Sum of all weighted system values within 3 spaces of the home system",
    ],
  },
  {
    title: "Balance gap",
    items: ["Difference between the highest and lowest slice scores"],
  },
];

const BALANCE_STEPS = [
  "Finds every swappable system, leaving out Mecatol Rex and home positions.",
  "Tries swapping pairs of systems to find improvements.",
  "Checks the map is legal after each swap: no adjacent matching wormholes, no adjacent anomalies.",
  "Applies the first swap that reduces the gap.",
  "Press Balance again to keep improving.",
];

export function SliceScoringInfoModal({ opened, onClose }: Props) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Slice scoring and balance"
      size="lg"
    >
      <div className={classes.infoBlock}>
        <Heading variant="heading" as="h3">
          How slice scoring works
        </Heading>
        <Text size="sm" tone="muted">
          Each starting position (slice) is scored based on nearby systems.
        </Text>
      </div>
      <div className={classes.scoreCards}>
        {SCORE_CARDS.map((card) => (
          <div key={card.title}>
            <b>{card.title}</b>
            <ul>
              {card.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className={classes.infoBlock}>
        <Heading variant="heading" as="h3">
          How Balance works
        </Heading>
        <Text size="sm" tone="muted">
          Balance reduces the gap by swapping systems.
        </Text>
      </div>
      <ol className={classes.steps}>
        {BALANCE_STEPS.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </Modal>
  );
}
