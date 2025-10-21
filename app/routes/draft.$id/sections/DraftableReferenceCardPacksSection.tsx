import { Box, SimpleGrid, Stack, Text } from "@mantine/core";
import { factions as allFactions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { CompactReferenceCard } from "../components/CompactReferenceCard";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import classes from "~/components/Surface.module.css";

export function DraftableReferenceCardPacksSection() {
  const isTwilightsFall = useDraft((state) => state.draft.settings.isTwilightsFall);
  const referenceCardPacks = useDraft(
    (state) => state.draft.availableReferenceCardPacks
  );
  const { selectReferenceCard } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking && activePlayer?.referenceFaction === undefined;

  if (!isTwilightsFall || !referenceCardPacks || referenceCardPacks.length === 0) {
    return null;
  }

  return (
    <Section>
      <SectionTitle title="Faction Reference Cards" />
      <SimpleGrid cols={{ base: 1, sm: 2, xxl: 3 }} spacing="xl">
        {referenceCardPacks.map((pack, packIdx) => (
          <Box
            key={packIdx}
            p="md"
            className={`${classes.surface} ${classes.withBorder}`}
            style={{
              borderRadius: "var(--mantine-radius-md)",
            }}
          >
            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
              {pack.map((factionId) => {
                const player = hydratedPlayers.find(
                  (p) => p.referenceFaction === factionId
                );

                return (
                  <CompactReferenceCard
                    key={factionId}
                    player={player}
                    disabled={!!player}
                    faction={allFactions[factionId]}
                    onSelect={
                      canSelect
                        ? () => {
                            if (
                              confirm(
                                `Selecting reference card ${allFactions[factionId].name}`
                              )
                            ) {
                              selectReferenceCard(activePlayer.id, factionId);
                              syncDraft();
                            }
                          }
                        : undefined
                    }
                  />
                );
              })}
            </SimpleGrid>
          </Box>
        ))}
      </SimpleGrid>
    </Section>
  );
}
