import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
} from "@mantine/core";
import { DiscordData, Draft } from "~/types";
import { useEffect, useState } from "react";
import { DemoMap } from "~/components/DemoMap";
import { SectionTitle } from "~/components/Section";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import { useLoaderData, useLocation, useNavigate } from "@remix-run/react";
import {
  IconBrandDiscordFilled,
  IconFile,
  IconInfoCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { DiscordBanner } from "~/components/DiscordBanner";
import { useDisclosure } from "@mantine/hooks";
import {
  MiltySettingsModal,
  DEFAULT_MILTY_SETTINGS,
  MiltyDraftSettings,
} from "~/components/MiltySettingsModal";
import {
  MiltyEqSettingsModal,
  DEFAULT_MILTYEQ_SETTINGS,
  MiltyEqDraftSettings,
} from "~/components/MiltyEqSettingsModal";
import { useDraftSetup } from "./store";
import { MAPS, ChoosableDraftType } from "./maps";
import { FactionConfigurationSection } from "./components/FactionConfigurationSection";
import { SlicesConfigurationSection } from "./components/SlicesConfigurationSection";
import { MultidraftSection } from "./components/MultidraftSection";
import { MinorFactionsSection } from "./components/MinorFactionsSection";
import { ContentPacksSection } from "./components/ContentPacksSection";
import { AdvancedSettingsSection } from "./components/AdvancedSettingsSection";
import { useDraftSettingsBuilder, useDraftNavigation } from "./hooks";
import { DiscordIntegrationModal } from "./components/DiscordIntegrationModal";
import { MinorFactionsInfoModal } from "./components/MinorFactionsInfoModal";
import { SavedStateModal } from "./components/SavedStateModal";
import { MapStyleSelector } from "./components/MapStyleSelector";

export default function DraftPrechoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const { discordData, discordOauthUrl } = useLoaderData<typeof loader>();
  const [hoveredMapType, setHoveredMapType] = useState<
    ChoosableDraftType | undefined
  >();

  const player = useDraftSetup((state) => state.player);
  const map = useDraftSetup((state) => state.map);

  const [miltySettings, setMiltySettings] = useState<MiltyDraftSettings>(
    DEFAULT_MILTY_SETTINGS,
  );

  const [miltyEqSettings, setMiltyEqSettings] = useState<MiltyEqDraftSettings>(
    DEFAULT_MILTYEQ_SETTINGS,
  );

  // Initialize players from Discord data if available
  useEffect(() => {
    if (discordData?.players) {
      player.setPlayers(
        discordData.players.map((discordPlayer) => ({
          id: discordPlayer.playerId,
          name: discordPlayer.type === "unidentified" ? discordPlayer.name : "",
        })),
      );
    }
  }, [discordData, player]);

  const mapType = hoveredMapType ?? map.selectedMapType;

  const { buildDraftSettings } = useDraftSettingsBuilder(
    miltySettings,
    miltyEqSettings,
  );
  const { navigateToDraft } = useDraftNavigation(discordData);

  const handleChangeName = (playerIdx: number, name: string) => {
    player.changeName(playerIdx, name);
  };

  const handleContinue = () => {
    const draftSettings = buildDraftSettings();
    navigateToDraft(draftSettings);
  };

  const [discordOpened, { open: openDiscord, close: closeDiscord }] =
    useDisclosure(false);

  const [
    minorFactionsOpened,
    { open: openMinorFactions, close: closeMinorFactions },
  ] = useDisclosure(false);

  const [savedStateOpened, { open: openSavedState, close: closeSavedState }] =
    useDisclosure(false);

  const [savedStateJson, setSavedStateJson] = useState("");

  const handleContinueFromSavedState = () => {
    try {
      const savedState = JSON.parse(savedStateJson);
      const savedPlayerCount = savedState.players.length;
      // the saved state player count might be different from the current player count
      // so we need to adjust the players array
      const adjustedPlayers =
        player.players.length < savedPlayerCount
          ? [
              ...player.players,
              ...Array(savedPlayerCount - player.players.length)
                .fill(null)
                .map((_, i) => ({
                  id: player.players.length + i,
                  name: "",
                })),
            ]
          : player.players.slice(0, savedPlayerCount);

      navigate("/draft/new", {
        state: {
          savedDraftState: {
            ...savedState,
            integrations: { discord: discordData },
            players: adjustedPlayers,
            selections: [],
            pickOrder: [],
          } as Draft,
        },
      });
    } catch (error) {
      console.error("Invalid JSON:", error);
    }
  };

  const [
    miltySettingsOpened,
    { open: openMiltySettings, close: closeMiltySettings },
  ] = useDisclosure(false);

  const [
    miltyEqSettingsOpened,
    { open: openMiltyEqSettings, close: closeMiltyEqSettings },
  ] = useDisclosure(false);

  return (
    <Grid mt="lg">
      <MiltySettingsModal
        opened={miltySettingsOpened}
        settings={miltySettings}
        onClose={closeMiltySettings}
        onSave={(newSettings) => setMiltySettings(newSettings)}
      />

      <MiltyEqSettingsModal
        opened={miltyEqSettingsOpened}
        settings={miltyEqSettings}
        onClose={closeMiltyEqSettings}
        onSave={(newSettings) => setMiltyEqSettings(newSettings)}
      />

      <SavedStateModal
        opened={savedStateOpened}
        savedStateJson={savedStateJson}
        onClose={closeSavedState}
        onSavedStateChange={setSavedStateJson}
        onContinue={handleContinueFromSavedState}
      />

      <MinorFactionsInfoModal
        opened={minorFactionsOpened}
        onClose={closeMinorFactions}
      />

      <DiscordIntegrationModal
        opened={discordOpened}
        discordOauthUrl={discordOauthUrl}
        onClose={closeDiscord}
      />
      {discordData && (
        <Grid.Col span={12}>
          <DiscordBanner />
        </Grid.Col>
      )}
      {location.state?.invalidDraftParameters && (
        <Grid.Col span={12}>
          <Alert
            variant="light"
            color="red"
            title="Invalid Draft Parameters"
            icon={<IconInfoCircle />}
          >
            Could not generate a draft with the given parameters. Please try
            different minimal/total optimal values.
          </Alert>
        </Grid.Col>
      )}
      <Grid.Col span={{ base: 12, md: 7 }}>
        <Flex align="center" direction="column">
          <Box w="100%">
            <SectionTitle title="Draft style" />
          </Box>
          <Group w="100%" align="flex-start">
            <MapStyleSelector
              playerCount={player.players.length}
              selectedMapType={map.selectedMapType}
              onMapTypeHover={setHoveredMapType}
              onMapTypeSelect={map.setSelectedMapType}
              onOpenMiltySettings={openMiltySettings}
              onOpenMiltyEqSettings={openMiltyEqSettings}
              onOpenMinorFactionsInfo={openMinorFactions}
            />
            <Box flex={1} pos="relative" mt="sm">
              <Box
                flex={1}
                pos="relative"
                mah="1000px"
                mb="lg"
                visibleFrom="xs"
              >
                {mapType && (
                  <DemoMap
                    id="prechoice-map"
                    map={MAPS[mapType].map}
                    titles={MAPS[mapType].titles}
                    padding={0}
                  />
                )}
              </Box>
              <Paper shadow="md" withBorder px="md" py="sm">
                <Text size="md">{MAPS[mapType].description}</Text>
              </Paper>
            </Box>
          </Group>
        </Flex>
      </Grid.Col>

      <Grid.Col span={12} hiddenFrom="xs">
        <Box flex={1} pos="relative" mah="1000px" mt="lg">
          {mapType && (
            <DemoMap
              id="prechoice-map"
              map={MAPS[mapType].map}
              titles={MAPS[mapType].titles}
              padding={0}
            />
          )}
        </Box>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 5 }}>
        <Stack>
          <PlayerInputSection
            players={player.players}
            discordData={discordData}
            onChangeName={handleChangeName}
            onIncreasePlayers={player.add}
            onDecreasePlayers={player.remove}
          />
          <Stack>
            <SectionTitle title="Configuration" />
            <FactionConfigurationSection />
            <SlicesConfigurationSection />
          </Stack>
          <MultidraftSection />
          <MinorFactionsSection />
          <ContentPacksSection />
          <AdvancedSettingsSection />

          <Button
            size="lg"
            onMouseDown={handleContinue}
            leftSection={<IconPlayerPlay />}
          >
            Continue
          </Button>
          <Group>
            <Button
              size="md"
              flex={1}
              onMouseDown={openSavedState}
              variant="outline"
              color="purple.3"
              leftSection={<IconFile />}
            >
              Continue from saved state
            </Button>
            {!discordData && (
              <Button
                size="md"
                variant="filled"
                color="discordBlue.5"
                leftSection={<IconBrandDiscordFilled />}
                onMouseDown={openDiscord}
              >
                Integrate with Discord
              </Button>
            )}
          </Group>
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

export const loader = async (args: LoaderFunctionArgs) => {
  let discordData: DiscordData | undefined;
  const discordString = new URL(args.request.url).searchParams.get("discord");

  if (discordString) {
    discordData = JSON.parse(atob(discordString)) as DiscordData;
  }

  return { discordData, discordOauthUrl: global.env.discordOauthUrl };
};
