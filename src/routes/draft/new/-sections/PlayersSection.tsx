import { useDraft } from "~/draftStore";
import { formatForPlayerCount } from "~/draft/playerCountFormats";
import { PlayerInputSection } from "../-components/PlayerInputSection";
import { BuilderSection } from "./BuilderSection";

const MAX_PLAYERS = 8;

export function PlayersSection() {
  const players = useDraft((state) => state.draft.players);
  const type = useDraft((state) => state.draft.settings.type);
  const discordData = useDraft((state) => state.draft.integrations.discord);
  const draftGameMode = useDraft((state) => state.draft.settings.draftGameMode);
  const { updatePlayerName, addPlayer, removePlayer } = useDraft(
    (state) => state.actions,
  );

  // Discord players are fixed by the bot, and the other game modes size
  // more than the map and slices from the player count.
  const canChangePlayers = !discordData && draftGameMode === undefined;
  const canRemove =
    canChangePlayers && !!formatForPlayerCount(type, players.length - 1);
  const canAdd =
    canChangePlayers && !!formatForPlayerCount(type, players.length + 1);

  return (
    <BuilderSection
      title="Players"
      meta={
        canChangePlayers
          ? `${players.length} of ${MAX_PLAYERS}`
          : `${players.length} players`
      }
    >
      <PlayerInputSection
        showHeader={false}
        players={players}
        discordData={discordData}
        onChangeName={updatePlayerName}
        onRemovePlayer={canRemove ? removePlayer : undefined}
        onAddPlayer={canAdd ? addPlayer : undefined}
      />
    </BuilderSection>
  );
}
