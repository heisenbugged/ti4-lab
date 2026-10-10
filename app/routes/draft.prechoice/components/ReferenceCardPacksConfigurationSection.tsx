import { IconCards } from "@tabler/icons-react";
import { ListRow, NumberStepper, Panel, Rows } from "~/ui";
import { useDraftSetup } from "../store";

export function ReferenceCardPacksConfigurationSection() {
  const referenceCardPacks = useDraftSetup((state) => state.referenceCardPacks);
  const playerCount = useDraftSetup((state) => state.player.players.length);
  const { numReferenceCardPacks, setNumReferenceCardPacks } = referenceCardPacks;

  return (
    <Panel
      title="Reference cards"
      icon={<IconCards />}
      iconTint="var(--wormhole-alpha)"
    >
      <Rows>
        <ListRow label="Card packs" hint="Each pack has 3 factions (max 10)">
          <NumberStepper
            value={numReferenceCardPacks}
            label="card packs"
            decrease={() => setNumReferenceCardPacks(numReferenceCardPacks - 1)}
            increase={() => setNumReferenceCardPacks(numReferenceCardPacks + 1)}
            decreaseDisabled={numReferenceCardPacks <= playerCount}
            increaseDisabled={numReferenceCardPacks >= 10}
          />
        </ListRow>
      </Rows>
    </Panel>
  );
}
