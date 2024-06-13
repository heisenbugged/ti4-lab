import { SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { DraftableSlice } from "../components/DraftableSlice";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { useMemo } from "react";

export function SlicesSection() {
  const slices = useDraft((state) => state.draft.slices);

  const { selectSlice } = useDraft((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { activePlayer, hydratedPlayers, currentlyPicking } =
    useHydratedDraft();

  const sortedSlices = useMemo(() => {
    const draftedSlices = hydratedPlayers
      .map((p) => p.sliceIdx)
      .filter((i) => i !== undefined) as number[];

    return [...slices]
      .map((slice, idx) => ({ slice, idx }))
      .sort((a, b) => {
        if (draftedSlices.includes(a.idx) && !draftedSlices.includes(b.idx)) {
          return 1;
        }
        if (draftedSlices.includes(b.idx) && !draftedSlices.includes(a.idx)) {
          return -1;
        }

        return a.idx - b.idx;
      });
  }, [slices, hydratedPlayers]);

  const canSelect = currentlyPicking && activePlayer?.sliceIdx === undefined;

  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 11 }}>
        <SectionTitle title="Slices" />
      </div>

      <SimpleGrid
        flex={1}
        cols={{ base: 1, sm: 2, md: 3, lg: 2, xxl: 3 }}
        spacing="lg"
        style={{ alignItems: "flex-start" }}
      >
        {sortedSlices.map(({ slice, idx }) => (
          <DraftableSlice
            key={idx}
            id={`slice-${idx}`}
            slice={slice}
            player={hydratedPlayers.find((p) => p.sliceIdx === idx)}
            onSelect={
              canSelect
                ? () => {
                    selectSlice(activePlayer.id, idx);
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
