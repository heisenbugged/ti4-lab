import { SimpleGrid } from "@mantine/core";
import { factions as allFactions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { DraftableFaction } from "../components/DraftableFaction";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";

export function DraftableFactionsSection() {
  const factions = useDraft((state) => state.draft.availableFactions);
  const { selectFaction } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();
  const { syncDraft } = useSyncDraft();
  const canSelect = currentlyPicking && activePlayer?.faction === undefined;

  return (
    <Section>
      <SectionTitle title="Available Factions" />
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 3, xl: 4 }}>
        {factions.map((factionId) => (
          <DraftableFaction
            key={factionId}
            player={hydratedPlayers.find((p) => p.faction === factionId)}
            faction={allFactions[factionId]}
            onSelect={
              canSelect
                ? () => {
                    selectFaction(activePlayer.id, factionId);
                    syncDraft();
                  }
                : undefined
            }
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
