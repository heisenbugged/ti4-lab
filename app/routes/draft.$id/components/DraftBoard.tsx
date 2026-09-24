import { Grid, Stack, Text } from "@mantine/core";
import type { ReactNode } from "react";
import { useDraft } from "~/draftStore";
import {
  SlicesSection,
  SpeakerOrderSection,
  DraftOrderSection,
  DraftableFactionsSection,
  MapSection,
  DraftSummarySection,
} from "../sections";
import { DraftableMinorFactionsSection } from "../sections/DraftableMinorFactionsSection";
import { DraftablePlayerColorsSection } from "../sections/DraftablePlayerColorsSection";
import { DraftableReferenceCardPacksSection } from "../sections/DraftableReferenceCardPacksSection";

type Props = {
  urlName: string | null;
  children?: ReactNode;
};

export function DraftBoard({ urlName, children }: Props) {
  const settings = useDraft((state) => state.draft.settings);
  const isPresetMapDraft = settings.draftGameMode === "presetMap";

  return (
    <Grid gutter="xl">
      <Grid.Col span={12} order={{ base: 0 }}>
        <Text size="md" ta="right" c="dimmed">
          https://tidraft.com/draft/{urlName}
        </Text>
      </Grid.Col>

      {settings.draftSpeaker && (
        <Grid.Col span={{ base: 12, sm: 6 }} order={{ base: 3, sm: 1, lg: 1 }}>
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
      {!isPresetMapDraft && (
        <Grid.Col
          span={
            settings.draftGameMode === "twilightsFall" && !settings.nucleusStyle
              ? 12
              : { base: 12, lg: 6 }
          }
          order={{ base: 5, sm: 5, lg: 5 }}
        >
          <SlicesSection />
        </Grid.Col>
      )}
      {(settings.draftGameMode !== "twilightsFall" || settings.nucleusStyle) && (
        <Grid.Col
          span={isPresetMapDraft ? 12 : { base: 12, lg: 6 }}
          order={{ base: 6, sm: 6, lg: 6 }}
        >
          <MapSection />
        </Grid.Col>
      )}

      {children}
    </Grid>
  );
}
