import { useLanded } from "~/ui";
import { SliceMap } from "./SliceMap";
import { PlanetStatsPill } from "./PlanetStatsPill";
import { SliceHeader } from "./SliceHeader";
import { Slice, Tile } from "~/types";
import { useSlice } from "./useSlice";
import { SliceFeatures } from "./SliceFeatures";
import { SliceValuePopover } from "./SliceValuePopover";
import { DraftConfig } from "~/draft";
import classes from "./Slice.module.css";

type Props = {
  id: string;
  config: DraftConfig;
  slice: Slice;
  mapModifiable?: boolean;
  /** Player colour of whoever took this slice. */
  selectedColor?: string;
  titleLeft?: React.ReactNode;
  titleRight?: React.ReactNode;
  onNameChange?: (name: string) => void;
  onSelectTile?: (tile: Tile) => void;
  onDeleteTile?: (tile: Tile) => void;
  /** Gold brackets: selected but not yet locked in. */
  pending?: boolean;
  className?: string;
};

/** A slice card: name, SV and optimal values, the slice map, and its features. */
export function BaseSlice({
  id,
  config,
  slice,
  titleLeft,
  titleRight,
  mapModifiable = false,
  selectedColor,
  onSelectTile,
  onDeleteTile,
  onNameChange,
  pending,
  className,
}: Props) {
  const { optimal, sliceValue } = useSlice(slice);
  const landed = useLanded(selectedColor ?? null) && !!selectedColor;
  return (
    <article
      data-landed={landed ? "glow" : undefined}
      className={[classes.slice, selectedColor && classes.taken, pending && "ui-bracket", className].filter(Boolean).join(" ")}
      style={selectedColor ? ({ "--p": `var(--player-${selectedColor})`, "--flash": `var(--player-${selectedColor})` } as React.CSSProperties) : undefined}
    >
      <SliceHeader right={titleRight}>
        {mapModifiable && onNameChange ? (
          <input
            className={classes.nameInput}
            value={slice.name}
            aria-label="Slice name"
            onChange={(e) => onNameChange?.(e.target.value)}
          />
        ) : (
          <h4 className={classes.name} title={slice.name}>
            {slice.name}
          </h4>
        )}
        {titleLeft}
      </SliceHeader>

      <div className={classes.stats}>
        <span className={classes.sv}>
          <SliceValuePopover slice={slice}>
            <small>SV</small>
            <b>{sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}</b>
          </SliceValuePopover>
        </span>
        <span className={classes.opt}>
          <small>Optimal</small>
          <PlanetStatsPill resources={optimal.resources} influence={optimal.influence} flex={optimal.flex} />
          <em>({optimal.resources + optimal.influence + optimal.flex})</em>
        </span>
      </div>

      <div className={classes.map}>
        <SliceMap
          id={id}
          sliceHeight={config.sliceHeight}
          sliceConcentricCircles={config.sliceConcentricCircles}
          wOffsetMultiplier={config.wOffsetMultiplier}
          tiles={slice.tiles}
          mapModifiable={mapModifiable}
          onSelectTile={onSelectTile}
          onDeleteTile={onDeleteTile}
        />
      </div>

      <div className={classes.features}>
        <SliceFeatures slice={slice} />
      </div>
    </article>
  );
}
