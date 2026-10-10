import { IconDice5, IconSettings } from "@tabler/icons-react";
import { factions } from "~/data/factionData";
import { IconButton, NumberStepper, Text } from "~/ui";
import { NewDraftFaction } from "../components/NewDraftFaction";
import { useDraft, useHasBanPhase } from "~/draftStore";
import type { FactionId } from "~/types";
import { BuilderSection } from "./BuilderSection";
import classes from "./FactionPool.module.css";

export function AvailableFactionsSection() {
  const {
    addRandomFaction,
    removeLastFaction,
    randomizeFactions,
    removeFaction,
    openFactionSettings,
  } = useDraft((state) => state.actions);

  const hasBanPhase = useHasBanPhase();

  const factionPool = useDraft((state) =>
    state.factionPool.filter(
      (f: FactionId) => !state.draft.availableMinorFactions?.includes(f),
    ),
  );

  const { numFactions, availableFactions, playerCount } = useDraft((state) => ({
    numFactions: state.draft.settings.numFactions,
    availableFactions: state.draft.availableFactions,
    playerCount: state.draft.players.length,
  }));

  const draftGameMode = useDraft(
    (state) => state.draft.settings.draftGameMode,
  );

  const isTwilightsFall = draftGameMode === "twilightsFall";
  const noun = isTwilightsFall ? "kings" : "factions";

  if (hasBanPhase) {
    return (
      <BuilderSection
        title="Faction pool"
        actions={
          <span className={classes.tools}>
            <Text as="span" size="xs" tone="muted" weight={600}>
              Count
            </Text>
            <NumberStepper
              size="sm"
              value={numFactions}
              label="factions in pool"
              decrease={removeLastFaction}
              increase={addRandomFaction}
              decreaseDisabled={numFactions <= 6}
              increaseDisabled={numFactions >= factionPool.length}
            />
          </span>
        }
      >
        <Text tone="muted" size="sm">
          The faction pool is made during the draft, after the ban phase.
        </Text>
      </BuilderSection>
    );
  }

  const minFactions = isTwilightsFall ? playerCount : 6;
  const maxFactions = isTwilightsFall ? 8 : factionPool.length;

  return (
    <BuilderSection
      title={isTwilightsFall ? "Kings pool" : "Faction pool"}
      meta={`${availableFactions.length} ${noun}`}
      actions={
        <span className={classes.tools}>
          <Text as="span" size="xs" tone="muted" weight={600}>
            Count
          </Text>
          <NumberStepper
            size="sm"
            value={numFactions}
            label={`${noun} in pool`}
            decrease={removeLastFaction}
            increase={addRandomFaction}
            decreaseDisabled={numFactions <= minFactions}
            increaseDisabled={numFactions >= maxFactions}
          />
          <IconButton
            variant="outline"
            label={isTwilightsFall ? "Randomize kings" : "Randomize factions"}
            onMouseDown={randomizeFactions}
          >
            <IconDice5 />
          </IconButton>
          {!isTwilightsFall && (
            <IconButton
              variant="outline"
              label="Configure pool"
              onMouseDown={openFactionSettings}
            >
              <IconSettings />
            </IconButton>
          )}
        </span>
      }
    >
      <div className={classes.grid}>
        {availableFactions.map((factionId, idx) => (
          <NewDraftFaction
            key={`${factionId}-${idx}`}
            faction={factions[factionId]}
            onRemove={() => removeFaction(factionId)}
            removeEnabled={availableFactions.length > minFactions}
          />
        ))}
      </div>
    </BuilderSection>
  );
}
