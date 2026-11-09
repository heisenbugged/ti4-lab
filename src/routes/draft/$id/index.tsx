import { Button, Panel } from "~/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { banPhaseLength, Draft } from "~/types";
import { CurrentPickBanner } from "./-components/CurrentPickBanner";
import { PendingPickProvider } from "./-components/pendingPick";
import classes from "./index.module.css";
import { PlayerSelectionScreen } from "./-components/PlayerSelectionScreen";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { getDraft } from "~/server/drafts.functions";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { PlanetFinder } from "./-components/PlanetFinder";
import { useNotifyActivePlayer } from "~/hooks/useNotifyActivePlayer";
import { FinalizedDraft } from "./-components/FinalizedDraft";
import {
  SyncDraftContext,
  useSyncDraft,
  useDraftSyncMutations,
} from "~/hooks/useSyncDraft";
import { PlayerInputSection } from "../new/-components/PlayerInputSection";
import { useDraftUiSettings } from "~/draftUiSettings";
import { BanPhase } from "./-sections/BanPhase";
import { IconRefresh } from "@tabler/icons-react";
import { useSocketConnection } from "~/useSocketConnection";
import { AudioAlertConsentModal } from "./-components/AudioAlertConsentModal";
import { DraftBoard } from "./-components/DraftBoard";
import { PriorityValueSelectionPhase } from "./-sections/PriorityValueSelectionPhase";
import { HomeSystemSelectionPhase } from "./-sections/HomeSystemSelectionPhase";
import { TexasFactionSelectionPhase } from "./-sections/TexasFactionSelectionPhase";
import { TexasTileDraftPhase } from "./-sections/TexasTileDraftPhase";
import { TexasMapBuildPhase } from "./-sections/TexasMapBuildPhase";

export const Route = createFileRoute("/draft/$id/")({
  loader: ({ params }) => getDraft({ data: params.id }),
  head: ({ loaderData }) => ({ meta: loaderData ? draftMeta(loaderData) : [] }),
  // The page seeds the live (socket-driven) store from this once per visit, so
  // never re-enter it from a cached copy.
  gcTime: 0,
  component: RunningDraft,
});

function RunningDraft() {
  useNotifyActivePlayer();
  const result = Route.useLoaderData();
  const syncDraftContextValue = useDraftSyncMutations();
  const draftStore = useDraft();
  const { draftActions } = draftStore;

  // Real-time socket connection to push and receive state updates.
  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: (socket) => socket.emit("joinDraft", result.id),
    });
  useEffect(() => {
    if (!socket) return;
    const handleSyncDraft = (data: string) => {
      const draft = JSON.parse(data) as Draft;
      draftActions.update(result.id!, draft);
    };
    socket.on("syncDraft", handleSyncDraft);
    return () => {
      socket.off("syncDraft", handleSyncDraft);
    };
  }, [socket, result.id]);

  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draftActions.hydrate(result.id!, result.urlName!, result.data);
    draftStore.replayActions.disableReplayMode();

    const storedSelectedPlayer = localStorage.getItem(
      `draft:player:${result.id}`,
    );
    if (storedSelectedPlayer) {
      draftActions.setSelectedPlayer(parseInt(storedSelectedPlayer));
    }
  }, [result.id]);

  if (!draftStore.hydrated) return <LoadingOverlay />;

  return (
    <SyncDraftContext.Provider value={syncDraftContextValue}>
      {socket && isDisconnected && (
        <div className={classes.reconnect}>
          <Button
            variant="primary"
            icon={<IconRefresh size={18} />}
            onClick={reconnect}
            loading={isReconnecting}
          >
            Refresh
          </Button>
        </div>
      )}
      <DraftPhase draftId={result.id} />
    </SyncDraftContext.Provider>
  );
}

function DraftPhase({ draftId }: { draftId: string }) {
  const { adminMode } = useDraftUiSettings();
  const { syncDraft, syncing } = useSyncDraft();
  const draftStore = useDraft();
  const { draft, selectedPlayer, draftActions } = draftStore;
  const { draftFinished } = useHydratedDraft();

  if (draftFinished) return <FinalizedDraft />;

  if (selectedPlayer === undefined) {
    return (
      <PlayerSelectionScreen
        onDraftJoined={(playerId) => {
          localStorage.setItem(`draft:player:${draftId}`, playerId.toString());
          draftActions.setSelectedPlayer(playerId);
        }}
      />
    );
  }

  if (draft.selections.length < banPhaseLength(draft)) return <BanPhase />;

  const currentPick = draft.pickOrder[draft.selections.length];
  if (typeof currentPick === "object" && currentPick?.kind === "simultaneous") {
    switch (currentPick.phase) {
      case "priorityValue":
        return <PriorityValueSelectionPhase />;
      case "homeSystem":
        return <HomeSystemSelectionPhase />;
      case "texasFaction":
        return <TexasFactionSelectionPhase />;
      case "texasBlueKeep1":
        return (
          <TexasTileDraftPhase
            phase="texasBlueKeep1"
            title="Blue tile draft, round 1"
            description="Keep one blue tile and pass the rest left."
            color="blue"
          />
        );
      case "texasBlueKeep2":
        return (
          <TexasTileDraftPhase
            phase="texasBlueKeep2"
            title="Blue tile draft, round 2"
            description="Keep one blue tile from the pass."
            color="blue"
          />
        );
      case "texasRedKeep":
        return (
          <TexasTileDraftPhase
            phase="texasRedKeep"
            title="Red tile draft"
            description="Keep one red tile and pass the other left."
            color="red"
          />
        );
    }
  }

  if (draft.settings.draftGameMode === "texasStyle") {
    return <TexasMapBuildPhase />;
  }

  return (
    <PendingPickProvider>
      <PlanetFinder onSystemSelected={syncDraft} />
      <AudioAlertConsentModal />
      <audio id="notificationSound" src="/chime.mp3" preload="auto">
        <track kind="captions" />
      </audio>
      <CurrentPickBanner />

      <DraftBoard>
        {adminMode && (
          <Panel aria-label="Player names">
            <PlayerInputSection
              players={draft.players}
              onChangeName={draftStore.actions.updatePlayerName}
            />
            <div className={classes.adminSave}>
              <Button variant="primary" onClick={syncDraft} loading={syncing}>
                Save
              </Button>
            </div>
          </Panel>
        )}
      </DraftBoard>
    </PendingPickProvider>
  );
}

function formatDraftType(type: string, playerCount: number): string {
  const typeMap: Record<string, string> = {
    milty: "Milty Draft",
    miltyeq: "Milty Equidistant Draft",
    prechoice: "Pre-Choice Draft",
    raw: "Raw Draft",
  };

  const baseName = typeMap[type.replace(/\d+p$/, "")] || type;
  return `${baseName} (${playerCount} players)`;
}

function draftMeta(typed: {
  data: Draft;
  urlName: string | null;
  imageUrl: string | null;
  incompleteImageUrl: string | null;
}) {
  const draft = typed.data;
  const draftId = typed.urlName!;

  const draftType = draft.settings?.type || "Unknown";
  const playerCount = draft.players?.length || 0;
  const draftTypeDisplay = formatDraftType(draftType, playerCount);
  const title = `${draftId} - TI4 Lab`;
  const description = `${draftTypeDisplay} on TI4 Lab`;

  // Use appropriate image URL based on completion status
  const isComplete = draft.selections?.length === draft.pickOrder?.length;
  const existingImageUrl = isComplete
    ? (typed.imageUrl ?? undefined)
    : (typed.incompleteImageUrl ?? undefined);
  const imageUrl =
    existingImageUrl || `https://tidraft.com/draft/${draftId}.png`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:url", content: `https://tidraft.com/draft/${draftId}` },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "TI4 Lab" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
}
