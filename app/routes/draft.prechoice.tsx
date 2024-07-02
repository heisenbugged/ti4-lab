import { LoaderFunctionArgs } from "@remix-run/node";
import {
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
} from "@mantine/core";
import {
  DiscordData,
  Player,
  DraftSettings,
  GameSet,
  PlayerDemoTile,
  SystemId,
  SystemTile,
  OpenTile,
  ClosedTile,
  DemoTile,
} from "~/types";
import { useEffect, useState } from "react";
import { mapStringOrder } from "~/data/mapStringOrder";
import { DemoMap } from "~/components/DemoMap";
import { SectionTitle } from "~/components/Section";
import { PlayerInputSection } from "./draft.new/components/PlayerInputSection";
import { Link, useLoaderData, useNavigate } from "@remix-run/react";
import { DraftConfig, DraftType, draftConfig } from "~/draft";
import { NumberStepper } from "~/components/NumberStepper";
import { getFactionCount } from "~/data/factionData";
import { systemData } from "~/data/systemData";
import {
  IconBrandDiscordFilled,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";
import { DiscordBanner } from "~/components/DiscordBanner";

import "../components/draftprechoice.css";
import { useDisclosure } from "@mantine/hooks";

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
    map: parseDemoMapString(
      draftConfig.milty,
      "18 1 2 3 4 5 6 1 1 2 2 3 3 4 4 5 5 6 6 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
  milty7p: {
    title: "Milty (7P)",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    map: parseDemoMapString(
      draftConfig.milty7p,
      "18 S83B 2 3 S84B S89B 6 1 1 2 2 3 3 4 5 5 6 6 7 1 S85B 2 2 2 3 3 3 S86B 4 4 5 5 6 S88B:120 7 7 7 1 1 x x x x x x x x x 4 4 4 5 5 x x 6 6 x 7 7 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th"],
    playerCount: 7,
  },
  milty8p: {
    title: "Milty (8P)",
    description:
      "The original draft format. Slices include the left equidistant system, and no preset tiles are on the board. Every slice is guaranteed two red tiles and three blue tiles. Legendaries and wormholes are distributed evenly across slices.",
    map: parseDemoMapString(
      draftConfig.milty8p,
      "18 S87A:60 S89B:180 3 S88A:120 S90B 7 1 2 2 3 3 4 5 6 6 7 7 8 1 1 2 2 3 S83B:120 4 4 4 5 5 6 6 7 S85B:120 8 8 8 1 1 2 2 x x 3 3 x 4 4 5 5 5 6 6 x x 7 7 x 8 8 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"],
    playerCount: 8,
  },
  miltyeq: {
    title: "Milty EQ",
    description:
      "Like milty, but, with a twist. Equidistants are not considered part of one's slice, and are instead preset on the board. Slices are biased towards having one red, but some have two. Equidistants are fully randomized.",
    map: parseDemoMapString(
      draftConfig.miltyeq,
      "18 1 2 3 4 5 6 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
  heisen: {
    title: "Nucleus",
    description:
      "Features a galactic nucleus for interesting map construction and a balanced draft which separates seat from speaker order. Beneficial for players who want to design their own maps while still running a draft. Randomization prioritizes high wormholes, and separates them for maximum impact.",
    map: parseDemoMapString(
      draftConfig.heisen,
      "18 -1 -1 -1 -1 -1 -1 1 -1 2 -1 3 -1 4 -1 5 -1 6 -1 1 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1".split(
        " ",
      ),
    ),
    titles: ["P1", "P2", "P3", "P4", "P5", "P6"],
    playerCount: 6,
  },
  wekker: {
    title: "Wekker",
    description:
      "Also known as 'spiral draft'. Slices contained tiles that are close to other players. Slice generation follows 'milty draft' rules (2 red tiles, 3 blue tiles). Fun for players who want to have a more chaotic draft result.",
    map: parseDemoMapString(
      draftConfig.miltyeq,
      "18 6 1 2 3 4 5 1 1 2 2 3 3 4 4 5 5 6 6 1 2 2 2 3 3 3 4 4 4 5 5 5 6 6 6 1 1".split(
        " ",
      ),
    ),
    titles: ["Speaker", "2nd", "3rd", "4th", "5th", "6th"],
    playerCount: 6,
  },
};

export default function DraftPrechoice() {
  const { discordData } = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  const [allowEmptyMapTiles, setAllowEmptyMapTiles] = useState(false);
  const [allowHomePlanetSearch, setAllowHomePlanetSearch] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [hoveredMapType, setHoveredMapType] = useState<
    ChoosableDraftType | undefined
  >();
  const [selectedMapType, setSelectedMapType] =
    useState<ChoosableDraftType>("milty");

  const [players, setPlayers] = useState<Player[]>([
    ...[0, 1, 2, 3, 4, 5].map((i) => {
      const discordPlayer = discordData?.players.find(
        (discordPlayer) => discordPlayer.playerId === i,
      );
      const name =
        discordPlayer?.type === "unidentified" ? discordPlayer.name : "";

      return {
        id: i,
        name,
      };
    }),
  ]);
  const playerCount = players.length;

  const [numFactions, setNumFactions] = useState(playerCount);
  const [numSlices, setNumSlices] = useState(playerCount);
  const [randomizeSlices, setRandomizeSlices] = useState<boolean>(true);
  const [randomizeMap, setRandomizeMap] = useState<boolean>(true);

  const [withDiscordant, setWithDiscordant] = useState<boolean>(false);
  const [withDiscordantExp, setWithDiscordantExp] = useState<boolean>(false);
  const [withUnchartedStars, setWithUnchartedStars] = useState<boolean>(false);

  const [numPreassignedFactions, setNumPreassignedFactions] = useState<
    number | undefined
  >();

  const handleTogglePreassignedFactions = () => {
    if (numPreassignedFactions === undefined) {
      handleIncreasePreassignedFactions(2);
    } else {
      setNumPreassignedFactions(undefined);
      setNumFactions(playerCount);
    }
  };

  const handleIncreasePreassignedFactions = (num = 1) => {
    const preassignedNo =
      numPreassignedFactions !== undefined
        ? Number(numPreassignedFactions) + num
        : num;

    setNumPreassignedFactions(preassignedNo);
    setNumFactions(preassignedNo * playerCount);
  };

  const handleDecreasePreassignedFactions = (num = 1) => {
    const preassignedNo =
      numPreassignedFactions !== undefined
        ? Number(numPreassignedFactions) - num
        : num;
    setNumPreassignedFactions(preassignedNo);
    setNumFactions(preassignedNo * playerCount);
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
    if (numFactions < numPlayers) setNumFactions(numPlayers);
    if (numSlices < numPlayers) setNumSlices(numPlayers);
    resetSelectedMap(numPlayers);
  };

  const handleRemovePlayer = () => {
    const numPlayers = players.length - 1;
    setPlayers((players) => players.slice(0, numPlayers));
    resetSelectedMap(numPlayers);
  };

  let gameSets: GameSet[] = ["base", "pok"];
  if (withDiscordant) gameSets.push("discordant");
  if (withDiscordantExp) gameSets.push("discordantexp");
  if (withUnchartedStars) gameSets.push("unchartedstars");

  const maxFactionCount = getFactionCount(gameSets);
  const maxPreassigned = Math.floor(maxFactionCount / playerCount);

  useEffect(() => {
    if (numFactions > maxFactionCount) {
      setNumFactions(maxFactionCount);
    }
  }, [maxFactionCount]);

  const mapType = hoveredMapType ?? selectedMapType;
  const config = selectedMapType ? draftConfig[selectedMapType] : undefined;
  const showRandomizeMapTiles = config
    ? config.modifiableMapTiles.length > 0
    : true;

  const handleChangeName = (playerIdx: number, name: string) => {
    setPlayers((players) =>
      players.map((player) =>
        player.id === playerIdx ? { ...player, name } : player,
      ),
    );
  };
  const handleContinue = () => {
    const draftSettings: DraftSettings = {
      gameSets,
      type: selectedMapType,
      numFactions: Number(numFactions),
      numSlices: Number(numSlices),
      randomizeSlices,
      randomizeMap,
      draftSpeaker: config?.type === "heisen",
      allowHomePlanetSearch,
      allowEmptyTiles: allowEmptyMapTiles,
      numPreassignedFactions: numPreassignedFactions,
    };

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

  return (
    <Grid mt="lg">
      <Modal
        size="lg"
        opened={minorFactionsOpened}
        onClose={closeMinorFactions}
        title="How to run a minor factions draft"
      >
        <Text size="lg" fw="bold">
          TI4 Lab supports minor factions (unofficially)!
        </Text>
        <Text>
          Due to there being no official rules, minor factions are not directly
          integrated into the draft, but you can still run a draft with them.
        </Text>
        <Text mt="lg">To run a minor factions draft:</Text>
        <List mt="lg" mx="sm">
          <List.Item>
            Enable 'Allow search of home planets' in advanced settings.
          </List.Item>
          <List.Item>
            Enable 'Allow empty map tiles' in advanced settings.
          </List.Item>
          <List.Item>Use Milty EQ as the draft format.</List.Item>
        </List>
        <Text mt="lg">
          You can place home systems on the map before the draft begins, or
          during the draft by flipping 'admin mode' on. The actual process of
          drafting the minor factions is up to you.
        </Text>
      </Modal>
      <Modal
        size="lg"
        opened={discordOpened}
        onClose={closeDiscord}
        title={
          <Group>
            <IconBrandDiscordFilled />
            <Text>Integrate with Discord (BETA)</Text>
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
            <Code>/startdraft</Code> will be mentioned in the notification when
            it's their turn.
          </Text>
        </Stack>

        <Stepper orientation="vertical" active={0}>
          <Stepper.Step
            label="Add the discord bot to your server"
            description={
              <Link
                to="https://discord.com/oauth2/authorize?client_id=1247915595551477850&permissions=2048&integration_type=0&scope=bot"
                reloadDocument
              >
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
            label="Start a draft via /startdraft"
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
                      setSelectedMapType(type as ChoosableDraftType)
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
              <Paper shadow="md" withBorder px="md" py="sm">
                <Text size="md">{MAPS[mapType].description}</Text>
              </Paper>
              <Box
                flex={1}
                pos="relative"
                mah="1000px"
                mt="lg"
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
                  decrease={() => setNumFactions((v) => v - 1)}
                  increase={() => setNumFactions((v) => v + 1)}
                  decreaseDisabled={
                    !!numPreassignedFactions || numFactions <= playerCount
                  }
                  increaseDisabled={
                    !!numPreassignedFactions || numFactions >= maxFactionCount
                  }
                />
              </Box>
            </Input.Wrapper>

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

            <Switch
              label="Randomize slices"
              description="Prepopulate the slices with random systems. Setting can be changed during draft building. All slices are manually editable."
              checked={randomizeSlices}
              onChange={() => setRandomizeSlices((v) => !v)}
            />

            <Switch
              label="Randomize Map Tiles"
              description="Prepopulate the map with random systems. All map systems are manually editable."
              checked={randomizeMap}
              onChange={() => setRandomizeMap((v) => !v)}
              disabled={!showRandomizeMapTiles}
            />

            <Stack>
              <Checkbox
                label="Discordant Stars"
                checked={withDiscordant}
                onChange={() => {
                  // if switching from OFF to ON, we also switch the others on by default
                  if (!withDiscordant) {
                    setWithDiscordantExp(true);
                    setWithUnchartedStars(true);
                  }
                  setWithDiscordant((v) => !v);
                }}
              />
              {withDiscordant && (
                <Group mx="lg">
                  <Checkbox
                    label="(+10 factions)"
                    checked={withDiscordantExp}
                    onChange={() => setWithDiscordantExp((v) => !v)}
                  />

                  <Checkbox
                    label="Uncharted Stars"
                    checked={withUnchartedStars}
                    onChange={() => setWithUnchartedStars((v) => !v)}
                  />
                </Group>
              )}
            </Stack>
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

              <Group>
                <Switch
                  label="Faction Bags"
                  description="If turned on, will pre-assign a 'bag' of # factions to each player. A player then chooses a faction only from their assigned 'bag' during the draft."
                  checked={Number(numPreassignedFactions) > 0}
                  onChange={handleTogglePreassignedFactions}
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
                label="Allow search of home planets"
                description="Useful if running minor factions. Will allow you to put home planets on the board with no/minimal restrictions"
                checked={allowHomePlanetSearch}
                onChange={() => setAllowHomePlanetSearch((v) => !v)}
              />
              <Switch
                label="Allow empty map tiles"
                description="Will allow starting a draft even if not every tile is filled"
                checked={allowEmptyMapTiles}
                onChange={() => setAllowEmptyMapTiles((v) => !v)}
              />
            </Stack>
          </Collapse>

          <Button size="lg" w="100%" onMouseDown={handleContinue}>
            Continue
          </Button>
          {!discordData && (
            <Button
              size="md"
              variant="filled"
              color="discordBlue.5"
              leftSection={<IconBrandDiscordFilled />}
              onMouseDown={openDiscord}
            >
              Integrate with Discord (BETA)
            </Button>
          )}
        </Stack>
      </Grid.Col>
    </Grid>
  );
}

function parseDemoMapString(config: DraftConfig, mapString: SystemId[]) {
  const tiles: DemoTile[] = mapString.map((entry, idx) => {
    const [player, rotation] = entry.split(":");
    const position = mapStringOrder[idx];
    const isHomeSystem = config.homeIdxInMapString.includes(idx);

    if (player.startsWith("S")) {
      return {
        idx,
        position,
        systemId: player.slice(1),
        type: "SYSTEM",
        rotation: rotation ? Number(rotation) : undefined,
      } as SystemTile;
    }

    if (player === "18") {
      return {
        idx,
        position,
        systemId: systemData[18].id,
        type: "SYSTEM",
      } as SystemTile;
    }

    if (player === "-1") {
      return {
        idx,
        position,
        type: "OPEN",
      } as OpenTile;
    }

    if (player === "x") {
      return {
        idx,
        position,
        type: "CLOSED",
      } as ClosedTile;
    }

    return {
      idx,
      position,
      isHomeSystem,
      playerNumber: Number(player) - 1,
      type: "PLAYER_DEMO",
      system: undefined,
    } as PlayerDemoTile;
  });
  return tiles;
}

export const loader = async (args: LoaderFunctionArgs) => {
  let discordData: DiscordData | undefined;
  const discordString = new URL(args.request.url).searchParams.get("discord");

  if (discordString) {
    discordData = JSON.parse(atob(discordString)) as DiscordData;
  }

  return { discordData };
};
