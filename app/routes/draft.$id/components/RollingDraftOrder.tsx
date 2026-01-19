import { Box, Group } from "@mantine/core";
import { useEffect, useRef, useState, useCallback } from "react";
import { useResizeObserver } from "@mantine/hooks";
import { DraftPick, HydratedPlayer } from "~/types";
import { DraftOrderChip } from "./DraftOrderChip";
import { getDraftOrderEntries } from "./draftOrderUtils";
import classes from "./RollingDraftOrder.module.css";

type Props = {
  pickOrder: DraftPick[];
  currentPick: number;
  players: HydratedPlayer[];
};

export function RollingDraftOrder({ pickOrder, currentPick, players }: Props) {
  const [containerRef, containerRect] = useResizeObserver();
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const entries = getDraftOrderEntries(pickOrder, players, currentPick);

  const recalculateOffset = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;

    const track = trackRef.current;
    const activeElement = track.querySelector('[data-active="true"]') as HTMLElement;

    if (!activeElement) return;

    const containerWidth = containerRect.width;
    const activeLeft = activeElement.offsetLeft;
    const activeWidth = activeElement.offsetWidth;

    // Center the active element in the container
    const targetOffset = containerWidth / 2 - activeLeft - activeWidth / 2;

    setOffset(targetOffset);
  }, [containerRef, containerRect.width]);

  useEffect(() => {
    recalculateOffset();
  }, [currentPick, pickOrder, recalculateOffset]);

  return (
    <Box
      ref={containerRef}
      style={{
        position: "relative",
        overflow: "hidden",
        width: "100%",
      }}
    >
      {/* Fade edges */}
      <Box className={classes.fadeLeft} />
      <Box className={classes.fadeRight} />

      {/* Rolling track */}
      <Group
        ref={trackRef}
        gap={4}
        wrap="nowrap"
        style={{
          transform: `translateX(${offset}px)`,
          transition: "transform 300ms ease-out",
        }}
      >
        {entries.map((entry) => (
          <DraftOrderChip
            key={`${entry.player.id}-${entry.idx}`}
            entry={entry}
            compact={true}
            chipSize="sm"
          />
        ))}
      </Group>
    </Box>
  );
}
