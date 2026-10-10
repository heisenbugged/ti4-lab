import type { ReactNode } from "react";
import { factions as allFactions } from "~/data/factionData";
import type { Faction, FactionId } from "~/types";
import { Grid, type Space } from "~/ui";
import { NewDraftReferenceCard } from "~/routes/draft.new/components/NewDraftReferenceCard";
import { sortReferencePack } from "./referenceCards";

type Props = {
  pack: FactionId[];
  cols?: { base?: number; xs?: number; sm?: number; md?: number; lg?: number };
  /** Gap between cards: "xs" | "sm" | "md" | "lg" | "xl", or a space step. */
  spacing?: string | number;
  renderCard?: (factionId: FactionId, faction: Faction) => ReactNode;
};

const spacingSteps: Record<string, Space> = { xs: 2, sm: 3, md: 4, lg: 5, xl: 6 };

export function ReferenceCardGrid({
  pack,
  cols = { base: 1, sm: 2, md: 3 },
  spacing = "xs",
  renderCard,
}: Props) {
  const sortedPack = sortReferencePack(pack);
  const gap: Space =
    typeof spacing === "number"
      ? (Math.min(8, Math.max(0, spacing)) as Space)
      : (spacingSteps[spacing] ?? 2);

  return (
    <Grid cols={cols} gap={gap}>
      {sortedPack.map((factionId) => {
        const faction = allFactions[factionId];
        if (!faction) return null;
        return (
          <div key={factionId} style={{ minWidth: 0, display: "flex" }}>
            {renderCard ? (
              renderCard(factionId, faction)
            ) : (
              <NewDraftReferenceCard faction={faction} />
            )}
          </div>
        );
      })}
    </Grid>
  );
}
