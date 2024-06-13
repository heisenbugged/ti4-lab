import { Button, Group, SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { Slice } from "~/components/Slice";
import { draftConfig } from "~/draft";
import { useDraftV2 } from "~/draftStore";
import { DraftableSlice } from "../components/DraftableSlice";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";

type Props = {
  draftedSlices?: number[];
};

export function SlicesSection({ draftedSlices = [] }: Props) {
  const slices = useDraftV2((state) => state.draft.slices);
  const { selectSlice } = useDraftV2((state) => state.draftActions);
  const { syncDraft } = useSyncDraft();
  const { activePlayer, hydratedPlayers } = useHydratedDraft();

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
        {slices.map((slice, idx) => (
          <DraftableSlice
            id={`slice-${idx}`}
            slice={slice}
            player={hydratedPlayers.find((p) => p.sliceIdx === idx)}
            onSelect={() => {
              selectSlice(activePlayer.id, idx);
              syncDraft();
            }}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
