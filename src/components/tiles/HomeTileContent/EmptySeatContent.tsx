import { PickButton } from "~/ui";
import { useDraft } from "~/draftStore";
import type { CoreSliceData } from "~/hooks/useCoreSliceValues";
import { SliceValuePopover } from "../../Slice/SliceValuePopover";
import { speakerOrdinal } from "~/utils/map";
import classes from "./HomeTileContent.module.css";

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
      {!draftSpeaker && hydrated && seat !== undefined && <p className={classes.seat}>{speakerOrdinal(seat + 1)}</p>}
      {coreSliceData && (
        <div className={classes.row}>
          <p className={classes.value}>{coreSliceData.value.toFixed(1)}</p>
          <SliceValuePopover breakdown={coreSliceData.breakdown} title="Seat value" variant="dark" />
        </div>
      )}
      {selectable && (
        <PickButton
          className={classes.select}
          // Mouse-down (not click) so map drag handling can't swallow it; preventDefault stops the
          // browser moving focus back here, which would steal it from the confirm dialog (Enter).
          onMouseDown={(e) => {
            e.preventDefault();
            onSelect?.();
          }}
          disabled={disabled}
          selected={selected}
        >
          Select seat
        </PickButton>
      )}
    </div>
  );
}
