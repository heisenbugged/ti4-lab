import { SimpleGrid } from "@mantine/core";
import type { ReactNode } from "react";
import { factions as allFactions } from "~/data/factionData";
import type { Faction, FactionId } from "~/types";
import { NewDraftReferenceCard } from "~/routes/draft.new/components/NewDraftReferenceCard";
import { sortReferencePack } from "./referenceCards";

type Props = {
  pack: FactionId[];
  cols?: { base?: number; sm?: number; md?: number; lg?: number };
  spacing?: string | number;
  renderCard?: (factionId: FactionId, faction: Faction) => ReactNode;
};

export function ReferenceCardGrid({
  pack,
  cols = { base: 1, sm: 2, md: 3 },
  spacing = "xs",
  renderCard,
}: Props) {
  const sortedPack = sortReferencePack(pack);

  return (
    <SimpleGrid cols={cols} spacing={spacing}>
      {sortedPack.map((factionId) => {
        const faction = allFactions[factionId];
        if (!faction) return null;
        return (
          <div key={factionId}>
            {renderCard ? renderCard(factionId, faction) : <NewDraftReferenceCard faction={faction} />}
          </div>
        );
      })}
    </SimpleGrid>
  );
}
