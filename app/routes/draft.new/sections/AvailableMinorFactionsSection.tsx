import { IconDice5 } from "@tabler/icons-react";
import { factions } from "~/data/factionData";
import { IconButton, NumberStepper, Text } from "~/ui";
import { NewDraftFaction } from "../components/NewDraftFaction";
import { useDraft } from "~/draftStore";
import { BuilderSection } from "./BuilderSection";
import classes from "./FactionPool.module.css";

export function AvailableMinorFactionsSection() {
  const {
    addRandomMinorFaction,
    removeLastMinorFaction,
    randomizeMinorFactions,
    removeMinorFaction,
  } = useDraft((state) => state.actions);

  const factionPool = useDraft((state) =>
    state.factionPool.filter((f) => !state.draft.availableFactions.includes(f)),
  );
  const numFactions = useDraft(
    (state) => state.draft.settings.numMinorFactions,
  );
  const availableFactions = useDraft(
    (state) => state.draft.availableMinorFactions,
  );

  if (!numFactions || !availableFactions) return null;

  return (
    <BuilderSection
      title="Minor faction pool"
      meta={`${availableFactions.length} minor factions`}
      actions={
        <span className={classes.tools}>
          <Text as="span" size="xs" tone="muted" weight={600}>
            Count
          </Text>
          <NumberStepper
            size="sm"
            value={numFactions}
            label="minor factions in pool"
            decrease={removeLastMinorFaction}
            increase={addRandomMinorFaction}
            decreaseDisabled={numFactions <= 6}
            increaseDisabled={numFactions >= factionPool.length}
          />
          <IconButton
            variant="outline"
            label="Randomize minor factions"
            onMouseDown={randomizeMinorFactions}
          >
            <IconDice5 />
          </IconButton>
        </span>
      }
    >
      <div className={classes.grid}>
        {availableFactions.map((factionId) => (
          <NewDraftFaction
            key={factionId}
            faction={factions[factionId]}
            onRemove={() => removeMinorFaction(factionId)}
            removeEnabled={availableFactions.length > 6}
          />
        ))}
      </div>
    </BuilderSection>
  );
}
