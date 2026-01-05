import {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  json,
  redirect,
} from "@remix-run/node";
import {
  Alert,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
} from "@mantine/core";
import {
  DiscordData,
  Draft,
  DraftSettings,
  Player,
  FactionId,
  GameSet,
} from "~/types";
import { useEffect, useRef, useState } from "react";
import { DemoMap } from "~/components/DemoMap";
import { SectionTitle } from "~/components/Section";
import { PlayerInputSection } from "../draft.new/components/PlayerInputSection";
import {
  useLoaderData,
  useLocation,
  useNavigate,
  useSearchParams,
  useFetcher,
} from "@remix-run/react";
import {
  IconBrandDiscordFilled,
  IconFile,
  IconInfoCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { DiscordBanner } from "~/components/DiscordBanner";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  SliceSettingsModal,
  DEFAULT_SLICE_SETTINGS,
  SliceGenerationSettings,
  SliceSettingsFormatType,
} from "~/components/SliceSettingsModal";
import { useDraftSetup } from "./store";
import { MAPS, ChoosableDraftType } from "./maps";
import { ReferenceCardPacksConfigurationSection } from "./components/ReferenceCardPacksConfigurationSection";
import { SlicesConfigurationSection } from "./components/SlicesConfigurationSection";
import { DraftConfigurationPanel } from "./components/DraftConfigurationPanel";
import { MultidraftSection } from "./components/MultidraftSection";
import { MinorFactionsSection } from "./components/MinorFactionsSection";
import { ContentPacksSection } from "./components/ContentPacksSection";
import { AdvancedSettingsSection } from "./components/AdvancedSettingsSection";
import { RawDraftConfigurationSection } from "./components/RawDraftConfigurationSection";
import { useDraftSettingsBuilder, useDraftNavigation } from "./hooks";
import { DiscordIntegrationModal } from "./components/DiscordIntegrationModal";
import { MinorFactionsInfoModal } from "./components/MinorFactionsInfoModal";
import { SavedStateModal } from "./components/SavedStateModal";
import { MapStyleSelector } from "./components/MapStyleSelector";
import { SeededMapBanner } from "./components/SeededMapBanner";
import { decodeSeededMapData } from "~/mapgen/utils/mapToDraft";
import { DraftFormatDescription } from "./components/DraftFormatDescription";
import buttonClasses from "~/ui/buttons.module.css";
import { createRawDraft } from "~/drizzle/rawDraft.server";
import { RawDraftState } from "~/rawDraftStore";
import { getSystemPool } from "~/utils/system";
import { generateSlices } from "~/draft/milty/sliceGenerator";

export default function DraftPrechoice() {
  const location = useLocation();
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const [searchParams, setSearchParams] = useSearchParams();
  const { discordData, discordOauthUrl, mapSlicesString, selectedDraftType } =
    useLoaderData<typeof loader>();
  const [hoveredMapType, setHoveredMapType] = useState<
    ChoosableDraftType | undefined
  >();

  const player = useDraftSetup((state) => state.player);
  const setPlayers = useDraftSetup((state) => state.player.setPlayers);
  const map = useDraftSetup((state) => state.map);
  const slices = useDraftSetup((state) => state.slices);
  const draftMode = useDraftSetup((state) => state.draftMode);
  const setDraftMode = useDraftSetup((state) => state.setDraftMode);
  const referenceCardPacks = useDraftSetup((state) => state.referenceCardPacks);

  const [sliceSettings, setSliceSettings] = useState<
    Record<SliceSettingsFormatType, SliceGenerationSettings>
  >({
    milty: DEFAULT_SLICE_SETTINGS.milty,
    miltyeq: DEFAULT_SLICE_SETTINGS.miltyeq,
    heisen: DEFAULT_SLICE_SETTINGS.heisen,
  });

  const [activeSettingsFormat, setActiveSettingsFormat] =
    useState<SliceSettingsFormatType>("milty");

  // Initialize players from Discord data if available
  const discordDataInitialized = useRef(false);
  useEffect(() => {
    if (discordData?.players && !discordDataInitialized.current) {
      setPlayers(
        discordData.players.map((discordPlayer) => ({
          id: discordPlayer.playerId,
          name: discordPlayer.type === "unidentified" ? discordPlayer.name : "",
        })),
      );
      discordDataInitialized.current = true;
    }
  }, [discordData, setPlayers]);

  // Initialize from seeded map URL param (one-time on mount)
  const seededMapInitialized = useRef(false);
  useEffect(() => {
    if (mapSlicesString && !seededMapInitialized.current) {
      const seededData = decodeSeededMapData(mapSlicesString);
      if (seededData) {
        // Set player count based on slice count
        const sliceCount = seededData.slices.length;
        const currentPlayerCount = player.players.length;
        if (sliceCount !== currentPlayerCount) {
          const newPlayers = Array(sliceCount)
            .fill(null)
            .map((_, i) => ({
              id: i,
              name: player.players[i]?.name ?? "",
            }));
          setPlayers(newPlayers);
        }

        // Set map type to selected type from URL, or first compatible type
        const draftTypeToUse =
          selectedDraftType &&
          seededData.compatibleDraftTypes.includes(
            selectedDraftType as ChoosableDraftType,
          )
            ? (selectedDraftType as ChoosableDraftType)
            : seededData.compatibleDraftTypes[0];

        if (draftTypeToUse) {
          map.setSelectedMapType(draftTypeToUse as ChoosableDraftType);
        }

        // Set slice count
        slices.setNumSlices(sliceCount);

        seededMapInitialized.current = true;
      }
    }
  }, [mapSlicesString, selectedDraftType, player, setPlayers, map, slices]);

  const mapType = hoveredMapType ?? map.selectedMapType;

  const { buildDraftSettings } = useDraftSettingsBuilder(sliceSettings);
  const { navigateToDraft } = useDraftNavigation(discordData);

  const handleChangeName = (playerIdx: number, name: string) => {
    player.changeName(playerIdx, name);
  };

  const handleMapTypeSelect = (mapType: ChoosableDraftType) => {
    // Clear seeded map params from URL when map type changes
    if (searchParams.has("mapSlices")) {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete("mapSlices");
      newParams.delete("draftType");
      setSearchParams(newParams, { replace: true });
    }
    map.setSelectedMapType(mapType);
  };

  const rawDraft = useDraftSetup((state) => state.rawDraft);

  const handleContinue = () => {
    if (map.selectedMapType === "raw") {
      const playerFactions = rawDraft.config?.playerFactions || {};
      const players = player.players;

      const missingFactions = players.filter(
        (player) =>
          !playerFactions[player.id] || playerFactions[player.id] === null,
      );

      if (missingFactions.length > 0) {
        notifications.show({
          title: "Missing Faction Selections",
          message: `Please select a faction for all players. Missing: ${missingFactions.map((p) => p.name || `Player ${String.fromCharCode(65 + p.id)}`).join(", ")}`,
          color: "red",
        });
        return;
      }

      const selectedFactions = Object.values(playerFactions).filter(
        (f) => f !== null,
      ) as string[];
      const uniqueFactions = new Set(selectedFactions);

      if (selectedFactions.length !== uniqueFactions.size) {
        notifications.show({
          title: "Duplicate Factions",
          message: "Each player must have a unique faction selected.",
          color: "red",
        });
        return;
      }

      const selectedGameSets = rawDraft.getSelectedGameSets();
      const showStatsDisplay = rawDraft.config?.showStatsDisplay ?? true;
      const autoAssignColors = rawDraft.config?.autoAssignColors ?? true;
      const formData = new FormData();
      formData.append("intent", "createRawDraft");
      formData.append("players", JSON.stringify(player.players));
      formData.append("playerFactions", JSON.stringify(playerFactions));
      formData.append("tileGameSets", JSON.stringify(selectedGameSets));
      formData.append("showStatsDisplay", JSON.stringify(showStatsDisplay));
      formData.append("autoAssignColors", JSON.stringify(autoAssignColors));

      fetcher.submit(formData, { method: "POST" });
      return;
    }

    if (draftMode === "twilightFalls") {
      const playerCount = player.players.length;
      const miltyVariantMap: Record<number, ChoosableDraftType> = {
        4: "milty4p",
        5: "milty5p",
        6: "milty",
        7: "milty7p",
        8: "milty8p",
      };

      const draftType: ChoosableDraftType = miltyVariantMap[playerCount]!;

      const twilightsFallSettings: DraftSettings = {
        type: draftType,
        numFactions: 8, // Always 8 Mahact Kings
        factionGameSets: ["twilightsFall"], // Only Mahact Kings faction set
        tileGameSets: ["base", "pok", "te"],
        numSlices: Number(slices.numSlices), // Only customizable setting
        numReferenceCardPacks: referenceCardPacks.numReferenceCardPacks,
        randomizeMap: true,
        randomizeSlices: true,
        draftSpeaker: false,
        allowHomePlanetSearch: false,
        allowEmptyTiles: false,
        draftPlayerColors: false,
        minorFactionsMode: undefined,
        draftGameMode: "twilightsFall",
      };

      navigate("/draft/new", {
        state: {
          draftSettings: twilightsFallSettings,
          players: player.players,
          discordData,
        },
      });
    } else {
      // Base draft mode - use normal settings
      const draftSettings = buildDraftSettings();
      navigateToDraft(draftSettings);
    }
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
    sliceSettingsOpened,
    { open: openSliceSettings, close: closeSliceSettings },
  ] = useDisclosure(false);

  const handleOpenSettings = (formatType: SliceSettingsFormatType) => {
    setActiveSettingsFormat(formatType);
    openSliceSettings();
  };

  return (
    <Grid mt="lg">
      <SliceSettingsModal
        opened={sliceSettingsOpened}
        formatType={activeSettingsFormat}
        settings={sliceSettings[activeSettingsFormat]}
        onClose={closeSliceSettings}
        onSave={(newSettings) => {
          setSliceSettings((prev) => ({
            ...prev,
            [activeSettingsFormat]: newSettings,
          }));
        }}
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
      {mapSlicesString && (
        <Grid.Col span={12}>
          <SeededMapBanner />
        </Grid.Col>
      )}
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
              onMapTypeSelect={handleMapTypeSelect}
              onOpenSettings={handleOpenSettings}
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
              <DraftFormatDescription
                mapType={mapType}
                data={MAPS[mapType].descriptionData}
                title={MAPS[mapType].title}
              />
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
            forcePlayerCount={map.selectedMapType === "raw" ? 6 : undefined}
            disabledTooltip={
              map.selectedMapType === "raw"
                ? "RAW only supported for 6 players"
                : undefined
            }
          />
          <Stack>
            <SectionTitle title="Configuration" />
            {map.selectedMapType === "raw" ? (
              <RawDraftConfigurationSection />
            ) : (
              <>
                <Tabs
                  value={draftMode}
                  onChange={(value) =>
                    setDraftMode(value as "base" | "twilightFalls")
                  }
                  variant="pills"
                >
                  <Tabs.List mb="md">
                    <Tabs.Tab value="base">Base Draft</Tabs.Tab>
                    <Tabs.Tab value="twilightFalls">
                      Twilight&apos;s Fall
                    </Tabs.Tab>
                  </Tabs.List>

              <Tabs.Panel value="base">
                <DraftConfigurationPanel />
              </Tabs.Panel>

              <Tabs.Panel value="twilightFalls">
                <Stack gap="sm">
                  <Alert color="blue" title="Simplified Configuration" variant="light">
                    <Text size="xs">
                      Players pick a &quot;reference card pack&quot; during the snake draft.
                      After drafting, choose home system, faction, and priority from your pack.
                    </Text>
                  </Alert>

                  <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="sm">
                    <SlicesConfigurationSection />
                    <ReferenceCardPacksConfigurationSection />
                  </SimpleGrid>
                </Stack>
              </Tabs.Panel>
            </Tabs>
              </>
            )}
          </Stack>

          <Button
            size="lg"
            onMouseDown={handleContinue}
            leftSection={<IconPlayerPlay />}
            className={buttonClasses.primaryCta}
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

  // Parse seeded map data from URL param
  const mapSlicesString = new URL(args.request.url).searchParams.get(
    "mapSlices",
  );

  // Parse selected draft type from URL param
  const selectedDraftType = new URL(args.request.url).searchParams.get(
    "draftType",
  );

  return {
    discordData,
    discordOauthUrl: global.env.discordOauthUrl,
    mapSlicesString,
    selectedDraftType,
  };
};

// Generate snake draft pick order for 6 players, 5 rounds (30 picks total)
function generateSnakeOrder(numPlayers: number, numRounds: number): number[] {
  const order: number[] = [];
  for (let round = 0; round < numRounds; round++) {
    if (round % 2 === 0) {
      // Forward: 0, 1, 2, 3, 4, 5
      for (let i = 0; i < numPlayers; i++) {
        order.push(i);
      }
    } else {
      // Backward: 5, 4, 3, 2, 1, 0
      for (let i = numPlayers - 1; i >= 0; i--) {
        order.push(i);
      }
    }
  }
  return order;
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  if (intent !== "createRawDraft") {
    return json({ error: "Invalid intent" }, { status: 400 });
  }

  const playersJson = formData.get("players");
  const playerFactionsJson = formData.get("playerFactions");
  const tileGameSetsJson = formData.get("tileGameSets");
  const showStatsDisplayJson = formData.get("showStatsDisplay");
  const autoAssignColorsJson = formData.get("autoAssignColors");

  if (!playersJson || !playerFactionsJson || !tileGameSetsJson) {
    return json({ error: "Missing required data" }, { status: 400 });
  }

  const players = JSON.parse(playersJson as string) as Player[];
  const playerFactions = JSON.parse(playerFactionsJson as string) as Record<
    number,
    FactionId
  >;
  const tileGameSets = JSON.parse(tileGameSetsJson as string) as GameSet[];
  const showStatsDisplay =
    showStatsDisplayJson !== null
      ? (JSON.parse(showStatsDisplayJson as string) as boolean)
      : true;
  const autoAssignColors =
    autoAssignColorsJson !== null
      ? (JSON.parse(autoAssignColorsJson as string) as boolean)
      : true;

  const systemPool = getSystemPool(tileGameSets);
  const slices = generateSlices(6, systemPool, {
    numAlphas: 2,
    numBetas: 2,
    minLegendaries: 1,
  });

  if (!slices) {
    return json({ error: "Failed to generate slices" }, { status: 500 });
  }

  const rawDraftPlayers = slices.map((slice, idx) => ({
    id: idx,
    name: players[idx]?.name || `Player ${String.fromCharCode(65 + idx)}`,
    tiles: slice,
  }));

  const pickOrder = generateSnakeOrder(6, 5);

  let playerColorAssignments: Record<number, string> | undefined = undefined;
  if (autoAssignColors) {
    const { assignColorsToFactions } = await import(
      "~/utils/factionColorAssignment"
    );

    const factionIds = rawDraftPlayers
      .map((player) => playerFactions[player.id])
      .filter((factionId): factionId is FactionId => factionId !== null);

    if (factionIds.length === rawDraftPlayers.length) {
      const colorAssignments = assignColorsToFactions(factionIds);

      const assignments: Record<number, string> = {};
      rawDraftPlayers.forEach((player) => {
        const factionId = playerFactions[player.id];
        if (factionId && colorAssignments.has(factionId)) {
          const assignedColor = colorAssignments.get(factionId);
          if (assignedColor) {
            assignments[player.id] = assignedColor;
          }
        }
      });
      if (Object.keys(assignments).length > 0) {
        playerColorAssignments = assignments;
      }
    }
  }

  const rawDraftState: RawDraftState = {
    initialized: true,
    players: rawDraftPlayers,
    pickOrder,
    events: [],
    gameSets: tileGameSets,
    showStatsDisplay,
    playerColorAssignments,
    playerFactions,
  };

  const { prettyUrl } = await createRawDraft(rawDraftState);

  return redirect(`/raw-draft/${prettyUrl}`);
};
