import { Button, Group, SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { Slice } from "~/components/Slice";
import { DraftSlice, Player, Slice as TSlice } from "~/types";
import { useSortedSlices } from "./useSortedSlices";
import { DraftConfig, draftConfig } from "~/draft";
import { useDraftV2 } from "~/draftStore";

type Props = {
  fullView?: boolean;
  mode: "create" | "draft";
  allowSliceSelection?: boolean;
  players?: Player[];
  draftedSlices?: number[];
  disabled?: boolean;
  onRandomizeSlices?: () => void;
  onSelectSlice?: (sliceIdx: number) => void;
  onSelectTile?: (sliceIdx: number, tileIdx: number) => void;
  onRandomizeSlice?: (sliceIdx: number) => void;
};

export function SlicesSection({
  fullView = false,
  players,
  mode = "create",
  allowSliceSelection = true,
  draftedSlices = [],
  disabled = false,
  onRandomizeSlices,
  onSelectTile,
  onSelectSlice,
  onRandomizeSlice,
}: Props) {
  const config = useDraftV2((state) => draftConfig[state.draft.settings.type]);
  const rawSlices = useDraftV2((state) => state.draft.slices);
  const { removeSystemFromSlice, clearSlice } = useDraftV2(
    (state) => state.actions,
  );
  // TODO: Actually sort the slices
  // const sortedSlices = useSortedSlices(rawSlices, draftedSlices);
  // const slices =
  //   mode === "draft"
  //     ? sortedSlices
  //     : rawSlices.map((slice, idx) => ({ slice, idx }));

  const slices = rawSlices;

  const xxlCols = config.type !== "wekker" ? 6 : 4;

  const cols = fullView
    ? { base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 4, xxl: xxlCols }
    : { base: 1, sm: 2, md: 3, lg: 2, xxl: 3 };
  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 11 }}>
        <SectionTitle title="Slices">
          {mode === "create" && (
            <Group gap={4}>
              <Button onMouseDown={onRandomizeSlices} variant="light">
                Randomize All
              </Button>
            </Group>
          )}
        </SectionTitle>
      </div>

      <SimpleGrid
        flex={1}
        cols={cols}
        spacing="lg"
        style={{ alignItems: "flex-start" }}
      >
        {slices.map((slice, idx) => (
          <Slice
            key={idx}
            config={config}
            id={`slice-${idx}`}
            name={slice.name}
            mode={mode}
            slice={slice}
            player={players?.find((p) => p.sliceIdx === idx)}
            onSelectTile={(tile) => onSelectTile?.(idx, tile.idx)}
            onDeleteTile={(tile) => removeSystemFromSlice(idx, tile.idx)}
            onSelectSlice={
              allowSliceSelection ? () => onSelectSlice?.(idx) : undefined
            }
            onRandomizeSlice={() => onRandomizeSlice?.(idx)}
            onClearSlize={() => clearSlice(idx)}
            disabled={disabled}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
