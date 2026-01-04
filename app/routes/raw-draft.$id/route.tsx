import {
  json,
  redirect,
  MetaFunction,
  LoaderFunctionArgs,
  ActionFunctionArgs,
} from "@remix-run/node";
import type { SerializeFrom } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { eq } from "drizzle-orm";
import { useEffect, useState } from "react";
import { useRawDraft, RawDraftState } from "~/rawDraftStore";
import { useSocketConnection } from "~/useSocketConnection";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { RawDraftPlayerSelectionScreen } from "../raw-draft.$id/components/RawDraftPlayerSelectionScreen";
import { RawDraftContent } from "../raw-draft.$id/components/RawDraftContent";
import { RawDraftComplete } from "../raw-draft.$id/components/RawDraftComplete";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
} from "~/drizzle/draft.server";
import { MainAppShell } from "~/components/MainAppShell";
import { useSyncRawDraftFetcher } from "~/hooks/useSyncRawDraft";
import { useRawDraftPlayerId } from "~/hooks/useRawDraftPlayerId";
import type { DraftOrderContext } from "~/routes/draft/route";
import { DraftOrderContextProviderComponent } from "~/contexts/DraftOrderContext";

export default function RawDraftByIdRoute() {
  const result = useLoaderData<typeof loader>();
  const rawDraftStore = useRawDraft();
  const { syncRawDraft } = useSyncRawDraftFetcher();
  const initialized = rawDraftStore.state.initialized;
  const isDraftComplete = rawDraftStore.isDraftComplete();
  const { hydrate } = rawDraftStore.actions;
  const [playerId, setPlayerId] = useRawDraftPlayerId(result.id);
  const [originalArt, setOriginalArt] = useState(false);

  // Real-time socket connection to push and receive state updates
  const { socket } = useSocketConnection({
    onConnect: () => {
      if (result.id) {
        console.log("[Client] Socket connected, joining raw draft:", result.id);
        socket?.emit("joinRawDraft", result.id);
      } else {
        console.warn("[Client] Socket connected but result.id is missing");
      }
    },
  });

  // Join room immediately if socket is already connected
  useEffect(() => {
    if (socket && socket.connected && result.id) {
      console.log(
        "[Client] Socket already connected, joining raw draft room:",
        result.id,
      );
      socket.emit("joinRawDraft", result.id);
    }
  }, [socket, result.id]);

  // Pre-seed store with loaded persisted draft (always hydrate from DB on mount)
  useEffect(() => {
    if (result.data && result.id && result.urlName) {
      console.log("[Client] Hydrating raw draft from database:", {
        id: result.id,
        urlName: result.urlName,
        eventsCount: result.data.events.length,
      });
      hydrate(result.id, result.urlName, result.data);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result.data, result.id, result.urlName, hydrate]);

  // Listen for raw draft updates from other players
  useEffect(() => {
    if (!socket) {
      console.log("[Client] Socket not available, waiting...");
      return;
    }

    if (!result.id) {
      console.warn("[Client] Cannot set up listener - missing draft ID");
      return;
    }

    console.log(
      "[Client] Setting up syncRawDraft listener for draft:",
      result.id,
      "socket connected:",
      socket.connected,
    );

    const handleSyncRawDraft = (data: string) => {
      console.log("[Client] ✅ Received syncRawDraft event:", {
        draftId: result.id,
        dataLength: data.length,
        socketId: socket.id,
      });
      try {
        const rawDraft = JSON.parse(data) as RawDraftState;
        console.log("[Client] Parsed raw draft state:", {
          eventsCount: rawDraft.events.length,
          playersCount: rawDraft.players.length,
        });
        // Update store with received state
        if (result.id && result.urlName) {
          console.log("[Client] Hydrating store with received state");
          hydrate(result.id, result.urlName, rawDraft);
          console.log(
            "[Client] Store hydrated, new events count:",
            rawDraft.events.length,
          );
        } else {
          console.warn("[Client] Cannot hydrate - missing id or urlName:", {
            id: result.id,
            urlName: result.urlName,
          });
        }
      } catch (error) {
        console.error("[Client] Error parsing syncRawDraft data:", error, data);
      }
    };

    socket.on("syncRawDraft", handleSyncRawDraft);
    console.log("[Client] syncRawDraft listener registered");

    return () => {
      console.log("[Client] Cleaning up syncRawDraft listener");
      socket.off("syncRawDraft", handleSyncRawDraft);
    };
  }, [socket, result.id, result.urlName, hydrate]);

  const handlePlayerSelected = (selectedPlayerId: number) => {
    setPlayerId(selectedPlayerId);
  };

  const context: DraftOrderContext = {
    adminMode: false,
    pickForAnyone: false,
    originalArt,
    accessibleColors: false,
    setAdminMode: () => {},
    setPickForAnyone: () => {},
    setOriginalArt,
    setAccessibleColors: () => {},
  };

  if (!initialized) {
    return (
      <MainAppShell>
        <LoadingOverlay />
      </MainAppShell>
    );
  }

  if (isDraftComplete) {
    return (
      <MainAppShell>
        <DraftOrderContextProviderComponent value={context}>
          <RawDraftComplete baseUrl={result.baseUrl} />
        </DraftOrderContextProviderComponent>
      </MainAppShell>
    );
  }

  if (playerId === undefined) {
    return (
      <MainAppShell>
        <DraftOrderContextProviderComponent value={context}>
          <RawDraftPlayerSelectionScreen onDraftJoined={handlePlayerSelected} />
        </DraftOrderContextProviderComponent>
      </MainAppShell>
    );
  }

  return (
    <MainAppShell>
      <DraftOrderContextProviderComponent value={context}>
        <RawDraftContent onTilePlaced={syncRawDraft} />
      </DraftOrderContextProviderComponent>
    </MainAppShell>
  );
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const draftId = params.id;
  if (!draftId) {
    throw new Response("Draft ID required", { status: 400 });
  }

  // If using a legacy "UUID url", generate a pretty URL
  // and then redirect to it.
  if (validateUUID(draftId)) {
    console.log("UUID url detected, generating pretty url");
    const draft = await draftById(draftId);
    if (draft.urlName) {
      console.log(`redirecting to pretty url ${draft.urlName}`);
      return redirect(`/raw-draft/${draft.urlName}`);
    }

    const prettyUrl = await generateUniquePrettyUrl();
    await db
      .update(drafts)
      .set({ urlName: prettyUrl })
      .where(eq(drafts.id, draftId))
      .run();

    console.log(`redirecting to pretty url ${prettyUrl}`);
    return redirect(`/raw-draft/${prettyUrl}`);
  }

  const result = await draftByPrettyUrl(draftId);
  if (!result) {
    throw new Response("Raw draft not found", { status: 404 });
  }

  // Verify it's a raw draft
  if (result.type !== "raw") {
    throw new Response("Not a raw draft", { status: 400 });
  }

  const { getBaseUrl } = await import("~/env.server");
  return json({
    ...result,
    data: JSON.parse(result.data as string) as RawDraftState,
    baseUrl: getBaseUrl(),
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { id, rawDraft } = (await request.json()) as {
    id: string;
    rawDraft: RawDraftState;
  };

  console.log("[Server] Raw draft action received:", {
    id,
    eventsCount: rawDraft.events.length,
    playersCount: rawDraft.players.length,
  });

  const { updateRawDraft } = await import("~/drizzle/rawDraft.server");
  await updateRawDraft(id, rawDraft);
  console.log("[Server] Raw draft updated in database");

  // Broadcast update to all connected clients
  const { broadcastRawDraftUpdate } = await import(
    "~/websocket/broadcast.server"
  );
  await broadcastRawDraftUpdate(id, rawDraft);
  console.log("[Server] Raw draft update broadcasted to clients");

  return json({ success: true });
};

export const meta: MetaFunction = ({ data }) => {
  const typed = data as SerializeFrom<typeof loader> | undefined;
  if (!typed) return [];

  const rawDraft = typed.data;
  const draftId = typed.urlName!;

  const title = `${draftId} - Raw Draft - TI4 Lab`;
  const description = `Raw Draft (6 players) on TI4 Lab`;

  // Use appropriate image URL based on completion status
  const isComplete = rawDraft.events.length === rawDraft.pickOrder.length;
  const existingImageUrl = isComplete
    ? (typed.imageUrl ?? undefined)
    : (typed.incompleteImageUrl ?? undefined);
  const baseUrl = typed.baseUrl;
  const imageUrl = existingImageUrl || `${baseUrl}/raw-draft/${draftId}.png`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:url", content: `${baseUrl}/raw-draft/${draftId}` },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "TI4 Lab" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
};
