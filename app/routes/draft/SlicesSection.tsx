import { Button, Group, SimpleGrid } from "@mantine/core";
import { Section, SectionTitle } from "~/components/Section";
import { Slice } from "~/components/Slice";
import { Player, Slice as TSlice } from "~/types";
import { useSortedSlices } from "./useSortedSlices";
import { DraftConfig } from "~/draft";

type Props = {
  fullView?: boolean;
  config: DraftConfig;
  mode: "create" | "draft";
  slices: TSlice[];
  allowSliceSelection?: boolean;
  players?: Player[];
  draftedSlices?: number[];
  onRandomizeSlices?: () => void;
  onAddNewSlice?: () => void;
  onSelectSlice?: (sliceIdx: number) => void;
  onSelectTile?: (sliceIdx: number, tileIdx: number) => void;
  onDeleteTile?: (sliceIdx: number, tileIdx: number) => void;
  onClearSlice?: (sliceIdx: number) => void;
  onRandomizeSlice?: (sliceIdx: number) => void;
};

export function SlicesSection({
  fullView = false,
  config,
  slices: rawSlices,
  players,
  mode = "create",
  allowSliceSelection = true,
  draftedSlices = [],
  onRandomizeSlices,
  onAddNewSlice,
  onSelectTile,
  onDeleteTile,
  onSelectSlice,
  onClearSlice,
  onRandomizeSlice,
}: Props) {
  const sortedSlices = useSortedSlices(rawSlices, draftedSlices);
  const slices =
    mode === "draft"
      ? sortedSlices
      : rawSlices.map((slice, idx) => ({ slice, idx }));

  const xxlCols = config.type !== "wekker" ? 6 : 4;

  const cols = fullView
    ? { base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 4, xxl: xxlCols }
    : { base: 1, sm: 2, md: 3, lg: 2, xxl: 3 };
  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 5 }}>
        <SectionTitle title="Slices">
          {mode === "create" && (
            <Group gap={4}>
              <Button onMouseDown={onRandomizeSlices} variant="light">
                Randomize All Slices
              </Button>
              {/* <Button onMouseDown={onAddNewSlice}>Add New Slice</Button> */}
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
        {slices.map(({ slice, idx }) => (
          <Slice
            key={idx}
            config={config}
            id={`slice-${idx}`}
            name={`Slice ${idx + 1}`}
            mode={mode}
            slice={slice}
            player={players?.find((p) => p.sliceIdx === idx)}
            onSelectTile={(tile) => onSelectTile?.(idx, tile.idx)}
            onDeleteTile={(tile) => onDeleteTile?.(idx, tile.idx)}
            onSelectSlice={
              allowSliceSelection ? () => onSelectSlice?.(idx) : undefined
            }
            onRandomizeSlice={() => onRandomizeSlice?.(idx)}
            onClearSlize={() => onClearSlice?.(idx)}
          />
        ))}
      </SimpleGrid>
    </Section>
  );
}
