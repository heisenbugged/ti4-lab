import { useSlice } from "~/components/Slice";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { Slice, HydratedPlayer } from "~/types";
import { PlayerHex, ValuePill, playerVar } from "~/ui";
import { FactionHelpInfo } from "~/routes/draft/$id/-components/FactionHelpInfo";
import { playerColorOf, playerLetter, speakerOrdinal } from "./draftOrderUtils";
import { PickToken } from "./PickToken";
import classes from "./FinalizedDraft.module.css";

type Props = {
  player: HydratedPlayer;
  /** Omitted for formats without slices (Texas, preset map). */
  slice?: Slice;
  showSeat: boolean;
  showPlayerColor: boolean;
};

/**
 * One player's result: who and what faction on the left, their picks as the same tokens the
 * live draft uses, and the slice's numbers on the right. Wraps instead of scrolling sideways.
 */
export function SummaryRow({ player, slice, showSeat, showPlayerColor }: Props) {
  const faction = player.faction ? factions[player.faction] : undefined;
  const color = playerColorOf(player.id);
  return (
    <li className={classes.result} style={{ "--p": playerVar(color) } as React.CSSProperties}>
      <div className={classes.who}>
        {faction ? (
          <FactionIcon faction={faction.id} style={{ width: 32, height: 32, flex: "none" }} />
        ) : (
          <span className={classes.noFaction} />
        )}
        <div className={classes.whoText}>
          <span className={classes.factionLine}>
            <span className={classes.factionName} title={faction?.name}>
              {faction?.name ?? "No faction"}
            </span>
            {faction && <FactionHelpInfo faction={faction} compact />}
          </span>
          <span className={classes.picks}>
            <span className={classes.byline}>
              <PlayerHex color={color} size="sm">
                {playerLetter(player.id)}
              </PlayerHex>
              <span className={classes.playerName}>{player.name}</span>
            </span>
            {player.speakerOrder !== undefined && (
              <PickToken
                kind="speaker"
                variant="inline"
                value={player.speakerOrder + 1}
                label={speakerOrdinal(player.speakerOrder + 1)}
              />
            )}
            {showSeat && player.seatIdx !== undefined && (
              <PickToken kind="seat" variant="inline" value={player.seatIdx + 1} label="Seat" />
            )}
            {showPlayerColor && player.factionColor && (
              <PickToken kind="color" variant="inline" color={player.factionColor} label={player.factionColor} />
            )}
          </span>
        </div>
      </div>
      {slice && <SliceNumbers slice={slice} />}
    </li>
  );
}

function SliceNumbers({ slice }: { slice: Slice }) {
  const { optimal, sliceValue } = useSlice(slice);
  return (
    <div className={classes.numbers}>
      <span className={classes.sv} title={`Slice value of ${slice.name}`}>
        <b>{sliceValue % 1 === 0 ? sliceValue : sliceValue.toFixed(1)}</b>
        <small>SV</small>
      </span>
      <ValuePill
        size="sm"
        r={optimal.resources}
        i={optimal.influence}
        f={optimal.flex}
        total={optimal.resources + optimal.influence + optimal.flex}
      />
      <span className={classes.features}>
        <SliceFeatures slice={slice} />
      </span>
    </div>
  );
}
