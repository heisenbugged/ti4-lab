import type { CSSProperties, ReactNode } from "react";
import { cx } from "~/ui";
import { useDraft } from "~/draftStore";
import {
  SlicesSection,
  SliceSummarySection,
  SpeakerOrderSection,
  DraftOrderSection,
  DraftableFactionsSection,
  MapSection,
  DraftSummarySection,
} from "../sections";
import { DraftableMinorFactionsSection } from "../sections/DraftableMinorFactionsSection";
import { DraftablePlayerColorsSection } from "../sections/DraftablePlayerColorsSection";
import { DraftableReferenceCardPacksSection } from "../sections/DraftableReferenceCardPacksSection";
import classes from "./DraftLayout.module.css";

type Props = {
  /** Extra panels at the end of the pool (admin player names). */
  children?: ReactNode;
  /** Height of whatever sticks above the board (pick bar or replay controls), for the pinned map. */
  stickyTop?: string;
};

/**
 * One scroll, no tabs. Desktop: pick order and player cards on top, the pool on the left,
 * the full map pinned on the right. Phone: one column with the map first.
 */
export function DraftBoard({ children, stickyTop }: Props) {
  const settings = useDraft((state) => state.draft.settings);
  const isPresetMapDraft = settings.draftGameMode === "presetMap";
  const showMap =
    settings.draftGameMode !== "twilightsFall" || !!settings.nucleusStyle;

  return (
    <div
      className={cx(
        classes.board,
        !showMap && classes.noTable,
      )}
      style={stickyTop ? ({ "--stack-top": stickyTop } as CSSProperties) : undefined}
    >
      <DraftOrderSection />
      <div className={classes.players}>
        <DraftSummarySection />
      </div>

      <div className={classes.pool}>
        {settings.draftSpeaker && <SpeakerOrderSection />}
        <DraftableFactionsSection />
        <DraftableMinorFactionsSection />
        {!isPresetMapDraft && <SlicesSection />}
        {!isPresetMapDraft && !showMap && <SliceSummarySection />}
        {settings.draftGameMode === "twilightsFall" && (
          <DraftableReferenceCardPacksSection />
        )}
        <DraftablePlayerColorsSection />
        {children}
      </div>

      {showMap && (
        <div className={classes.table}>
          {!isPresetMapDraft && <SliceSummarySection />}
          <div className={classes.mapPin}>
            <MapSection />
          </div>
        </div>
      )}
    </div>
  );
}
