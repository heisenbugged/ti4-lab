import { LoaderFunctionArgs } from "@remix-run/node";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Code,
  Collapse,
  Divider,
  Flex,
  Grid,
  Group,
  Image,
  Input,
  List,
  Modal,
  Paper,
  Stack,
  Stepper,
  Switch,
  Text,
  Textarea,
} from "@mantine/core";
import {
  DiscordData,
  Player,
  DraftSettings,
  GameSet,
  DemoTile,
  Draft,
  FactionId,
  FactionStratification,
} from "~/types";
import { useEffect, useState } from "react";
import { DemoMap } from "~/components/DemoMap";
import { SectionTitle } from "~/components/Section";
import { PlayerInputSection } from "./draft.new/components/PlayerInputSection";
import {
  Link,
  useLoaderData,
  useLocation,
  useNavigate,
  useSubmit,
} from "@remix-run/react";
import { DraftType, draftConfig } from "~/draft";
import { NumberStepper } from "~/components/NumberStepper";
import { getFactionCount } from "~/data/factionData";
import {
  IconAlienFilled,
  IconBrandDiscordFilled,
  IconChevronDown,
  IconChevronUp,
  IconFile,
  IconFlagCog,
  IconInfoCircle,
  IconPlayerPlay,
  IconSettings,
  IconShieldCog,
} from "@tabler/icons-react";
import { DiscordBanner } from "~/components/DiscordBanner";
import { useDisclosure } from "@mantine/hooks";
import { hydrateDemoMap } from "~/utils/map";

import "../components/draftprechoice.css";
import { std4p } from "~/draft/std4p";
import { FactionSettingsModal } from "~/components/FactionSettingsModal";
import { getFactionPool } from "~/utils/factions";
import { notifications } from "@mantine/notifications";
import {
  MiltySettingsModal,
  DEFAULT_MILTY_SETTINGS,
  MiltyDraftSettings,
} from "~/components/MiltySettingsModal";

type ChoosableDraftType = Exclude<DraftType, "miltyeqless">;

type PrechoiceMap = {
  title: string;
  description: string;
  map: DemoTile[];
  titles: string[];
  playerCount: number;
};

const MAPS: Record<ChoosableDraftType, PrechoiceMap> = {
  milty: {
    title: "Milty",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    map: hydrateDemoMap(draftConfig.milty),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
  milty4p: {
    title: "Milty 4p",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    map: hydrateDemoMap(draftConfig.milty4p),
    titles: ["Speaker", "2nd", "3rd", "4th"],
    playerCount: 4,
  },
  std4p: {
    title: "4P Small",
    description:
      "A small 4 player draft. Slices are biased towards having one red, but some have two. Other tiles fully randomized.",
    map: hydrateDemoMap(std4p),
    titles: ["P1", "P2", "P3", "P4"],
    playerCount: 4,
  },
  milty5p: {
    title: "Milty 5p",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    map: hydrateDemoMap(draftConfig.milty5p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th"],
    playerCount: 5,
  },
  miltyeq5p: {
    title: "Milty EQ 5p",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    map: hydrateDemoMap(draftConfig.miltyeq5p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th"],
    playerCount: 5,
  },
  milty7p: {
    title: "Milty (7P)",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    map: hydrateDemoMap(draftConfig.milty7p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th"],
    playerCount: 7,
  },
  miltyeq7plarge: {
    title: "Milty EQ (7P) Large",
    description:
      "Large map, 'even' slices, equidistants are preset on the board.",
    map: hydrateDemoMap(draftConfig.miltyeq7plarge),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th"],
    playerCount: 7,
  },
  milty8p: {
    title: "Milty (8P)",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    map: hydrateDemoMap(draftConfig.milty8p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    playerCount: 8,
  },
  heisen8p: {
    title: "Nucleus (8P)",
    description:
      "Features a galactic nucleus for interesting map construction and a balanced draft which separates seat from speaker order. Beneficial for players who want to design their own maps while still running a draft. Randomization prioritizes high wormholes, and separates them for maximum impact.",
    map: hydrateDemoMap(draftConfig.heisen8p),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    playerCount: 8,
  },
  miltyeq: {
    title: "Milty EQ",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    map: hydrateDemoMap(draftConfig.miltyeq),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
  heisen: {
    title: "Nucleus",
    description:
      "Features a galactic nucleus for interesting map construction and a balanced draft which separates seat from speaker order. Beneficial for players who want to design their own maps while still running a draft. Randomization prioritizes high wormholes, and separates them for maximum impact.",
    map: hydrateDemoMap(draftConfig.heisen),
    titles: ["P1", "P2", "P3", "P4", "P5", "P6"],
    playerCount: 6,
  },
  wekker: {
    title: "Wekker",
    description:
      "Also known as 'spiral draft'. Slices contained tiles that are close to other players. Slice generation follows 'milty draft' rules (2 red tiles, 3 blue tiles). Fun for players who want to have a more chaotic draft result.",
    map: hydrateDemoMap(draftConfig.wekker),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
};

export default function DraftPrechoice() {
  const submit = useSubmit();
  const location = useLocation();
  const { discordData, discordOauthUrl } = useLoaderData<typeof loader>();

  const navigate = useNavigate();
  const [draftPlayerColors, setDraftPlayerColors] = useState(false);
  const [allowEmptyMapTiles, setAllowEmptyMapTiles] = useState(false);
  const [allowHomePlanetSearch, setAllowHomePlanetSearch] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [hoveredMapType, setHoveredMapType] = useState<
    ChoosableDraftType | undefined
  >();
  const [players, setPlayers] = useState<Player[]>(() => {
    if (discordData?.players) {
      return discordData.players.map((discordPlayer) => ({
        id: discordPlayer.playerId,
        name: discordPlayer.type === "unidentified" ? discordPlayer.name : "",
      }));
    }

    return Array(6)
      .fill(null)
      .map((_, i) => ({
        id: i,
        name: "",
      }));
  });

  const [selectedMapType, setSelectedMapType] = useState<ChoosableDraftType>(
    () => {
      // Default map type based on player count
      switch (players.length) {
        case 4:
          return "milty4p";
        case 5:
          return "milty5p";
        case 6:
          return "milty"; // milty is the 6p version
        case 7:
          return "milty7p";
        case 8:
          return "milty8p";
        default:
          return "milty"; // fallback to 6p version
      }
    },
  );

  const [isMultidraft, setIsMultidraft] = useState(false);
  const [numDrafts, setNumDrafts] = useState(2);

  const handleChangeSelectedMapType = (mapType: ChoosableDraftType) => {
    setSelectedMapType(mapType);

    // reset all other settings when changing map type
    setNumPreassignedFactions(undefined);
    setNumMinorFactions(undefined);
    setAllowEmptyMapTiles(false);
    setAllowHomePlanetSearch(false);
  };

  const playerCount = players.length;

  const [numFactions, setNumFactions] = useState(playerCount);
  const [numSlices, setNumSlices] = useState(playerCount);

  const [contentFlags, setContentFlags] = useState<ContentFlags>({
    excludeBaseFactions: false,
    excludePokFactions: false,
    withDiscordant: false,
    withDiscordantExp: false,
    withUnchartedStars: false,
    withDrahn: false,
  });
  const {
    excludeBaseFactions,
    excludePokFactions,
    withDiscordant,
    withDiscordantExp,
    withUnchartedStars,
    withDrahn,
  } = contentFlags;

  const setWithDiscordantExp = (v: boolean) =>
    setContentFlags((prev) => ({ ...prev, withDiscordantExp: v }));

  const setWithUnchartedStars = (v: boolean) =>
    setContentFlags((prev) => ({ ...prev, withUnchartedStars: v }));

  const setWithDrahn = (v: boolean) =>
    setContentFlags((prev) => ({ ...prev, withDrahn: v }));

  const setExcludeBaseFactions = (v: boolean) =>
    setContentFlags((prev) => ({ ...prev, excludeBaseFactions: v }));

  const setExcludePokFactions = (v: boolean) =>
    setContentFlags((prev) => ({ ...prev, excludePokFactions: v }));

  const [draftSpeaker, setDraftSpeaker] = useState<boolean>(false);
  const [banFactions, setBanFactions] = useState<boolean>(false);

  const [numPreassignedFactions, setNumPreassignedFactions] = useState<
    number | undefined
  >();

  const [minorFactionsEnabled, setMinorFactionsEnabled] =
    useState<boolean>(false);
  const [numMinorFactions, setNumMinorFactions] = useState<number | undefined>(
    undefined,
  );
  const [minorFactionsInSharedPool, setMinorFactionsInSharedPool] =
    useState<boolean>(false);

  const tileGameSets = getTileSetsFromFlags(contentFlags);
  const factionGameSets = getFactionGameSetsFromFlags(contentFlags);

  const maxFactionCount = getFactionCount(factionGameSets);
  const maxPreassigned = Math.floor(maxFactionCount / playerCount);
  const minNumFactions = minorFactionsInSharedPool
    ? playerCount * 2
    : playerCount;
  const maxNumFactions = maxFactionCount - (numMinorFactions ?? 0);

  const handleChangeNumFactions = (num: number) => {
    if (stratifiedConfig !== undefined) {
      notifications.show({
        message: "Faction stratification was reset.",
        color: "blue",
      });
      setStratifiedConfig(undefined);
    }
    setNumFactions(num);
  };

  useEffect(() => {
    if (numFactions > maxFactionCount) {
      handleChangeNumFactions(maxFactionCount);
    }
  }, [maxFactionCount]);

  const [allowedFactions, setAllowedFactions] = useState<
    FactionId[] | undefined
  >(undefined);
  const [requiredFactions, setRequiredFactions] = useState<
    FactionId[] | undefined
  >(undefined);
  const [stratifiedConfig, setStratifiedConfig] = useState<
    FactionStratification | undefined
  >(undefined);

  const handleSaveFactionSettings = (
    allowedFactions: FactionId[],
    requiredFactions: FactionId[],
    stratifiedConfig: FactionStratification | undefined,
  ) => {
    setAllowedFactions(allowedFactions);
    setRequiredFactions(requiredFactions);
    setStratifiedConfig(stratifiedConfig);

    const numStratifiedFactions = Object.values(stratifiedConfig ?? {}).reduce(
      (acc, curr) => acc + curr,
      0,
    );
    if (numStratifiedFactions > 0) {
      setNumFactions(numStratifiedFactions);
    } else {
      setNumFactions(
        Math.max(numFactions, playerCount, requiredFactions?.length ?? 0),
      );
    }

    closeFactionSettings();
  };

  const handleToggleDiscordantStars = () => {
    const newWithDiscordantValue = !withDiscordant;
    const newContentFlags = {
      ...contentFlags,
      withDiscordant: newWithDiscordantValue,
      withDiscordantExp: newWithDiscordantValue,
      withUnchartedStars: newWithDiscordantValue,
    };

    // if turning off discordant, remove base and pok overrides
    if (!newWithDiscordantValue) {
      newContentFlags.excludeBaseFactions = false;
      newContentFlags.excludePokFactions = false;
    }

    setContentFlags(newContentFlags);
  };

  // reset allowed and required factions when content flags change
  useEffect(() => {
    setAllowedFactions(undefined);
    setRequiredFactions(undefined);
  }, [contentFlags]);

  const handleToggleMinorFactions = () => {
    // toggling to true
    if (!minorFactionsEnabled) {
      setMinorFactionsEnabled(true);
      setMinorFactionsInSharedPool(false);
      setNumMinorFactions(playerCount);
      setAllowEmptyMapTiles(true);
    } else {
      // toggling to false
      setMinorFactionsEnabled(false);
      setMinorFactionsInSharedPool(false);
      setNumMinorFactions(undefined);
      setAllowEmptyMapTiles(false);
    }
  };

  const handleToggleMinorFactionsInSharedPool = () => {
    // if toggling to true, we need at least 2*player count in factions
    if (minorFactionsInSharedPool === false) {
      handleChangeNumFactions(playerCount * 2);
      setNumMinorFactions(undefined);
      setMinorFactionsInSharedPool(true);
    } else {
      // toggling to false
      if (minorFactionsEnabled) {
        setNumMinorFactions(playerCount);
      }
      setNumPreassignedFactions(undefined);
      setMinorFactionsInSharedPool(false);
    }
  };

  const handleAddMinorFaction = () => {
    if (numMinorFactions === undefined) return;
    setNumMinorFactions(numMinorFactions + 1);
  };

  const handleRemoveMinorFaction = () => {
    if (numMinorFactions === undefined) return;
    setNumMinorFactions(numMinorFactions - 1);
  };

  const handleTogglePreassignedFactions = () => {
    if (numPreassignedFactions === undefined) {
      handleIncreasePreassignedFactions(2);
    } else {
      setNumPreassignedFactions(undefined);
      handleChangeNumFactions(playerCount);
    }
  };

  const handleIncreasePreassignedFactions = (num = 1) => {
    const preassignedNo =
      numPreassignedFactions !== undefined
        ? Number(numPreassignedFactions) + num
        : num;

    setNumPreassignedFactions(preassignedNo);
    handleChangeNumFactions(preassignedNo * playerCount);
  };

  const handleDecreasePreassignedFactions = (num = 1) => {
    const preassignedNo =
      numPreassignedFactions !== undefined
        ? Number(numPreassignedFactions) - num
        : num;
    setNumPreassignedFactions(preassignedNo);
    handleChangeNumFactions(preassignedNo * playerCount);
  };

  const resetSelectedMap = (numPlayers: number) => {
    if (MAPS[selectedMapType].playerCount !== numPlayers) {
      // find first eligible map type
      const newMapType = Object.keys(MAPS).find(
        (key) => MAPS[key as ChoosableDraftType].playerCount === numPlayers,
      ) as ChoosableDraftType;
      setSelectedMapType(newMapType);
    }
  };

  const handleAddPlayer = () => {
    setPlayers((players) => [
      ...players,
      {
        id: players.length,
        name: "",
      },
    ]);

    const numPlayers = players.length + 1;
    if (numFactions < numPlayers) handleChangeNumFactions(numPlayers);
    if (numSlices < numPlayers) setNumSlices(numPlayers);
    resetSelectedMap(numPlayers);
  };

  const handleRemovePlayer = () => {
    const numPlayers = players.length - 1;
    setPlayers((players) => players.slice(0, numPlayers));
    resetSelectedMap(numPlayers);
  };

  const mapType = hoveredMapType ?? selectedMapType;

  const handleChangeName = (playerIdx: number, name: string) => {
    setPlayers((players) =>
      players.map((player) =>
        player.id === playerIdx ? { ...player, name } : player,
      ),
    );
  };
  const handleContinue = () => {
    const draftSettings: DraftSettings = {
      factionGameSets,
      tileGameSets,
      type: selectedMapType,
      numFactions: Number(numFactions),
      numSlices: Number(numSlices),
      randomizeSlices: true,
      randomizeMap: !minorFactionsEnabled,
      draftSpeaker,
      allowHomePlanetSearch,
      allowEmptyTiles: allowEmptyMapTiles,
      numPreassignedFactions,
      draftPlayerColors,
      modifiers: banFactions ? { banFactions: { numFactions: 1 } } : undefined,
      allowedFactions: allowedFactions,
      requiredFactions: requiredFactions,
      factionStratification: stratifiedConfig,
    };

    // Add Milty-specific settings if the selected map type is 'milty'
    if (selectedMapType === "milty") {
      draftSettings.sliceGenerationConfig = {
        minOptimal: miltySettings.minOptimal ?? 9,
        maxOptimal: miltySettings.maxOptimal ?? 13,
        safePathToMecatol: miltySettings.safePathToMecatol,
        highQualityAdjacent: miltySettings.highQualityAdjacent,
        numAlphas: miltySettings.minAlphaWormholes,
        numBetas: miltySettings.minBetaWormholes,
        numLegendaries: miltySettings.minLegendaries,
      };
    }

    // both cannot be set at the same time
    if (minorFactionsInSharedPool) {
      draftSettings.minorFactionsInSharedPool = true;
    } else if (numMinorFactions !== undefined) {
      draftSettings.numMinorFactions = numMinorFactions;
    }

    if (isMultidraft) {
      const formData = new FormData();
      formData.append("draftSettings", JSON.stringify(draftSettings));
      formData.append("players", JSON.stringify(players));
      formData.append(
        "discordData",
        discordData ? JSON.stringify(discordData) : "",
      );
      formData.append("numDrafts", numDrafts.toString());

      submit(formData, {
        method: "post",
        action: "/multidraft",
      });
      return;
    }

    navigate("/draft/new", {
      state: {
        draftSettings,
        players,
        discordData,
      },
    });
  };

  const [discordOpened, { open: openDiscord, close: closeDiscord }] =
    useDisclosure(false);

  const [
    minorFactionsOpened,
    { open: openMinorFactions, close: closeMinorFactions },
  ] = useDisclosure(false);

  const [savedStateOpened, { open: openSavedState, close: closeSavedState }] =
    useDisclosure(false);

  const [
    factionSettingsOpened,
    { open: openFactionSettings, close: closeFactionSettings },
  ] = useDisclosure(false);

  const [savedStateJson, setSavedStateJson] = useState("");

  const handleContinueFromSavedState = () => {
    try {
      const savedState = JSON.parse(savedStateJson);
      const savedPlayerCount = savedState.players.length;
      // the saved state player count might be different from the current player count
      // so we need to adjust the players array
      const adjustedPlayers =
        players.length < savedPlayerCount
          ? [
              ...players,
              ...Array(savedPlayerCount - players.length)
                .fill(null)
                .map((_, i) => ({
                  id: players.length + i,
                  name: "",
                })),
            ]
          : players.slice(0, savedPlayerCount);

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

  const [miltySettings, setMiltySettings] = useState<MiltyDraftSettings>(
    DEFAULT_MILTY_SETTINGS,
  );

  return (
    <Grid mt="lg">
      <FactionSettingsModal
        buttonText="Save"
        opened={factionSettingsOpened}
        numPlayers={players.length}
        factionPool={getFactionPool(factionGameSets)}
        factionGameSets={factionGameSets}
        savedAllowedFactions={allowedFactions}
        savedRequiredFactions={requiredFactions}
        savedStratifiedConfig={stratifiedConfig}
        onClose={closeFactionSettings}
        onSave={handleSaveFactionSettings}
      />

      <MiltySettingsModal
        opened={miltySettingsOpened}
        settings={miltySettings}
        onClose={closeMiltySettings}
        onSave={(newSettings) => setMiltySettings(newSettings)}
      />

      <Modal
        opened={savedStateOpened}
        onClose={closeSavedState}
        title="Continue from saved state"
      >
        <Stack>
          <Textarea
            placeholder="Paste your saved draft state JSON here"
            autosize
            minRows={15}
            maxRows={30}
            value={savedStateJson}
            onChange={(event) => setSavedStateJson(event.currentTarget.value)}
          />
          <Button onClick={handleContinueFromSavedState}>Continue</Button>
        </Stack>
      </Modal>
      <Modal
        size="lg"
        opened={minorFactionsOpened}
        onClose={closeMinorFactions}
        title="How to run a minor factions draft"
      >
        <Text size="lg" fw="bold">
          TI4 Lab supports minor factions (unofficially)!
        </Text>

        <Text mt="lg">To run a minor factions draft:</Text>
        <List mt="lg" mx="sm">
          <List.Item>Use Milty EQ as the draft format.</List.Item>
          <List.Item>
            Click &apos;Minor factions&apos; in advanced settings.
          </List.Item>
          <List.Item>Specify the number of minor factions to draft.</List.Item>
        </List>
        <Text mt="lg">
          Minor factions are drafted like regular factions, but they are placed
          in the left equidistant system slots.
        </Text>
      </Modal>
      <Modal
        size="lg"
        opened={discordOpened}
        onClose={closeDiscord}
        title={
          <Group>
            <IconBrandDiscordFilled />
            <Text>Integrate with Discord</Text>
          </Group>
        }
      >
        <Stack mb="lg" gap="xs">
          <Text>
            The TI4 Lab robot will notify players via the chosen channel when it
            is their turn to draft.
          </Text>
          <Text c="dimmed" size="sm">
            NOTE: Any players that you <Code>@mention</Code> during{" "}
            <Code>/labdraft</Code> will be mentioned in the notification when
            it's their turn.
          </Text>
        </Stack>

        <Stepper orientation="vertical" active={0}>
          <Stepper.Step
            label="Add the discord bot to your server"
            description={
              <Link to={discordOauthUrl} reloadDocument>
                <Button
                  mt={4}
                  size="sm"
                  leftSection={<IconBrandDiscordFilled />}
                  variant="filled"
                  color="discordBlue.5"
                >
                  Authorize
                </Button>
              </Link>
            }
          />
          <Stepper.Step
            label="Start a draft via /labdraft"
            description={<Image src="/discorddraft.png" />}
          ></Stepper.Step>
          <Stepper.Step
            label="Setup draft on TI4 Lab"
            description={
              <Stack>
                <Text>Follow the created draft link.</Text>
                <Image src="/discorddraftresponse.png" />
              </Stack>
            }
            mt="lg"
          />
        </Stepper>
      </Modal>
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
            <Stack
              gap="xs"
              onMouseLeave={() => setHoveredMapType(undefined)}
              mt="sm"
            >
              {Object.entries(MAPS).map(([type, { title, playerCount }]) => {
                if (playerCount !== players.length) return null;

                if (type === "milty") {
                  return (
                    <Group key={type} gap="xs">
                      <Button
                        miw="110px"
                        color="blue"
                        size="md"
                        variant={
                          selectedMapType === type ? "filled" : "outline"
                        }
                        ff="heading"
                        onMouseOver={() =>
                          setHoveredMapType(type as ChoosableDraftType)
                        }
                        onMouseDown={() =>
                          handleChangeSelectedMapType(
                            type as ChoosableDraftType,
                          )
                        }
                      >
                        {title}
                      </Button>
                      <Button
                        variant="outline"
                        color="blue"
                        size="md"
                        onClick={() => openMiltySettings()}
                      >
                        <IconSettings size={18} />
                      </Button>
                    </Group>
                  );
                }

                return (
                  <Button
                    key={type}
                    miw="150px"
                    color="blue"
                    size="md"
                    variant={selectedMapType === type ? "filled" : "outline"}
                    ff="heading"
                    onMouseOver={() =>
                      setHoveredMapType(type as ChoosableDraftType)
                    }
                    onMouseDown={() =>
                      handleChangeSelectedMapType(type as ChoosableDraftType)
                    }
                  >
                    {title}
                  </Button>
                );
              })}
              <Divider />
              <Button
                color="orange"
                variant="outline"
                onMouseDown={openMinorFactions}
              >
                Minor Factions
              </Button>
            </Stack>
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
            players={players}
            discordData={discordData}
            onChangeName={handleChangeName}
            onIncreasePlayers={handleAddPlayer}
            onDecreasePlayers={handleRemovePlayer}
          />
          <Stack>
            <SectionTitle title="Configuration" />

            <Input.Wrapper
              label="# of Factions"
              description="The number factions available for the draft. Recommended is player count + 3. Can be changed during draft building."
            >
              <Box mt="xs">
                <NumberStepper
                  value={numFactions}
                  decrease={() => handleChangeNumFactions(numFactions - 1)}
                  increase={() => handleChangeNumFactions(numFactions + 1)}
                  decreaseDisabled={
                    !!numPreassignedFactions || numFactions <= minNumFactions
                  }
                  increaseDisabled={
                    !!numPreassignedFactions ||
                    numFactions >= maxFactionCount - (numMinorFactions ?? 0)
                  }
                />
              </Box>
            </Input.Wrapper>

            <Button
              variant="outline"
              color="orange"
              w="fit-content"
              rightSection={<IconAlienFilled />}
              onMouseDown={openFactionSettings}
            >
              Configure faction pool
            </Button>

            {mapType === "miltyeq" && (
              <Group>
                <Switch
                  label="Minor factions"
                  description="Will provide a pool of 'minor factions' to draft. Minor factions are placed in the left equidistant system slots."
                  checked={minorFactionsEnabled}
                  onChange={handleToggleMinorFactions}
                />

                {minorFactionsEnabled && (
                  <Group align="center" justify="center" mb="lg" mx="md">
                    <Input.Wrapper
                      label="# of Minor Factions"
                      opacity={minorFactionsInSharedPool ? 0.5 : 1}
                    >
                      <Box mt="xs">
                        <NumberStepper
                          value={numMinorFactions}
                          decrease={handleRemoveMinorFaction}
                          increase={handleAddMinorFaction}
                          decreaseDisabled={
                            minorFactionsInSharedPool ||
                            Number(numMinorFactions) <= playerCount
                          }
                          increaseDisabled={
                            minorFactionsInSharedPool ||
                            Number(numMinorFactions) >= maxNumFactions
                          }
                        />
                      </Box>
                    </Input.Wrapper>
                    <Text>OR</Text>
                    <Checkbox
                      label="Minor factions in shared pool"
                      checked={minorFactionsInSharedPool}
                      onChange={handleToggleMinorFactionsInSharedPool}
                    />
                  </Group>
                )}
              </Group>
            )}

            <Input.Wrapper
              label="# of Slices"
              description="The number of slices that will be available for the draft. Can be changed during draft building."
            >
              <Box mt="xs">
                <NumberStepper
                  value={numSlices}
                  decrease={() => setNumSlices((v) => v - 1)}
                  increase={() => setNumSlices((v) => v + 1)}
                  decreaseDisabled={numSlices <= playerCount}
                  increaseDisabled={numSlices >= 9}
                />
              </Box>
            </Input.Wrapper>
          </Stack>

          <Group>
            <Switch
              label="Multidraft"
              description="Will create multiple drafts with the same settings, with a link to view them all on one page."
              checked={isMultidraft}
              onChange={(event) => setIsMultidraft(event.currentTarget.checked)}
            />
            {isMultidraft && (
              <Input.Wrapper label="Number of drafts">
                <Box mt="xs">
                  <NumberStepper
                    value={numDrafts}
                    decrease={() => setNumDrafts((v) => Math.max(1, v - 1))}
                    increase={() => setNumDrafts((v) => v + 1)}
                    increaseDisabled={numDrafts >= 9}
                    decreaseDisabled={numDrafts <= 2}
                  />
                </Box>
              </Input.Wrapper>
            )}
          </Group>

          <Stack>
            <Checkbox
              label="Discordant Stars"
              checked={withDiscordant}
              onChange={handleToggleDiscordantStars}
            />
            {withDiscordant && (
              <Group mx="lg">
                <Checkbox
                  label="Base factions"
                  checked={!excludeBaseFactions}
                  onChange={() => setExcludeBaseFactions(!excludeBaseFactions)}
                />
                <Checkbox
                  label="POK factions"
                  checked={!excludePokFactions}
                  onChange={() => setExcludePokFactions(!excludePokFactions)}
                />
                <Checkbox
                  label="(+10 factions)"
                  checked={withDiscordantExp}
                  onChange={() => setWithDiscordantExp(!withDiscordantExp)}
                />

                <Checkbox
                  label="Uncharted Stars"
                  checked={withUnchartedStars}
                  onChange={() => setWithUnchartedStars(!withUnchartedStars)}
                />
              </Group>
            )}
          </Stack>

          <Box mt="md">
            <Button
              variant="outline"
              color="blue"
              w="auto"
              rightSection={
                showAdvancedSettings ? <IconChevronDown /> : <IconChevronUp />
              }
              onMouseDown={() => setShowAdvancedSettings((v) => !v)}
            >
              Show advanced settings
            </Button>
          </Box>
          <Collapse in={showAdvancedSettings}>
            <Stack>
              <SectionTitle title="Advanced Options" />

              <Switch
                checked={draftSpeaker}
                onChange={() => setDraftSpeaker((v) => !v)}
                label="Draft speaker order separately"
                description="If true, the draft will be a 4-part snake draft, where seat selection and speaker order are separate draft stages. Otherwise, speaker order is locked to the north position and proceeds clockwise."
              />

              <Switch
                label="Faction ban phase"
                description="When draft starts, players will ban one faction each. The tool then rolls the remaining factions."
                checked={banFactions}
                onChange={() => setBanFactions((v) => !v)}
                disabled={minorFactionsInSharedPool}
              />

              <Group>
                <Switch
                  label="Faction bags"
                  description="If turned on, will pre-assign a 'bag' of # factions to each player. A player then chooses a faction only from their assigned 'bag' during the draft."
                  checked={Number(numPreassignedFactions) > 0}
                  onChange={handleTogglePreassignedFactions}
                  disabled={minorFactionsInSharedPool}
                />

                {numPreassignedFactions !== undefined && (
                  <NumberStepper
                    value={numPreassignedFactions}
                    decrease={() => handleDecreasePreassignedFactions(1)}
                    increase={() => handleIncreasePreassignedFactions(1)}
                    decreaseDisabled={numPreassignedFactions <= 1}
                    increaseDisabled={numPreassignedFactions >= maxPreassigned}
                  />
                )}
              </Group>

              <Switch
                label="Draft player colors"
                description="Allows players to choose their in-game color via final round of draft."
                checked={draftPlayerColors}
                onChange={() => setDraftPlayerColors((v) => !v)}
              />

              <Switch
                label="Allow home planets on map"
                description="Will allow you to put home planets on the board with no/minimal restrictions"
                checked={allowHomePlanetSearch}
                onChange={() => setAllowHomePlanetSearch((v) => !v)}
              />
              <Checkbox
                label="Drahn"
                checked={withDrahn}
                onChange={() => {
                  setWithDrahn(!withDrahn);
                }}
              />
            </Stack>
          </Collapse>

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

  return { discordData, discordOauthUrl: env.discordOauthUrl };
};

type ContentFlags = {
  excludeBaseFactions: boolean;
  excludePokFactions: boolean;
  withDiscordant: boolean;
  withDiscordantExp: boolean;
  withDrahn: boolean;
  withUnchartedStars: boolean;
};

const getTileSetsFromFlags = ({
  withDiscordant,
  withDiscordantExp,
  withUnchartedStars,
}: ContentFlags) => {
  const tileGameSets: GameSet[] = ["base", "pok"];
  if (withDiscordant) tileGameSets.push("discordant");
  if (withDiscordantExp) tileGameSets.push("discordantexp");
  if (withUnchartedStars) tileGameSets.push("unchartedstars");

  return tileGameSets;
};

const getFactionGameSetsFromFlags = ({
  excludeBaseFactions,
  excludePokFactions,
  withDiscordant,
  withDiscordantExp,
  withDrahn,
}: ContentFlags) => {
  const factionGameSets: GameSet[] = [];
  if (!excludeBaseFactions) factionGameSets.push("base");
  if (!excludePokFactions) factionGameSets.push("pok");
  if (withDiscordant) factionGameSets.push("discordant");
  if (withDiscordantExp) factionGameSets.push("discordantexp");
  if (withDrahn) factionGameSets.push("drahn");
  return factionGameSets;
};
