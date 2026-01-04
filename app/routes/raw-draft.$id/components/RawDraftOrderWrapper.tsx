import { Box, ScrollArea } from "@mantine/core";
import { DraftOrder } from "~/routes/draft.$id/components/DraftOrder";
import { HydratedPlayer } from "~/types";
import { useEffect, useRef } from "react";

type Props = {
  pickOrder: number[];
  currentPick: number;
  players: HydratedPlayer[];
};

export function RawDraftOrderWrapper({ pickOrder, currentPick, players }: Props) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to keep the current pick in view
    if (scrollAreaRef.current) {
      const activeElement = scrollAreaRef.current.querySelector('[data-active="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
      }
    }
  }, [currentPick]);

  return (
    <ScrollArea
      w="100%"
      type="never"
      viewportRef={scrollAreaRef}
    >
      <Box style={{ minWidth: "max-content" }}>
        <DraftOrder pickOrder={pickOrder} currentPick={currentPick} players={players} />
      </Box>
    </ScrollArea>
  );
}
