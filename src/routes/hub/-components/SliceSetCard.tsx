import { type CSSProperties } from "react";
import { useRouter } from "@tanstack/react-router";
import { IconArchive, IconArchiveOff, IconCopy, IconDots, IconEye, IconPencil, IconPlayerPlay } from "@tabler/icons-react";
import { LegendaryDisplay, TechSkipsDisplay } from "~/components/PresetMapBadges";
import { TechIcon } from "~/components/icons/TechIcon";
import { LegendaryIcon } from "~/components/icons/LegendaryIcon";
import { Wormhole } from "~/components/features/Wormhole";
import { editHubSliceSet, type HubSliceSet } from "~/server/hub.functions";
import type { DraftType, Wormhole as TWormhole } from "~/types";
import { Button, IconButton, Menu, MenuItem, MenuSeparator, ValuePill, cx, notify } from "~/ui";
import { describeStrength, sliceValueStrength, STRENGTH_BANDS, type SliceValueStrength } from "~/utils/sliceValueStrength";
import { formatName, formatValue, sliceSetStats, type SliceSummary } from "../-utils";
import classes from "../hub.module.css";

type Props = {
  set: HubSliceSet;
  isOwner: boolean;
  starting: boolean;
  onStart: () => void;
  onView: () => void;
  onRename: () => void;
};

const WORMHOLE_ORDER: TWormhole[] = ["ALPHA", "BETA", "GAMMA", "DELTA", "EPSILON"];

export function SliceSetCard({ set, isOwner, starting, onStart, onView, onRename }: Props) {
  const router = useRouter();
  const stats = sliceSetStats(set);
  const sliceCount = stats.slices.length;
  const type = set.data.settings.type as DraftType;
  const average = Math.round(stats.average * 10) / 10;
  const strength = sliceCount > 0 ? sliceValueStrength(type, stats.average, "averages") : undefined;

  const setArchived = async (archived: boolean) => {
    await editHubSliceSet({ data: { sliceSetId: set.id, archived } });
    notify({ tone: "success", title: archived ? "Slice set archived" : "Slice set restored", message: set.title });
    router.invalidate();
  };

  const copyPresetName = async () => {
    await navigator.clipboard.writeText(set.presetName);
    notify({ tone: "success", title: "Preset name copied", message: `/labdraft preset:${set.presetName}` });
  };

  const wormholes = WORMHOLE_ORDER.filter((w) => stats.wormholes[w]);

  return (
    <article className={cx(classes.set, set.archived && classes.archivedRow)}>
      <header className={classes.setHead}>
        <div className={classes.setHeading}>
          <h3 className={classes.setTitle}>{set.title}</h3>
          <div className={classes.meta}>
            <span>{formatName(set.data.settings)}</span>
            <span>{set.playerCount} players</span>
            <span>{set.keepFactions ? "Factions kept" : "Factions re-rolled"}</span>
          </div>
        </div>
        <Menu
          width={240}
          trigger={
            <IconButton label={`More for ${set.title}`} size="sm">
              <IconDots />
            </IconButton>
          }
        >
          <MenuItem icon={<IconCopy />} description={`/labdraft preset:${set.presetName}`} onClick={copyPresetName}>
            Copy preset name
          </MenuItem>
          {isOwner && (
            <>
              <MenuItem icon={<IconPencil />} onClick={onRename}>
                Rename
              </MenuItem>
              <MenuSeparator />
              {set.archived ? (
                <MenuItem icon={<IconArchiveOff />} onClick={() => setArchived(false)}>
                  Restore
                </MenuItem>
              ) : (
                <MenuItem icon={<IconArchive />} description="Hidden from your hub and its visitors" onClick={() => setArchived(true)}>
                  Archive
                </MenuItem>
              )}
            </>
          )}
        </Menu>
      </header>

      {sliceCount > 0 && (
        <>
          <dl className={classes.setStats}>
            <div>
              <dt>Slice value</dt>
              <dd>
                <b>{formatValue(average)}</b>
                <small>
                  avg, {formatValue(stats.min)} to {formatValue(stats.max)}
                </small>
              </dd>
              {strength && <StrengthGauge strength={strength} />}
            </div>
            <div>
              <dt>Optimal across {sliceCount} slices</dt>
              <dd>
                <ValuePill size="sm" r={stats.r} i={stats.i} f={stats.f} total={stats.r + stats.i + stats.f} />
              </dd>
            </div>
            <div className={classes.setFeatures}>
              <dt>On the slices</dt>
              <dd>
                <TechSkipsDisplay techSkips={JSON.stringify(stats.techSkips)} />
                <LegendaryDisplay count={stats.legendaries} />
                {wormholes.map((w) => (
                  <span key={w} className={classes.wormholeCount} title={`${stats.wormholes[w]} ${w.toLowerCase()} ${stats.wormholes[w] === 1 ? "wormhole" : "wormholes"}`}>
                    <Wormhole wormhole={w} size={20} fontSize={10} />
                    <b>{stats.wormholes[w]}</b>
                  </span>
                ))}
                {stats.anomalies > 0 && (
                  <span className={classes.anomalies} title={`${stats.anomalies} ${stats.anomalies === 1 ? "anomaly" : "anomalies"}`}>
                    {stats.anomalies} {stats.anomalies === 1 ? "anomaly" : "anomalies"}
                  </span>
                )}
              </dd>
            </div>
          </dl>

          <ol className={classes.ladder} aria-label="Slices, strongest first">
            {stats.slices.map((summary, idx) => (
              <LadderRow key={idx} summary={summary} type={type} />
            ))}
          </ol>
        </>
      )}

      {sliceCount === 0 && <p className={classes.setNote}>A preset map: the slices are fixed seats on the map.</p>}

      <footer className={classes.setActions}>
        <Button size="sm" icon={<IconPlayerPlay />} onClick={onStart} loading={starting}>
          Start draft
        </Button>
        {sliceCount > 0 && (
          <Button size="sm" variant="tertiary" icon={<IconEye />} onClick={onView}>
            View slices
          </Button>
        )}
        <code className={classes.presetCode} title="Start it in Discord with /labdraft preset:">
          {set.presetName}
        </code>
      </footer>
    </article>
  );
}

/**
 * Where the set's average slice value sits among finished drafts of the same
 * format: five bands from poor to very rich, sized by share of drafts, with
 * a notch at this set.
 */
function StrengthGauge({ strength }: { strength: SliceValueStrength }) {
  const description = describeStrength(strength);
  return (
    <div className={classes.gauge} data-band={strength.band}>
      <div
        className={classes.gaugeTrack}
        role="meter"
        aria-label="Slice value compared with finished drafts"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(strength.percentile * 100)}
        aria-valuetext={`${strength.label}. ${description}`}
      >
        {STRENGTH_BANDS.map((band, idx) => (
          <i
            key={band.label}
            className={classes.gaugeBand}
            data-band={idx}
            data-active={idx === strength.band || undefined}
            style={{ flexGrow: band.upTo - (STRENGTH_BANDS[idx - 1]?.upTo ?? 0) }}
          />
        ))}
        <span className={classes.gaugeMark} style={{ "--at": `${strength.percentile * 100}%` } as CSSProperties} />
      </div>
      <p className={classes.gaugeCaption}>
        <b>{strength.label}</b>, {description.replace(/^\w/, (c) => c.toLowerCase())}
      </p>
    </div>
  );
}

function LadderRow({ summary, type }: { summary: SliceSummary; type: DraftType }) {
  const { slice, value, r, i, f, techs, legendaries, wormholes } = summary;
  const strength = sliceValueStrength(type, value, "slices");
  return (
    <li className={classes.rung}>
      <span className={classes.rungName} title={slice.name}>
        {slice.name.replace(/^Slice\s+/i, "")}
      </span>
      <b
        className={classes.rungValue}
        data-band={strength?.band}
        title={strength && `${strength.label}: ${describeStrength(strength, "slices")}`}
      >
        {formatValue(value)}
      </b>
      <span className={classes.rungPill}>
        <ValuePill size="sm" r={r} i={i} f={f} />
      </span>
      <span className={classes.rungFeatures}>
        {techs.map((tech, idx) => (
          <TechIcon key={`t${idx}`} techSpecialty={tech} size={15} />
        ))}
        {Array.from({ length: legendaries }, (_, idx) => (
          <LegendaryIcon key={`l${idx}`} size={15} />
        ))}
        {wormholes.map((w, idx) => (
          <Wormhole key={`w${idx}`} wormhole={w} size={15} fontSize={8} />
        ))}
      </span>
    </li>
  );
}
