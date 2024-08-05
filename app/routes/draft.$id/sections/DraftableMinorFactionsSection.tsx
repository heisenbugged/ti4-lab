import { SimpleGrid } from "@mantine/core";
import { factions as allFactions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { DraftableFaction } from "../components/DraftableFaction";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";

export function DraftableMinorFactionsSection() {
  const factions = useDraft((state) => state.draft.availableMinorFactions);
  const { selectMinorFaction } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking && activePlayer?.minorFaction === undefined;

  if (!factions) return null;
  return (
    <Section>
      <SectionTitle title="Available Minor Factions" />
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 3, xl: 4 }}>
        {factions.map((factionId) => {
          const player = hydratedPlayers.find(
            (p) => p.minorFaction === factionId,
          );
          return (
            <DraftableFaction
              key={factionId}
              player={player}
              disabled={!!player}
              faction={allFactions[factionId]}
              onSelect={
                canSelect
                  ? () => {
                      selectMinorFaction(activePlayer.id, factionId);
                      syncDraft();
                    }
                  : undefined
              }
            />
          );
        })}
      </SimpleGrid>
    </Section>
  );
}
