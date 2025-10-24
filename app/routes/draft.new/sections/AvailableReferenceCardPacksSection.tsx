import { SimpleGrid, Stack, Text } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { factions as allFactions } from "~/data/factionData";
import { NewDraftReferenceCard } from "../components/NewDraftReferenceCard";
import { Surface } from "~/ui";

export function AvailableReferenceCardPacksSection() {
  const referenceCardPacks = useDraft(
    (state) => state.draft.availableReferenceCardPacks,
  );

  if (!referenceCardPacks || referenceCardPacks.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle title="Faction Reference Cards" />
      <Text size="sm" c="dimmed" mb="md">
        Reference cards determine starting units, home systems, and priority
        order. Players will draft these before selecting their actual faction.
      </Text>
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
        {referenceCardPacks.map((pack, packIdx) => {
          const sortedPack = [...pack].sort((a, b) => {
            const factionA = allFactions[a];
            const factionB = allFactions[b];
            const priorityA = factionA.priorityOrder ?? 999;
            const priorityB = factionB.priorityOrder ?? 999;
            return priorityA - priorityB;
          });

          return (
            <Surface key={packIdx} variant="bordered">
              <Stack gap="xs" p="md">
                <Text size="sm" fw="bold" c="dimmed">
                  Pack {packIdx + 1}
                </Text>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xs">
                  {sortedPack.map((factionId) => {
                    const faction = allFactions[factionId];
                    return (
                      <NewDraftReferenceCard
                        key={factionId}
                        faction={faction}
                      />
                    );
                  })}
                </SimpleGrid>
              </Stack>
            </Surface>
          );
        })}
      </SimpleGrid>
    </Section>
  );
}
