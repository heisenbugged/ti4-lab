import { Button, Group, SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { draftConfig } from "~/draft";
import { useDraft } from "~/draftStore";
import { BuildableSlice } from "../components/BuildableSlice";

export function SlicesSection() {
  const config = useDraft((state) => draftConfig[state.draft.settings.type]);
  const slices = useDraft((state) => state.draft.slices);
  const {
    removeSystemFromSlice,
    clearSlice,
    randomizeSlice,
    randomizeSlices,
    randomizeAll,
    openPlanetFinderForSlice,
  } = useDraft((state) => state.actions);

  const xxlCols = config.type !== "wekker" ? 6 : 4;
  const cols = { base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 4, xxl: xxlCols };
  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 11 }}>
        <SectionTitle title="Slices">
          <Group gap={4}>
            <Button
              onMouseDown={() => {
                if (config.type === "heisen" || config.type === "heisen8p") {
                  randomizeAll();
                } else {
                  randomizeSlices();
                }
              }}
              variant="light"
            >
              Randomize All
            </Button>
          </Group>
        </SectionTitle>
      </div>

      <SimpleGrid
        flex={1}
        cols={cols}
        spacing="lg"
        style={{ alignItems: "flex-start" }}
      >
        {slices.map((slice, idx) => (
          <BuildableSlice
            key={idx}
            id={`slice-${idx}`}
            slice={slice}
            onSelectTile={(tile) => openPlanetFinderForSlice(idx, tile.idx)}
            onDeleteTile={(tile) => removeSystemFromSlice(idx, tile.idx)}
            onRandomizeSlice={() => randomizeSlice(idx)}
            onClearSlize={() => clearSlice(idx)}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
