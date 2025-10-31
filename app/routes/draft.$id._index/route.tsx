import { Button, Grid, Stack, Text } from "@mantine/core";
import {
  ActionFunctionArgs,
  json,
  redirect,
  MetaFunction,
} from "@remix-run/node";
import type { SerializeFrom } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { Draft, PRIORITY_PHASE, HOME_PHASE } from "~/types";
import { CurrentPickBanner } from "../draft.$id/components/CurrentPickBanner";
import { PlayerSelectionScreen } from "../draft.$id/components/PlayerSelectionScreen";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
  updateDraft,
} from "~/drizzle/draft.server";
import { notifyPick } from "~/discord/bot.server";
import { useHydratedDraft } from "~/hooks/useHydratedDraft";
import {
  SlicesSection,
  SpeakerOrderSection,
  DraftOrderSection,
  DraftableFactionsSection,
  MapSection,
  DraftSummarySection,
} from "../draft.$id/sections";
import { PlanetFinder } from "../draft.$id/components/PlanetFinder";
import { useNotifyActivePlayer } from "~/hooks/useNotifyActivePlayer";
import { FinalizedDraft } from "../draft.$id/components/FinalizedDraft";
import { SyncDraftContext, useSyncDraftFetcher } from "~/hooks/useSyncDraft";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { DraftableMinorFactionsSection } from "../draft.$id/sections/DraftableMinorFactionsSection";
import { DraftablePlayerColorsSection } from "../draft.$id/sections/DraftablePlayerColorsSection";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { BanPhase } from "../draft.$id/sections/BanPhase";
import { IconRefresh } from "@tabler/icons-react";
import { useSocketConnection } from "~/useSocketConnection";
import { AudioAlertConsentModal } from "../draft.$id/components/AudioAlertConsentModal";
import { DraftableReferenceCardPacksSection } from "../draft.$id/sections/DraftableReferenceCardPacksSection";
import { PriorityValueSelectionPhase } from "../draft.$id/sections/PriorityValueSelectionPhase";
import { HomeSystemSelectionPhase } from "../draft.$id/sections/HomeSystemSelectionPhase";

export default function RunningDraft() {
  const { adminMode } = useSafeOutletContext();
  useNotifyActivePlayer();
  const result = useLoaderData<typeof loader>();
  const { syncDraft, syncing, stagePriorityValue, stageHomeSystem } =
    useSyncDraftFetcher();
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
    socket.on("syncDraft", (data) => {
      const draft = JSON.parse(data) as Draft;

      draftStore.draftActions.update(result.id!, draft);
    });
  }, [socket]);

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
  }, []);

  if (!draftStore.hydrated) return <LoadingOverlay />;

  if (draftFinished) {
    return (
      <SyncDraftContext.Provider
        value={{ syncDraft, syncing, stagePriorityValue, stageHomeSystem }}
      >
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
      <SyncDraftContext.Provider
        value={{ syncDraft, syncing, stagePriorityValue, stageHomeSystem }}
      >
        <BanPhase />
      </SyncDraftContext.Provider>
    );
  }

  const currentPick = draft.pickOrder[draft.selections.length];

  if (currentPick === PRIORITY_PHASE) {
    return (
      <SyncDraftContext.Provider
        value={{ syncDraft, syncing, stagePriorityValue, stageHomeSystem }}
      >
        <PriorityValueSelectionPhase />
      </SyncDraftContext.Provider>
    );
  }

  if (currentPick === HOME_PHASE) {
    return (
      <SyncDraftContext.Provider
        value={{ syncDraft, syncing, stagePriorityValue, stageHomeSystem }}
      >
        <HomeSystemSelectionPhase />
      </SyncDraftContext.Provider>
    );
  }

  return (
    <SyncDraftContext.Provider
      value={{ syncDraft, syncing, stagePriorityValue, stageHomeSystem }}
    >
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

      <Grid gutter="xl">
        <Grid.Col span={12} order={{ base: 0 }}>
          <Text size="md" ta="right" c="dimmed">
            https://tidraft.com/draft/{result.urlName}
          </Text>
        </Grid.Col>

        {settings.draftSpeaker && (
          <Grid.Col
            span={{ base: 12, sm: 6 }}
            order={{ base: 3, sm: 1, lg: 1 }}
          >
            <SpeakerOrderSection />
          </Grid.Col>
        )}
        <Grid.Col
          span={settings.draftSpeaker ? { base: 12, sm: 6 } : 12}
          order={{ base: 1, sm: 2, lg: 2 }}
        >
          <DraftOrderSection />
        </Grid.Col>
        {settings.draftGameMode === "twilightsFall" && (
          <Grid.Col span={12} order={{ base: 5, sm: 5, lg: 5 }}>
            <DraftableReferenceCardPacksSection />
          </Grid.Col>
        )}
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 4, sm: 4, lg: 3 }}>
          <Stack gap="lg">
            <DraftableFactionsSection />
            <DraftableMinorFactionsSection />
            <DraftablePlayerColorsSection />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 2, sm: 3, lg: 4 }}>
          <DraftSummarySection />
        </Grid.Col>
        <Grid.Col
          span={
            settings.draftGameMode === "twilightsFall"
              ? 12
              : { base: 12, lg: 6 }
          }
          order={{ base: 5, sm: 5, lg: 5 }}
        >
          <SlicesSection />
        </Grid.Col>
        {settings.draftGameMode !== "twilightsFall" && (
          <Grid.Col
            span={{ base: 12, lg: 6 }}
            order={{ base: 6, sm: 6, lg: 6 }}
          >
            <MapSection />
          </Grid.Col>
        )}

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
      </Grid>
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
  const existingDraftData = JSON.parse(existingDraft.data as string) as Draft;
  await updateDraft(id, draft);

  // only notify if a selection was made
  if (existingDraftData.selections.length != draft.selections.length) {
    const notifyResult = await notifyPick(id, existingDraft.urlName!, draft);
    if (!notifyResult.success) {
      return json({
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
    console.log("UUID url detected, generating pretty url");
    const draft = await draftById(draftId);
    if (draft.urlName) {
      console.log(`redirecting to pretty url ${draft.urlName}`);
      return redirect(`/draft/${draft.urlName}`);
    }

    const prettyUrl = await generateUniquePrettyUrl();
    await db
      .update(drafts)
      .set({ urlName: prettyUrl })
      .where(eq(drafts.id, draftId))
      .run();

    console.log(`redirecting to pretty url ${prettyUrl}`);
    return redirect(`/draft/${prettyUrl}`);
  }

  const result = await draftByPrettyUrl(draftId);
  if (!result) {
    throw new Response("Draft not found", { status: 404 });
  }

  return json({
    ...result,
    data: JSON.parse(result.data as string) as Draft,
  });
};

export const meta: MetaFunction = ({ data }) => {
  const typed = data as SerializeFrom<typeof loader> | undefined;
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
