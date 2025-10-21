import { Button, Group, Paper, Text, Title, Progress } from "@mantine/core";
import {
  IconPlayerSkipBack,
  IconPlayerTrackPrev,
  IconPlayerTrackNext,
  IconPlayerSkipForward,
} from "@tabler/icons-react";
import { useDraft } from "~/draftStore";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { factions } from "~/data/factionData";

export function ReplayControls() {
  const replaySelections = useDraft((state) => state.replaySelections);
  const replayIndex = useDraft((state) => state.replayIndex);
  const replayActions = useDraft((state) => state.replayActions);
  const draft = useDraft((state) => state.draft);
  const { activePlayer } = useHydratedDraft();

  const totalPicks = replaySelections?.length ?? 0;
  const currentPick = replayIndex ?? 0;
  const progress = totalPicks > 0 ? (currentPick / totalPicks) * 100 : 0;

  const canGoBack = currentPick > 0;
  const canGoForward = currentPick < totalPicks;

  const getCurrentPickDescription = () => {
    if (currentPick === 0) return "Draft start";
    if (currentPick >= totalPicks) return "Draft complete";
    if (!replaySelections) return "Loading...";

    const selection = replaySelections[currentPick - 1];
    const player = draft.players.find((p) => p.id === selection.playerId);

    switch (selection.type) {
      case "SELECT_FACTION": {
        const faction = factions[selection.factionId];
        return `${player?.name} selected ${faction.name}`;
      }
      case "SELECT_SLICE": {
        const slice = draft.slices[selection.sliceIdx];
        return `${player?.name} selected ${slice.name}`;
      }
      case "SELECT_SPEAKER_ORDER":
        return `${player?.name} selected speaker order ${selection.speakerOrder + 1}`;
      case "SELECT_MINOR_FACTION": {
        const faction = factions[selection.minorFactionId];
        return `${player?.name} selected minor faction ${faction.name}`;
      }
      case "SELECT_PLAYER_COLOR":
        return `${player?.name} selected ${selection.color}`;
      case "SELECT_SEAT":
        return `${player?.name} selected seat ${selection.seatIdx + 1}`;
      case "BAN_FACTION": {
        const faction = factions[selection.factionId];
        return `${player?.name} banned ${faction.name}`;
      }
      default:
        return "Unknown action";
    }
  };

  return (
    <Paper
      p="lg"
      shadow="sm"
      withBorder
      style={{
        position: "sticky",
        top: 75,
        zIndex: 100,
        backgroundColor: "var(--mantine-color-body)",
      }}
    >
      <Group justify="space-between" mb="md">
        <div>
          <Title order={3}>Draft Replay</Title>
          <Text size="sm" c="dimmed">
            Pick {currentPick} of {totalPicks}
          </Text>
        </div>
        {activePlayer && (
          <Text size="sm" fw={500}>
            Current: {activePlayer.name}
          </Text>
        )}
      </Group>

      <Progress value={progress} size="md" mb="md" />

      <Text size="sm" mb="md" ta="center">
        {getCurrentPickDescription()}
      </Text>

      <Group justify="center" gap="xs">
        <Button
          variant="light"
          leftSection={<IconPlayerSkipBack size={18} />}
          onClick={replayActions.jumpToStart}
          disabled={!canGoBack}
        >
          Start
        </Button>
        <Button
          variant="light"
          leftSection={<IconPlayerTrackPrev size={18} />}
          onClick={replayActions.stepBackward}
          disabled={!canGoBack}
        >
          Back
        </Button>
        <Button
          variant="light"
          rightSection={<IconPlayerTrackNext size={18} />}
          onClick={replayActions.stepForward}
          disabled={!canGoForward}
        >
          Forward
        </Button>
        <Button
          variant="light"
          rightSection={<IconPlayerSkipForward size={18} />}
          onClick={replayActions.jumpToEnd}
          disabled={!canGoForward}
        >
          End
        </Button>
      </Group>
    </Paper>
  );
}
