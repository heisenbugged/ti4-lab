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
  const defaultInputValue =
    selectedFactions.length > 0 ? selectedFactions.length : "";
  return (
    <Section>
      <SectionTitle title="Faction Pool">
        <Group>
          <Text># of factions in draft:</Text>
          <Input
            placeholder="6 or 9 or 12 etc"
            size="sm"
            type="number"
            min={6}
            value={numFactions ?? defaultInputValue}
            onChange={(e) => {
              if (e.currentTarget.value.length === 0) {
                onChangeNumFactions(undefined);
                return;
              }
              onChangeNumFactions(parseInt(e.currentTarget.value, 10));
            }}
          />
        </Group>
      </SectionTitle>
      <SimpleGrid cols={{ base: 1, xs: 2, sm: 3, md: 4, lg: 2, xl: 3, xxl: 4 }}>
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
