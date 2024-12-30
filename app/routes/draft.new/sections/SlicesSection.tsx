import { Button, Group, SimpleGrid } from "@mantine/core";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Section, SectionTitle } from "~/components/Section";
import { draftConfig } from "~/draft";
import { useDraft } from "~/draftStore";
import { BuildableSlice } from "../components/BuildableSlice";
import { Tile } from "~/types";
import { systemData } from "~/data/systemData";
import { useState } from "react";

export function SlicesSection() {
  const config = useDraft((state) => draftConfig[state.draft.settings.type]);
  const slices = useDraft((state) => state.draft.slices);
  const {
    removeSystemFromSlice,
    addSystemToSlice,
    clearSlice,
    randomizeSlice,
    randomizeSlices,
    randomizeAll,
    openPlanetFinderForSlice,
    updateSliceName,
  } = useDraft((state) => state.actions);

  const [draggingSlice, setDraggingSlice] = useState<number | undefined>(
    undefined,
  );
  const handleDragStart = (event: DragStartEvent) => {
    const [, originSliceIdx, originTileIdx] = event.active!.id.split("-");
    setDraggingSlice(parseInt(originSliceIdx));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const [, originSliceIdx, originTileIdx] = event.active!.id.split("-");
    const [, destSliceIdx, destTileIdx] = event.over!.id.split("-");

    const destTile: Tile = event.over!.data.current!.tile;
    const originTile: Tile = event.active!.data.current!.tile;

    if (destTile.type !== "SYSTEM" || originTile.type !== "SYSTEM") {
      return;
    }

    const originSystem = systemData[originTile.systemId];
    const destinationSystem = systemData[destTile.systemId];

    removeSystemFromSlice(originSliceIdx, originTileIdx);
    removeSystemFromSlice(destSliceIdx, destTileIdx);
    addSystemToSlice(destSliceIdx, destTileIdx, originSystem);
    addSystemToSlice(originSliceIdx, originTileIdx, destinationSystem);
    setDraggingSlice(undefined);
  };

  const delayedPointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(delayedPointerSensor);

  const xxlCols = config.type !== "wekker" ? 6 : 4;
  const cols = { base: 1, xs: 2, sm: 2, md: 3, lg: 3, xl: 4, xxl: xxlCols };
  return (
    <Section>
      <div style={{ position: "sticky", top: 60, zIndex: 11 }}>
        <SectionTitle title="Slices">
          <Group gap={4}>
            <Button
              onMouseDown={() => {
                if (config.generateMap !== undefined) {
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
        <DndContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          {slices.map((slice, idx) => (
            <div
              key={idx}
              style={{
                zIndex: draggingSlice === idx ? 9999 : undefined,
                position: draggingSlice === idx ? "relative" : undefined,
              }}
            >
              <BuildableSlice
                id={`slice-${idx}`}
                slice={slice}
                onSelectTile={(tile) => openPlanetFinderForSlice(idx, tile.idx)}
                onDeleteTile={(tile) => removeSystemFromSlice(idx, tile.idx)}
                onRandomizeSlice={() => randomizeSlice(idx)}
                onClearSlize={() => clearSlice(idx)}
                onNameChange={(name) => updateSliceName(idx, name)}
              />
            </div>
          ))}
        </DndContext>
      </SimpleGrid>
    </Section>
  );
}
