import { IconBox, IconHexagons, IconAlien } from "@tabler/icons-react";
import { Checkbox, Panel } from "~/ui";
import { useDraftSetup } from "../-store";
import classes from "./ContentPacksSection.module.css";

type ContentRowProps = {
  label: string;
  tilesChecked: boolean;
  factionsChecked: boolean;
  onTilesChange: (checked: boolean) => void;
  onFactionsChange: (checked: boolean) => void;
};

function ContentRow({
  label,
  tilesChecked,
  factionsChecked,
  onTilesChange,
  onFactionsChange,
}: ContentRowProps) {
  return (
    <>
      <span className={classes.label}>{label}</span>
      <span>
        <Checkbox
          aria-label={`${label} tiles`}
          checked={tilesChecked}
          onChange={onTilesChange}
        />
      </span>
      <span>
        <Checkbox
          aria-label={`${label} factions`}
          checked={factionsChecked}
          onChange={onFactionsChange}
        />
      </span>
    </>
  );
}

export function ContentPacksSection() {
  const content = useDraftSetup((state) => state.content);
  const {
    withBaseTiles,
    withBaseFactions,
    withPokTiles,
    withPokFactions,
    withTETiles,
    withTEFactions,
    withDiscordantTiles,
    withDiscordantFactions,
  } = content.flags;

  return (
    <Panel title="Content packs" icon={<IconBox />} iconTint="var(--ion)">
      <div className={classes.packs}>
        <span className={classes.head} aria-hidden />
        <span className={classes.head}>
          <IconHexagons size={13} />
          Tiles
        </span>
        <span className={classes.head}>
          <IconAlien size={13} />
          Factions
        </span>
        <ContentRow
          label="Base game"
          tilesChecked={withBaseTiles}
          factionsChecked={withBaseFactions}
          onTilesChange={content.setWithBaseTiles}
          onFactionsChange={content.setWithBaseFactions}
        />
        <ContentRow
          label="Prophecy of Kings"
          tilesChecked={withPokTiles}
          factionsChecked={withPokFactions}
          onTilesChange={content.setWithPokTiles}
          onFactionsChange={content.setWithPokFactions}
        />
        <ContentRow
          label="Thunder's Edge"
          tilesChecked={withTETiles}
          factionsChecked={withTEFactions}
          onTilesChange={content.setWithTETiles}
          onFactionsChange={content.setWithTEFactions}
        />
        <ContentRow
          label="Discordant Stars"
          tilesChecked={withDiscordantTiles}
          factionsChecked={withDiscordantFactions}
          onTilesChange={content.setWithDiscordantTiles}
          onFactionsChange={content.setWithDiscordantFactions}
        />
      </div>
    </Panel>
  );
}
