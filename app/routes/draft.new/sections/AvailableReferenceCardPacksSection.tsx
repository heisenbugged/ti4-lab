import { SimpleGrid, Stack, Text } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { factions as allFactions } from "~/data/factionData";
import { NewDraftReferenceCard } from "../components/NewDraftReferenceCard";

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
      <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing="xl">
        {referenceCardPacks.map((pack, packIdx) => (
          <Stack key={packIdx} gap="xs">
            <Text size="sm" fw="bold" c="dimmed">
              Pack {packIdx + 1}
            </Text>
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }}>
              {pack.map((factionId) => {
                const faction = allFactions[factionId];
                return (
                  <NewDraftReferenceCard key={factionId} faction={faction} />
                );
              })}
            </SimpleGrid>
          </Stack>
        ))}
      </SimpleGrid>
    </Section>
  );
}
