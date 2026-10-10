import type { CoreSliceData } from "~/hooks/useCoreSliceValues";
import { SliceValuePopover } from "../../Slice/SliceValuePopover";
import type { SliceStats } from "~/mapgen/utils/sliceScoring";
import { speakerOrdinal } from "~/utils/map";
import classes from "./HomeTileContent.module.css";

type Props = {
  seat?: number;
  sliceValue?: number;
  sliceStats: SliceStats;
  coreSliceData?: CoreSliceData;
  fontSize: string;
};

/**
 * Content for home tiles showing slice statistics.
 * Used in map generator to display seat label, slice value, and resource/influence stats.
 */
export function SliceStatsContent({ seat, sliceValue, sliceStats, coreSliceData, fontSize }: Props) {
  return (
    <div className={classes.stack} style={{ fontSize }}>
      {seat !== undefined && <p className={classes.label}>{speakerOrdinal(seat + 1)}</p>}
      {sliceValue !== undefined && (
        <div className={classes.row}>
          <p className={classes.value}>{sliceValue.toFixed(1)}</p>
          {coreSliceData && <SliceValuePopover breakdown={coreSliceData.breakdown} title="Seat value" variant="dark" />}
        </div>
      )}
      <div className={classes.stack}>
        <p className={classes.small}>
          {Math.round(sliceStats.optimalResources * 10) / 10}/{Math.round(sliceStats.optimalInfluence * 10) / 10}
        </p>
        {sliceStats.techs && <p className={classes.small}>{sliceStats.techs}</p>}
      </div>
    </div>
  );
}
