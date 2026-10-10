import { IconDice5, IconPlus } from "@tabler/icons-react";
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

import { Button } from "~/ui";
import { BuilderSection } from "./BuilderSection";
import { draftConfig } from "~/draft";
import { useDraft } from "~/draftStore";
import { BuildableSlice } from "../components/BuildableSlice";
import { Tile } from "~/types";
import { systemData } from "~/data/systemData";
import { useState } from "react";
import { getMaxAvailableSlices } from "~/routes/draft.prechoice/utils";
import classes from "./SlicesSection.module.css";

export function SlicesSection() {
  const config = useDraft((state) => draftConfig[state.draft.settings.type]);
  const slices = useDraft((state) => state.draft.slices);
  const numPlayers = useDraft((state) => state.draft.players.length);
  const maxSlices = useDraft((state) =>
    getMaxAvailableSlices(
      state.draft.settings.type,
      state.draft.settings.tileGameSets,
      !!state.draft.settings.sliceGenerationConfig?.hasMinorFactions,
    ),
  );
  const {
    removeSystemFromSlice,
    addSystemToSlice,
    clearSlice,
    randomizeSlice,
    randomizeSlices,
    randomizeAll,
    openPlanetFinderForSlice,
    updateSliceName,
    addSlice,
    removeSlice,
  } = useDraft((state) => state.actions);

  const [draggingSlice, setDraggingSlice] = useState<number | undefined>(
    undefined,
  );
  const handleDragStart = (event: DragStartEvent) => {
    const [, originSliceIdx] = String(event.active!.id).split("-");
    setDraggingSlice(parseInt(originSliceIdx));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const [, originSliceIdx, originTileIdx] = String(event.active!.id).split(
      "-",
    );
    const [, destSliceIdx, destTileIdx] = String(event.over!.id).split("-");

    const destTile: Tile = event.over!.data.current!.tile;
    const originTile: Tile = event.active!.data.current!.tile;

    if (destTile.type !== "SYSTEM" || originTile.type !== "SYSTEM") {
      return;
    }

    const originSystem = systemData[originTile.systemId];
    const destinationSystem = systemData[destTile.systemId];

    removeSystemFromSlice(parseInt(originSliceIdx), parseInt(originTileIdx));
    removeSystemFromSlice(parseInt(destSliceIdx), parseInt(destTileIdx));
    addSystemToSlice(
      parseInt(destSliceIdx),
      parseInt(destTileIdx),
      originSystem,
    );
    addSystemToSlice(
      parseInt(originSliceIdx),
      parseInt(originTileIdx),
      destinationSystem,
    );
    setDraggingSlice(undefined);
  };

  const delayedPointerSensor = useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  });
  const sensors = useSensors(delayedPointerSensor);

  const incomplete = slices.filter((slice) =>
    slice.tiles.some((t) => t.type === "OPEN"),
  ).length;
  const meta =
    `${slices.length} ${slices.length === 1 ? "slice" : "slices"}` +
    (incomplete > 0
      ? `, ${incomplete} ${incomplete === 1 ? "needs a tile" : "need tiles"}`
      : "");

  return (
    <BuilderSection
      title="Slices"
      sticky
      meta={meta}
      actions={
        <Button
          size="sm"
          icon={<IconDice5 />}
          onMouseDown={() => {
            if (config.generateMap !== undefined) {
              randomizeAll();
            } else {
              randomizeSlices();
            }
          }}
        >
          Randomize all
        </Button>
      }
    >
      <div className={classes.grid}>
        <DndContext
          onDragEnd={handleDragEnd}
          onDragStart={handleDragStart}
          sensors={sensors}
        >
          {slices.map((slice, idx) => (
            <div
              key={idx}
              className={classes.slice}
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
                canRemove={slices.length > numPlayers}
                onRemoveSlice={() => removeSlice(idx)}
                onNameChange={(name) => updateSliceName(idx, name)}
              />
            </div>
          ))}
        </DndContext>
        {slices.length < maxSlices && (
          <button type="button" className={classes.addSlice} onClick={addSlice}>
            <span className={classes.addIcon}>
              <IconPlus aria-hidden />
            </span>
            <b>Add slice</b>
            <small>Generated from unused systems with this format&apos;s rules</small>
          </button>
        )}
      </div>
    </BuilderSection>
  );
}
