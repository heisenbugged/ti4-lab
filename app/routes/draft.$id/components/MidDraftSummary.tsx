import { useDraft } from "~/draftStore";
import { factions } from "~/data/factionData";
import { optimalStatsForSystems } from "~/utils/map";
import { HydratedPlayer, Slice } from "~/types";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { systemsInSlice } from "~/utils/slice";
import { useSliceValue } from "~/hooks/useSliceValue";
import { PlayerHex, cx } from "~/ui";
import { playerColorOf, playerLetter, shortFactionName } from "./draftOrderUtils";
import classes from "./MidDraftSummary.module.css";

const ordinal = (n: number) =>
  n === 1 ? "Speaker" : `${n}${n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

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

function Slot({ empty, children, title }: { empty?: boolean; children: React.ReactNode; title?: string }) {
  return (
    <span className={cx(classes.slot, empty && classes.empty)} title={title}>
      {children}
    </span>
  );
}

function SliceSlot({ slice }: { slice: Slice }) {
  const sliceValue = useSliceValue(slice);
  const optimal = optimalStatsForSystems(systemsInSlice(slice));
  const sv = sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1);
  return (
    <Slot
      title={`Slice ${slice.name}: SV ${sv}, optimal ${optimal.resources} resources, ${optimal.influence} influence, ${optimal.flex} flex`}
    >
      <span className={classes.slotText}>{slice.name}</span>
    </Slot>
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
    <div className={cx(classes.card, isPicking && classes.now)}>
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
        {faction ? (
          <Slot title={faction.name}>
            <img src={faction.iconPath} alt="" />
            <span className={classes.slotText}>{shortFactionName(faction.name)}</span>
          </Slot>
        ) : (
          <Slot empty>Faction</Slot>
        )}
        {showMinorFaction &&
          (minor ? (
            <Slot title={`Minor faction: ${minor.name}`}>
              <img src={minor.iconPath} alt="" />
              <span className={classes.slotText}>{shortFactionName(minor.name)}</span>
            </Slot>
          ) : (
            <Slot empty>Minor</Slot>
          ))}
        {showSlice && (slice ? <SliceSlot slice={slice} /> : <Slot empty>Slice</Slot>)}
        {showSpeaker &&
          (player.speakerOrder !== undefined ? (
            <Slot title="Speaker order">{ordinal(player.speakerOrder + 1)}</Slot>
          ) : (
            <Slot empty>Speaker</Slot>
          ))}
        {player.seatIdx !== undefined ? (
          <Slot>Seat {player.seatIdx + 1}</Slot>
        ) : (
          <Slot empty>Seat</Slot>
        )}
        {showPack &&
          (player.referenceCardPackIdx !== undefined ? (
            <Slot title="Reference card pack">Pack {player.referenceCardPackIdx + 1}</Slot>
          ) : (
            <Slot empty>Pack</Slot>
          ))}
        {showPlayerColor &&
          (player.factionColor ? (
            <Slot title="In-game colour">{player.factionColor}</Slot>
          ) : (
            <Slot empty>Colour</Slot>
          ))}
      </div>
    </div>
  );
}
