import { SimpleGrid } from "@mantine/core";
import { FactionId, Player } from "~/types";
import { factions as allFactions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { DraftableFaction } from "./DraftableFaction";

type Props = {
  allowFactionSelection?: boolean;
  factions: FactionId[];
  players: Player[];
  onSelectFaction?: (factionId: FactionId) => void;
};

export function DraftableFactionsSection({
  allowFactionSelection = true,
  factions,
  players,
  onSelectFaction,
}: Props) {
  return (
    <Section>
      <SectionTitle title="Available Factions" />
      <SimpleGrid cols={{ base: 3, md: 4, lg: 3, xl: 4 }}>
        {factions.map((factionId) => (
          <DraftableFaction
            key={factionId}
            player={players.find((p) => p.faction === factionId)}
            faction={allFactions[factionId]}
            onSelect={
              allowFactionSelection && onSelectFaction
                ? () => onSelectFaction(factionId)
                : undefined
            }
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
