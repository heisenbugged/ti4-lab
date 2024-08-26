import { SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { DraftableSpeakerOrder } from "../components/DraftableSpeakerOrder";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";

export const playerSpeakerOrder = [
  "Speaker",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
];

export function SpeakerOrderSection() {
  const { hydratedPlayers, activePlayer, currentlyPicking } =
    useHydratedDraft();
  const { selectSpeakerOrder } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking && activePlayer?.speakerOrder === undefined;

  return (
    <Section>
      <SectionTitle title="Speaker Order" />
      <SimpleGrid cols={{ base: 3, sm: 3, md: 3, lg: 3, xl: 6 }}>
        {playerSpeakerOrder.map((so, idx) => {
          if (idx >= hydratedPlayers.length) return null;

          const player = hydratedPlayers.find((p) => p.speakerOrder === idx);
          return (
            <DraftableSpeakerOrder
              key={so}
              speakerOrder={so}
              player={player}
              onSelect={() => {
                if (confirm(`Selecting speaker order position ${so}`)) {
                  selectSpeakerOrder(activePlayer.id, idx);
                  syncDraft();
                }
              }}
              canSelectSpeakerOrder={canSelect}
            />
          );
        })}
      </SimpleGrid>
    </Section>
  );
}
