import { useDraft } from "~/draftStore";
import { factions } from "~/data/factionData";
import { optimalStatsForSystems } from "~/utils/map";
import { HydratedPlayer, Slice } from "~/types";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValue } from "~/hooks/useSliceValue";
import { PlayerHex, cx } from "~/ui";
import { playerColorOf, playerLetter, shortFactionName, speakerOrdinal } from "./draftOrderUtils";
import classes from "./MidDraftSummary.module.css";
import { PickToken, sliceName } from "./PickToken";

/** One card per player with a slot for each thing they pick. Empty slots are dashed. */
export function MidDraftSummary() {
  const slices = useDraft((state) => state.draft.slices);
  const draftPlayerColors = useDraft(
    (state) => state.draft.settings.draftPlayerColors,
  );
  const draftSpeaker = useDraft((state) => state.draft.settings.draftSpeaker);
  const draftGameMode = useDraft((state) => state.draft.settings.draftGameMode);
  const { hydratedPlayers, activePlayer } = useHydratedDraft();
  const pickOrder = useDraft((state) => state.draft.pickOrder);
  const usingMinorFactions = useDraft(
    (state) =>
      !!state.draft.settings.minorFactionsInSharedPool ||
      state.draft.availableMinorFactions !== undefined,
  );
  const showSeat = draftSpeaker || draftGameMode === "texasStyle";
  const showSlice =
    draftGameMode !== "texasStyle" && draftGameMode !== "presetMap";
  const playerOrder =
    draftGameMode === "texasStyle"
      ? [...hydratedPlayers]
          .sort((a, b) => (a.speakerOrder ?? 0) - (b.speakerOrder ?? 0))
          .map((player) => player.id)
      : pickOrder
          .filter((entry): entry is number => typeof entry === "number")
          .filter((id, i, all) => all.indexOf(id) === i)
          .slice(0, hydratedPlayers.length);
  const ordered = [
    ...playerOrder
      .map((id) => hydratedPlayers.find((p) => p.id === id))
      .filter((p): p is HydratedPlayer => !!p),
    ...hydratedPlayers.filter((p) => !playerOrder.includes(p.id)),
  ];
  const n = ordered.length;
  const cols = n <= 6 ? n : Math.ceil(n / 2);

  return (
    <div
      className={classes.players}
      style={{ "--cols": cols } as React.CSSProperties}
      aria-label="What each player has"
    >
      {ordered.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          isPicking={activePlayer?.id === player.id}
          slice={player.sliceIdx !== undefined ? slices[player.sliceIdx] : undefined}
          showSlice={showSlice}
          showSpeaker={showSeat}
          showMinorFaction={usingMinorFactions}
          showPlayerColor={!!draftPlayerColors}
          showPack={draftGameMode === "twilightsFall"}
        />
      ))}
    </div>
  );
}

/** A slot in a player card: shaped and glyphed by what kind of pick it holds. */
function Slot(props: Omit<React.ComponentProps<typeof PickToken>, "variant" | "className">) {
  return <PickToken {...props} variant="chip" className={classes.slot} />;
}

function SliceSlot({ slice }: { slice: Slice }) {
  const sliceValue = useSliceValue(slice);
  const optimal = optimalStatsForSystems(systemsInSlice(slice));
  const sv = sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1);
  return (
    <Slot
      kind="slice"
      label={sliceName(slice.name, 0)}
      title={`${slice.name}: SV ${sv}, optimal ${optimal.resources} resources, ${optimal.influence} influence, ${optimal.flex} flex`}
    />
  );
}

function PlayerCard({
  player,
  isPicking,
  slice,
  showSlice,
  showSpeaker,
  showMinorFaction,
  showPlayerColor,
  showPack,
}: {
  player: HydratedPlayer;
  isPicking: boolean;
  slice?: Slice;
  showSlice: boolean;
  showSpeaker: boolean;
  showMinorFaction: boolean;
  showPlayerColor: boolean;
  showPack: boolean;
}) {
  const faction = player.faction ? factions[player.faction] : undefined;
  const minor = player.minorFaction ? factions[player.minorFaction] : undefined;
  const color = playerColorOf(player.id);

  return (
    <div className={cx(classes.card, isPicking && classes.now, isPicking && "ui-now")}>
      <div className={classes.head}>
        <PlayerHex color={color} size="sm">
          {playerLetter(player.id)}
        </PlayerHex>
        <span className={classes.name} title={player.name}>
          {player.name}
        </span>
        {isPicking && <small className={classes.picking}>Picking</small>}
      </div>
      <div className={classes.slots}>
        {faction && player.faction ? (
          <Slot kind="faction" factionId={player.faction} label={shortFactionName(faction.name)} title={faction.name} />
        ) : (
          <Slot kind="faction" empty label="Faction" />
        )}
        {showMinorFaction &&
          (minor && player.minorFaction ? (
            <Slot kind="minor" factionId={player.minorFaction} label={shortFactionName(minor.name)} title={`Minor faction: ${minor.name}`} />
          ) : (
            <Slot kind="minor" empty label="Minor" />
          ))}
        {showSlice && (slice ? <SliceSlot slice={slice} /> : <Slot kind="slice" empty label="Slice" />)}
        {showSpeaker &&
          (player.speakerOrder !== undefined ? (
            <Slot kind="speaker" value={player.speakerOrder + 1} label={speakerOrdinal(player.speakerOrder + 1)} title="Speaker order" />
          ) : (
            <Slot kind="speaker" empty label="Speaker" />
          ))}
        {player.seatIdx !== undefined ? (
          <Slot kind="seat" value={player.seatIdx + 1} label="Seat" title={`Seat ${player.seatIdx + 1}`} />
        ) : (
          <Slot kind="seat" empty label="Seat" />
        )}
        {showPack &&
          (player.referenceCardPackIdx !== undefined ? (
            <Slot kind="pack" label={`Pack ${player.referenceCardPackIdx + 1}`} title="Reference card pack" />
          ) : (
            <Slot kind="pack" empty label="Pack" />
          ))}
        {showPlayerColor &&
          (player.factionColor ? (
            <Slot kind="color" color={player.factionColor} label={player.factionColor} title="In-game colour" />
          ) : (
            <Slot kind="color" empty label="Colour" />
          ))}
      </div>
    </div>
  );
}
