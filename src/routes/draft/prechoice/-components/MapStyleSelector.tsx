import { IconChevronRight, IconSettings } from "@tabler/icons-react";
import { IconButton, cx } from "~/ui";
import { MAPS, ChoosableDraftType } from "../-maps";
import type { SliceSettingsFormatType } from "~/draft/sliceSettings";
import { getSettingsFormatType } from "../-utils";
import classes from "./MapStyleSelector.module.css";

type Props = {
  playerCount: number;
  selectedMapType: ChoosableDraftType;
  onMapTypeHover: (mapType: ChoosableDraftType | undefined) => void;
  onMapTypeSelect: (mapType: ChoosableDraftType) => void;
  onOpenSettings: (formatType: SliceSettingsFormatType) => void;
  onOpenMinorFactionsInfo: () => void;
};

/** The styles available for the current player count. Hover previews, press picks. */
export function MapStyleSelector({
  playerCount,
  selectedMapType,
  onMapTypeHover,
  onMapTypeSelect,
  onOpenSettings,
  onOpenMinorFactionsInfo,
}: Props) {
  return (
    <div className={classes.list} onMouseLeave={() => onMapTypeHover(undefined)}>
      <div className={classes.styles}>
        {Object.entries(MAPS).map(
          ([type, { title, playerCount: mapPlayerCount }]) => {
            if (mapPlayerCount !== playerCount) return null;

            const draftType = type as ChoosableDraftType;
            const isSelected = selectedMapType === type;
            const settingsFormat = getSettingsFormatType(draftType);

            return (
              <div
                key={type}
                className={cx(classes.style, isSelected && classes.on)}
              >
                <button
                  type="button"
                  className={classes.pick}
                  aria-pressed={isSelected}
                  onMouseOver={() => onMapTypeHover(draftType)}
                  onFocus={() => onMapTypeHover(draftType)}
                  onBlur={() => onMapTypeHover(undefined)}
                  onMouseDown={(e) => {
                    if (e.button === 0) onMapTypeSelect(draftType);
                  }}
                  onClick={(e) => {
                    // Keyboard activation doesn't fire mousedown.
                    if (e.detail === 0) onMapTypeSelect(draftType);
                  }}
                >
                  <i />
                  <span>{title}</span>
                  <IconChevronRight size={14} />
                </button>
                {settingsFormat ? (
                  <IconButton
                    label={`${title} slice settings`}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      onMapTypeSelect(draftType);
                      onOpenSettings(settingsFormat);
                    }}
                    onClick={(e) => {
                      if (e.detail === 0) {
                        onMapTypeSelect(draftType);
                        onOpenSettings(settingsFormat);
                      }
                    }}
                  >
                    <IconSettings size={16} />
                  </IconButton>
                ) : (
                  <span className={classes.nogear} />
                )}
              </div>
            );
          },
        )}
      </div>

      <button
        type="button"
        className={classes.info}
        onMouseDown={(e) => {
          if (e.button === 0) onOpenMinorFactionsInfo();
        }}
        onClick={(e) => {
          if (e.detail === 0) onOpenMinorFactionsInfo();
        }}
      >
        Minor factions info
        <IconChevronRight size={14} />
      </button>
    </div>
  );
}
