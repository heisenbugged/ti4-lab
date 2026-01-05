import { Grid, Stack, Text } from "@mantine/core";
import { json, redirect } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { useEffect } from "react";
import { useDraft } from "~/draftStore";
import { Draft } from "~/types";
import { LoadingOverlay } from "~/components/LoadingOverlay";
import { validate as validateUUID } from "uuid";
import {
  draftById,
  draftByPrettyUrl,
  generateUniquePrettyUrl,
} from "~/drizzle/draft.server";
import {
  SlicesSection,
  SpeakerOrderSection,
  DraftOrderSection,
  DraftableFactionsSection,
  MapSection,
  DraftSummarySection,
} from "../draft.$id/sections";
import { DraftableMinorFactionsSection } from "../draft.$id/sections/DraftableMinorFactionsSection";
import { DraftablePlayerColorsSection } from "../draft.$id/sections/DraftablePlayerColorsSection";
import { ReplayControls } from "./components/ReplayControls";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { useSafeOutletContext } from "~/useSafeOutletContext";

export default function DraftReplay() {
  const result = useLoaderData<typeof loader>();
  const { setAdminMode, setPickForAnyone } = useSafeOutletContext();
  const draftStore = useDraft();
  const draft = draftStore.draft;
  const settings = draft.settings;

  // Disable admin and pick-for-anyone modes in replay
  useEffect(() => {
    setAdminMode(false);
    setPickForAnyone(false);
  }, []);

  // pre-seed store with loaded persisted draft and enable replay mode
  useEffect(() => {
    draftStore.draftActions.hydrate(result.id!, result.urlName!, result.data);
    draftStore.replayActions.enableReplayMode();
  }, []);

  if (!draftStore.hydrated) return <LoadingOverlay />;

  return (
    <Stack gap="sm" mb="60" mt="lg">
      <ReplayControls />

      <Grid gutter="xl">
        <Grid.Col span={12} order={{ base: 0 }}>
          <Text size="md" ta="right" c="dimmed">
            {result.baseUrl}/draft/{result.urlName}
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
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 5, sm: 5, lg: 5 }}>
          <SlicesSection />
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 6 }} order={{ base: 6, sm: 6, lg: 6 }}>
          <MapSection />
        </Grid.Col>
      </Grid>
    </Stack>
  );
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
      return redirect(`/draft/${draft.urlName}/replay`);
    }

    const prettyUrl = await generateUniquePrettyUrl();
    await db
      .update(drafts)
      .set({ urlName: prettyUrl })
      .where(eq(drafts.id, draftId))
      .run();

    console.log(`redirecting to pretty url ${prettyUrl}`);
    return redirect(`/draft/${prettyUrl}/replay`);
  }

  const result = await draftByPrettyUrl(draftId);
  const { getBaseUrl } = await import("~/env.server");
  return json({
    ...result,
    data: JSON.parse(result.data as string) as Draft,
    baseUrl: getBaseUrl(),
  });
};
