import { IconDice5 } from "@tabler/icons-react";
import { useDraft } from "~/draftStore";
import { Button } from "~/ui";
import { ReferenceCardPack } from "~/components/ReferenceCardPack";
import { BuilderSection } from "./BuilderSection";
import classes from "./FactionPool.module.css";

export function AvailableReferenceCardPacksSection() {
  const referenceCardPacks = useDraft(
    (state) => state.draft.availableReferenceCardPacks,
  );
  const randomizeReferenceCardPacks = useDraft(
    (state) => state.actions.randomizeReferenceCardPacks,
  );

  if (!referenceCardPacks || referenceCardPacks.length === 0) {
    return null;
  }

  return (
    <BuilderSection
      title="Faction reference cards"
      meta={`${referenceCardPacks.length} packs`}
      actions={
        <Button
          size="sm"
          icon={<IconDice5 />}
          onMouseDown={randomizeReferenceCardPacks}
        >
          Randomize packs
        </Button>
      }
    >
      <div className={classes.packs}>
        {referenceCardPacks.map((pack, packIdx) => (
          <ReferenceCardPack key={packIdx} pack={pack} packIdx={packIdx} />
        ))}
      </div>
    </BuilderSection>
  );
}
