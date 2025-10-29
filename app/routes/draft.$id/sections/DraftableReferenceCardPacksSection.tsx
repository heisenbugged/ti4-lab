import { SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { ReferenceCardPack } from "~/components/ReferenceCardPack";

export function DraftableReferenceCardPacksSection() {
  const draftGameMode = useDraft(
    (state) => state.draft.settings.draftGameMode,
  );
  const referenceCardPacks = useDraft(
    (state) => state.draft.availableReferenceCardPacks,
  );
  const { selectReferenceCardPack } = useDraft((state) => state.draftActions);
  const { hydratedPlayers, currentlyPicking, activePlayer } =
    useHydratedDraft();

  const { syncDraft } = useSyncDraft();
  const canSelect =
    currentlyPicking && activePlayer?.referenceCardPackIdx === undefined;

  if (
    draftGameMode !== "twilightsFall" ||
    !referenceCardPacks ||
    referenceCardPacks.length === 0
  ) {
    return null;
  }

  return (
    <Section>
      <SectionTitle title="Faction Reference Card Packs" />
      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="xl">
        {referenceCardPacks.map((pack, packIdx) => {
          const player = hydratedPlayers.find(
            (p) => p.referenceCardPackIdx === packIdx,
          );

          return (
            <ReferenceCardPack
              key={packIdx}
              pack={pack}
              packIdx={packIdx}
              player={player}
              onSelect={
                canSelect
                  ? () => {
                      if (
                        confirm(`Selecting reference card pack ${packIdx + 1}`)
                      ) {
                        selectReferenceCardPack(activePlayer.id, packIdx);
                        syncDraft();
                      }
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
