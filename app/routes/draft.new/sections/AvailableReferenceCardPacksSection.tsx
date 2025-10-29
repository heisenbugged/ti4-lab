import { Button, SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { IconDice6Filled } from "@tabler/icons-react";
import { ReferenceCardPack } from "~/components/ReferenceCardPack";

export function AvailableReferenceCardPacksSection() {
  const referenceCardPacks = useDraft(
    (state) => state.draft.availableReferenceCardPacks,
  );
  const randomizeReferenceCardPacks = useDraft(
    (state) => state.actions.randomizeReferenceCardPacks,
  );

  if (!referenceCardPacks || referenceCardPacks.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle title="Faction Reference Cards">
        <Button
          size="xs"
          onMouseDown={randomizeReferenceCardPacks}
          color="gray.7"
          variant="filled"
        >
          <IconDice6Filled size={24} />
        </Button>
      </SectionTitle>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
        {referenceCardPacks.map((pack, packIdx) => (
          <ReferenceCardPack key={packIdx} pack={pack} packIdx={packIdx} />
        ))}
      </SimpleGrid>
    </Section>
  );
}
