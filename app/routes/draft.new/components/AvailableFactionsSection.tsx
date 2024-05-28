import { Group, Input, SimpleGrid, Text } from "@mantine/core";
import { FactionId } from "~/types";
import { factionIds, factions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { NewDraftFaction } from "./NewDraftFaction";

type Props = {
  numFactions?: number;
  selectedFactions: FactionId[];
  onChangeNumFactions: (num: number | undefined) => void;
  onToggleFaction: (factionId: FactionId, checked: boolean) => void;
};

export function AvailableFactionsSection({
  numFactions,
  selectedFactions,
  onChangeNumFactions,
  onToggleFaction,
}: Props) {
  const needsMoreFactions = numFactions !== undefined && numFactions < 6;
  return (
    <Section>
      <SectionTitle title="Faction Pool">
        <Group>
          <Text># of factions in draft (min 6):</Text>
          <Input
            placeholder="6 or 9 or 12 etc"
            size="sm"
            type="number"
            min={6}
            value={numFactions ?? ""}
            onChange={(e) => {
              if (e.currentTarget.value.length === 0) {
                onChangeNumFactions(undefined);
                return;
              }
              onChangeNumFactions(parseInt(e.currentTarget.value, 10));
            }}
            error={needsMoreFactions ? "Must be at least 6" : null}
          />
        </Group>
      </SectionTitle>
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, xl: 6, xxl: 8 }}>
        {factionIds.map((factionId) => (
          <NewDraftFaction
            key={factionId}
            faction={factions[factionId]}
            checked={selectedFactions.includes(factionId)}
            onCheck={(checked) => onToggleFaction(factionId, checked)}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
