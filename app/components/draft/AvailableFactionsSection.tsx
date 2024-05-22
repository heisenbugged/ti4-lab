import { Group, Input, SimpleGrid, Text } from "@mantine/core";
import { Section, SectionTitle } from "./Section";
import { FactionId } from "~/types";
import { factionIds, factions } from "~/data/factionData";
import { NewDraftFaction } from "../NewDraftFaction";

type Props = {
  selectedFactions: FactionId[];
  onToggleFaction: (factionId: FactionId, checked: boolean) => void;
};

export function AvailableFactionsSection({
  selectedFactions,
  onToggleFaction,
}: Props) {
  return (
    <Section>
      <SectionTitle title="Available Factions">
        <Group>
          <Text>Number of factions in draft:</Text>
          <Input
            placeholder="6 or 9 or 12 etc"
            size="sm"
            type="number"
            min={6}
            value={selectedFactions.length > 0 ? selectedFactions.length : ""}
          />
        </Group>
      </SectionTitle>
      <SimpleGrid cols={{ base: 3, md: 4, lg: 3, xl: 4 }}>
        {factionIds.map((factionId) => (
          <NewDraftFaction
            key={factionId}
            faction={factions[factionId]}
            onCheck={(checked) => onToggleFaction(factionId, checked)}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
