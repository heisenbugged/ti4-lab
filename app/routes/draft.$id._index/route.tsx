import { Button, Grid, Stack } from "@mantine/core";
import { ActionFunctionArgs, data, MetaFunction } from "react-router";
import { useLoaderData } from "react-router";
import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { Draft } from "~/types";
import { CurrentPickBanner } from "../draft.$id/components/CurrentPickBanner";
import { PlayerSelectionScreen } from "../draft.$id/components/PlayerSelectionScreen";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  updateDraft,
  getDraftStagedSelections,
} from "~/drizzle/draft.server";
import { redirectToPrettyDraftUrl } from "~/utils/draftRedirect.server";
import { notifyPick } from "~/discord/bot.server";
import { validateDraftSync } from "~/utils/draftSync.server";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import { PlanetFinder } from "../draft.$id/components/PlanetFinder";
import { useNotifyActivePlayer } from "~/hooks/useNotifyActivePlayer";
import { FinalizedDraft } from "../draft.$id/components/FinalizedDraft";
import { SyncDraftContext, useSyncDraftFetcher } from "~/hooks/useSyncDraft";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { BanPhase } from "../draft.$id/sections/BanPhase";
import { IconRefresh } from "@tabler/icons-react";
import { useSocketConnection } from "~/useSocketConnection";
import { AudioAlertConsentModal } from "../draft.$id/components/AudioAlertConsentModal";
import { DraftBoard } from "../draft.$id/components/DraftBoard";
import { PriorityValueSelectionPhase } from "../draft.$id/sections/PriorityValueSelectionPhase";
import { HomeSystemSelectionPhase } from "../draft.$id/sections/HomeSystemSelectionPhase";
import { TexasFactionSelectionPhase } from "../draft.$id/sections/TexasFactionSelectionPhase";
import { TexasTileDraftPhase } from "../draft.$id/sections/TexasTileDraftPhase";
import { TexasMapBuildPhase } from "../draft.$id/sections/TexasMapBuildPhase";

export default function RunningDraft() {
  const { adminMode } = useSafeOutletContext();
  useNotifyActivePlayer();
  const result = useLoaderData<typeof loader>();
  const {
    syncDraft,
    syncing,
    stagePriorityValue,
    stageHomeSystem,
    stageSimultaneousPick,
    undoStagedPick,
    undoSimultaneousPhase,
    undoLastPick,
  } = useSyncDraftFetcher();
  const draftStore = useDraft();
  const draft = draftStore.draft;
  const settings = draft.settings;
  const draftActions = draftStore.draftActions;
  const selectedPlayer = draftStore.selectedPlayer;
  const { draftFinished } = useHydratedDraft();

  // Real-time socket connection to push and receive state updates.
  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: () => socket?.emit("joinDraft", result.id),
    });
  useEffect(() => {
    if (!socket) return;
    const handleSyncDraft = (data: string) => {
      const draft = JSON.parse(data) as Draft;

      draftStore.draftActions.update(result.id!, draft);
    };
    socket.on("syncDraft", handleSyncDraft);
    return () => {
      socket.off("syncDraft", handleSyncDraft);
    };
  }, [socket, result.id]);

  // pre-seed store with loaded persisted draft
  useEffect(() => {
    draftStore.draftActions.hydrate(result.id!, result.urlName!, result.data);
    draftStore.replayActions.disableReplayMode();

    const storedSelectedPlayer = localStorage.getItem(
      `draft:player:${result.id}`,
    );
    if (storedSelectedPlayer) {
      draftActions.setSelectedPlayer(parseInt(storedSelectedPlayer));
    }
  }, [result.id]);

  if (!draftStore.hydrated) return <LoadingOverlay />;

  const syncDraftContextValue = {
    syncDraft,
    syncing,
    stagePriorityValue,
    stageHomeSystem,
    stageSimultaneousPick,
    undoStagedPick,
    undoSimultaneousPhase,
    undoLastPick,
  };

  if (draftFinished) {
    return (
      <SyncDraftContext.Provider value={syncDraftContextValue}>
        <FinalizedDraft />
      </SyncDraftContext.Provider>
    );
  }

  if (selectedPlayer === undefined) {
    return (
      <PlayerSelectionScreen
        onDraftJoined={(playerId) => {
          localStorage.setItem(
            `draft:player:${result.id}`,
            playerId.toString(),
          );
          draftActions.setSelectedPlayer(playerId);
        }}
      />
    );
  }

  const isInBanPhase = () => {
    if (!settings.modifiers) return false;
    const banModifier = settings.modifiers.banFactions;
    if (!banModifier) return false;

    const totalBansNeeded = banModifier.numFactions * draft.players.length;
    const currentPickNumber = draft.selections.length;

    return currentPickNumber < totalBansNeeded;
  };

  if (isInBanPhase()) {
    return (
      <SyncDraftContext.Provider value={syncDraftContextValue}>
        <BanPhase />
      </SyncDraftContext.Provider>
    );
  }

  const currentPick = draft.pickOrder[draft.selections.length];
  if (typeof currentPick === "object" && currentPick?.kind === "simultaneous") {
    if (currentPick.phase === "priorityValue") {
      return (
        <SyncDraftContext.Provider value={syncDraftContextValue}>
          <PriorityValueSelectionPhase />
        </SyncDraftContext.Provider>
      );
    }

    if (currentPick.phase === "homeSystem") {
      return (
        <SyncDraftContext.Provider value={syncDraftContextValue}>
          <HomeSystemSelectionPhase />
        </SyncDraftContext.Provider>
      );
    }

    if (currentPick.phase === "texasFaction") {
      return (
        <SyncDraftContext.Provider value={syncDraftContextValue}>
          <TexasFactionSelectionPhase />
        </SyncDraftContext.Provider>
      );
    }

    if (currentPick.phase === "texasBlueKeep1") {
      return (
        <SyncDraftContext.Provider value={syncDraftContextValue}>
          <TexasTileDraftPhase
            phase="texasBlueKeep1"
            title="Blue Tile Draft — Round 1"
            description="Keep one blue tile and pass the rest left."
            color="blue"
          />
        </SyncDraftContext.Provider>
      );
    }

    if (currentPick.phase === "texasBlueKeep2") {
      return (
        <SyncDraftContext.Provider value={syncDraftContextValue}>
          <TexasTileDraftPhase
            phase="texasBlueKeep2"
            title="Blue Tile Draft — Round 2"
            description="Keep one blue tile from the pass."
            color="blue"
          />
        </SyncDraftContext.Provider>
      );
    }

    if (currentPick.phase === "texasRedKeep") {
      return (
        <SyncDraftContext.Provider value={syncDraftContextValue}>
          <TexasTileDraftPhase
            phase="texasRedKeep"
            title="Red Tile Draft"
            description="Keep one red tile and pass the other left."
            color="red"
          />
        </SyncDraftContext.Provider>
      );
    }
  }

  if (settings.draftGameMode === "texasStyle") {
    return (
      <SyncDraftContext.Provider value={syncDraftContextValue}>
        <TexasMapBuildPhase />
      </SyncDraftContext.Provider>
    );
  }

  return (
    <SyncDraftContext.Provider value={syncDraftContextValue}>
      {socket && isDisconnected && (
        <Button
          variant="filled"
          size="md"
          radius="xl"
          leftSection={<IconRefresh size={20} />}
          style={{
            position: "fixed",
            top: "160px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
          onClick={reconnect}
          loading={isReconnecting}
        >
          Refresh
        </Button>
      )}

      <PlanetFinder onSystemSelected={syncDraft} />
      <AudioAlertConsentModal />
      <audio id="notificationSound" src="/chime.mp3" preload="auto">
        <track kind="captions" />
      </audio>
      <Stack gap="sm" mb="60" mt="lg">
        <CurrentPickBanner />
        <div style={{ height: 15 }} />
      </Stack>

      <DraftBoard urlName={result.urlName}>
        {adminMode && (
          <Grid.Col offset={6} span={6} order={{ base: 7 }}>
            <PlayerInputSection
              players={draft.players}
              onChangeName={(playerIdx, name) => {
                draftStore.actions.updatePlayerName(playerIdx, name);
              }}
            />
            <Button mt="lg" onClick={syncDraft} loading={syncing}>
              Save
            </Button>
          </Grid.Col>
        )}
      </DraftBoard>
    </SyncDraftContext.Provider>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const { id, draft } = (await request.json()) as {
    id: string;
    draft: Draft;
    turnPassed: boolean;
  };

  // if this draft data is the old legacy draft data,
  // force a page reload instead
  if (
    Object.prototype.hasOwnProperty.call(
      draft as unknown as Record<string, unknown>,
      "mapString",
    )
  ) {
    throw new Error("Cannot read old draft!");
  }

  const existingDraft = await draftById(id);
  if (!existingDraft) {
    return data({ success: false, error: "Draft not found" }, { status: 404 });
  }
  const serverSelections = (JSON.parse(existingDraft.data as string) as Draft)
    .selections;

  const validation = validateDraftSync(serverSelections, draft.selections);
  if (!validation.valid) {
    return validation.response;
  }

  await updateDraft(id, draft);

  // only notify if a selection was made
  if (serverSelections.length !== draft.selections.length) {
    const notifyResult = await notifyPick(id, existingDraft.urlName!, draft);
    if (!notifyResult.success) {
      return data({
        success: true,
        discordError: "error" in notifyResult ? notifyResult.error : undefined,
        discordMessage:
          "message" in notifyResult ? notifyResult.message : undefined,
      });
    }
  }

  return { success: true };
}

// meta is placed after loader so typeof loader resolves correctly

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

export const loader = async ({ params }: { params: { id: string } }) => {
  const draftId = params.id;

  // If using a legacy "UUID url", generate a pretty URL
  // and then redirect to it.
  if (validateUUID(draftId)) {
    return redirectToPrettyDraftUrl(draftId);
  }

  const result = await draftByPrettyUrl(draftId);
  if (!result) {
    throw new Response("Draft not found", { status: 404 });
  }

  const stagedSelections = await getDraftStagedSelections(result.id);
  const parsedDraft = JSON.parse(result.data as string) as Draft;

  return data({
    ...result,
    data: {
      ...parsedDraft,
      stagedSelections,
    },
  });
};

type LoaderData = {
  data: Draft;
  id: string;
  urlName: string | null;
  imageUrl: string | null;
  incompleteImageUrl: string | null;
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const typed = data as LoaderData | undefined;
  if (!typed) return [];

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
};
