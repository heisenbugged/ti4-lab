import { PickButton } from "~/ui";
import { useDraft } from "~/draftStore";
import type { CoreSliceData } from "~/hooks/useCoreSliceValues";
import { SliceValuePopover } from "../../Slice/SliceValuePopover";
import classes from "./HomeTileContent.module.css";

const seatLabel = ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];

type Props = {
  seat?: number;
  coreSliceData?: CoreSliceData;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
  disabled?: boolean;
};

/**
 * Content for empty home tile seats during draft.
 * Shows seat label, slice value with popover, and optional select button.
 */
export function EmptySeatContent({ seat, coreSliceData, selectable, selected, onSelect, disabled }: Props) {
  const hydrated = useDraft((state) => state.hydrated);
  const draftSpeaker = useDraft((state) => state.draft.settings.draftSpeaker);

  return (
    <div className={classes.stack}>
      {!draftSpeaker && hydrated && seat !== undefined && <p className={classes.seat}>{seatLabel[seat]}</p>}
      {coreSliceData && (
        <div className={classes.row}>
          <p className={classes.value}>{coreSliceData.value.toFixed(1)}</p>
          <SliceValuePopover breakdown={coreSliceData.breakdown} title="Seat value" variant="dark" />
        </div>
      )}
      {selectable && (
        <PickButton className={classes.select} onMouseDown={onSelect} disabled={disabled} selected={selected}>
          Select seat
        </PickButton>
      )}
    </div>
  );
}
