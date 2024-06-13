import { SimpleGrid } from "@mantine/core";
import { factions as allFactions } from "~/data/factionData";
import { Section, SectionTitle } from "~/components/Section";
import { DraftableFaction } from "../components/DraftableFaction";
import { useDraftV2 } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";

export function DraftableFactionsSection() {
  const factions = useDraftV2((state) => state.draft.availableFactions);
  const { selectFaction } = useDraftV2((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();
  const { syncing } = useSyncDraft();
  const canSelect = currentlyPicking && !activePlayer?.faction;

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
                ? () => selectFaction(activePlayer.id, factionId)
                : undefined
            }
            disabled={syncing}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
