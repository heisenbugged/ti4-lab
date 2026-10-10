import type { ReactNode } from "react";
import { factions } from "~/data/factionData";
import type { Draft, DraftSelection, FactionId } from "~/types";
import { cx, useLanded } from "~/ui";
import { shortFactionName, speakerOrdinal } from "./draftOrderUtils";
import classes from "./PickToken.module.css";

/**
 * What kind of thing a pick is. Each kind has its own glyph, accent and outline,
 * so a faction, a slice, a seat or a speaker position never read as the same box.
 * (Who picked it is the player colour; that stays on the player, never here.)
 */
export type PickKind =
  | "faction"
  | "minor"
  | "ban"
  | "slice"
  | "seat"
  | "speaker"
  | "color"
  | "pack"
  | "tile";

const inGameColor: Record<string, string> = {
  Green: "#3fa35a",
  Blue: "#3a7be0",
  Yellow: "#e8c33a",
  Red: "#d9423b",
  Purple: "#8b5cd9",
  Black: "#20242c",
  Orange: "#ee8a2e",
  Magenta: "#d6559a",
};

/** Three hexes: a slice of the map. */
function SliceGlyph() {
  return (
    <svg viewBox="0 0 16 14" className={classes.glyph} aria-hidden>
      <path d="M4 1h3l1.5 2.6L7 6.2H4L2.5 3.6z" />
      <path d="M9 4h3l1.5 2.6L12 9.2H9L7.5 6.6z" />
      <path d="M4 7.8h3l1.5 2.6L7 13H4l-1.5-2.6z" />
    </svg>
  );
}

/** Open faction slot: a plain shield. */
function ShieldGlyph() {
  return (
    <svg viewBox="0 0 14 14" className={`${classes.glyph} ${classes.outlineGlyph}`} aria-hidden>
      <path d="M7 1.5l4.5 1.6v3.6c0 2.7-1.9 4.9-4.5 5.8-2.6-.9-4.5-3.1-4.5-5.8V3.1z" />
    </svg>
  );
}

/** A reference card. */
function PackGlyph() {
  return (
    <svg viewBox="0 0 14 14" className={classes.glyph} aria-hidden>
      <rect x="3" y="1.5" width="8" height="11" rx="1" />
      <path d="M5 4.5h4M5 7h4" className={classes.cut} />
    </svg>
  );
}

function FactionImg({ id, ban }: { id: FactionId; ban?: boolean }) {
  const f = factions[id];
  if (!f) return null;
  return (
    <span className={cx(classes.icon, ban && classes.banned)}>
      <img src={f.iconPath} alt="" />
    </span>
  );
}

type TokenProps = {
  kind: PickKind;
  /** The main text, e.g. "Hacan", "Shroud", "Seat". */
  label?: ReactNode;
  /** A number shown inside the seat hex or speaker token. */
  value?: number | string;
  factionId?: FactionId;
  color?: string;
  /** Not picked yet: faint glyph and outline only. */
  empty?: boolean;
  /** "chip": a slot in a player card. "inline": glyph + label in the pick order. */
  variant?: "chip" | "inline";
  title?: string;
  className?: string;
};

export function PickToken({ kind, label, value, factionId, color, empty, variant = "chip", title, className }: TokenProps) {
  // Only chips land; inline tokens sit inside pick order cells that land themselves.
  const landed = useLanded(empty ? null : `${kind}|${String(label)}|${value}|${factionId}|${color}`) && !empty && variant === "chip";
  let glyph: ReactNode = null;
  switch (kind) {
    case "faction":
    case "minor":
    case "ban":
      glyph = factionId ? <FactionImg id={factionId} ban={kind === "ban"} /> : <ShieldGlyph />;
      break;
    case "slice":
      glyph = <SliceGlyph />;
      break;
    case "seat":
      glyph = <span className={classes.seatHex}>{value ?? ""}</span>;
      break;
    case "speaker":
      glyph = <span className={classes.speakerDot}>{value ?? ""}</span>;
      break;
    case "color":
      glyph = <span className={classes.swatch} style={color ? { background: inGameColor[color] ?? color } : undefined} />;
      break;
    case "pack":
      glyph = <PackGlyph />;
      break;
  }
  return (
    <span
      className={cx(classes.token, classes[variant], classes[kind], empty && classes.empty, className)}
      title={title}
      data-kind={kind}
      data-empty={empty || undefined}
      data-landed={landed ? "" : undefined}
    >
      {glyph}
      {label !== undefined && (
        <span className={classes.text} data-part="text">
          {label}
        </span>
      )}
    </span>
  );
}

/** A finished pick, as a token, for the pick order strip. */
export function SelectionToken({ selection, draft }: { selection: DraftSelection | undefined; draft: Pick<Draft, "slices"> }) {
  if (!selection) return null;
  switch (selection.type) {
    case "SELECT_FACTION":
      return <PickToken variant="inline" kind="faction" factionId={selection.factionId} label={shortFactionName(factions[selection.factionId]?.name ?? "")} />;
    case "SELECT_MINOR_FACTION":
      return <PickToken variant="inline" kind="minor" factionId={selection.minorFactionId} label={shortFactionName(factions[selection.minorFactionId]?.name ?? "")} />;
    case "BAN_FACTION":
      return <PickToken variant="inline" kind="ban" factionId={selection.factionId} label={shortFactionName(factions[selection.factionId]?.name ?? "")} />;
    case "SELECT_SLICE":
      return <PickToken variant="inline" kind="slice" label={sliceName(draft.slices[selection.sliceIdx]?.name, selection.sliceIdx)} />;
    case "SELECT_SPEAKER_ORDER":
      return <PickToken variant="inline" kind="speaker" value={selection.speakerOrder + 1} label={speakerOrdinal(selection.speakerOrder + 1)} />;
    case "SELECT_SEAT":
      return <PickToken variant="inline" kind="seat" value={selection.seatIdx + 1} label="Seat" />;
    case "SELECT_PLAYER_COLOR":
      return <PickToken variant="inline" kind="color" color={selection.color} label={selection.color} />;
    case "SELECT_REFERENCE_CARD_PACK":
      return <PickToken variant="inline" kind="pack" label={`Pack ${selection.packIdx + 1}`} />;
    case "PLACE_TILE":
      return <PickToken variant="inline" kind="tile" label={`Tile ${selection.systemId}`} />;
    default:
      return null;
  }
}

/** "Slice Shroud" → "Shroud": the glyph already says it is a slice. */
export function sliceName(name: string | undefined, idx: number) {
  if (!name) return `${idx + 1}`;
  return name.replace(/^Slice\s+/i, "");
}

const kindOfSelection: Partial<Record<DraftSelection["type"], PickKind>> = {
  SELECT_FACTION: "faction",
  SELECT_MINOR_FACTION: "minor",
  BAN_FACTION: "ban",
  SELECT_SLICE: "slice",
  SELECT_SEAT: "seat",
  SELECT_SPEAKER_ORDER: "speaker",
  SELECT_PLAYER_COLOR: "color",
  SELECT_REFERENCE_CARD_PACK: "pack",
  PLACE_TILE: "tile",
};

export const selectionKind = (selection: DraftSelection | undefined): PickKind | undefined =>
  selection ? kindOfSelection[selection.type] : undefined;

/** Accent colour for a kind, for edges outside the token (pick order cells). */
export const kindVar: Record<PickKind, string> = {
  faction: "var(--rule-strong)",
  minor: "var(--kind-minor)",
  ban: "var(--danger)",
  slice: "var(--kind-slice)",
  seat: "var(--kind-seat)",
  speaker: "var(--kind-speaker)",
  color: "var(--rule-strong)",
  pack: "var(--kind-pack)",
  tile: "var(--rule-strong)",
};
