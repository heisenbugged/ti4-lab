import { Section, SectionTitle } from "~/components/Section";
import { useDraft } from "~/draftStore";
import { formatForPlayerCount } from "~/draft/playerCountFormats";
import { PlayerInputSection } from "../components/PlayerInputSection";

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
    <Section>
      <SectionTitle title="Players" />
      <PlayerInputSection
        showHeader={false}
        players={players}
        discordData={discordData}
        onChangeName={updatePlayerName}
        onRemovePlayer={canRemove ? removePlayer : undefined}
        onAddPlayer={canAdd ? addPlayer : undefined}
      />
    </Section>
  );
}
