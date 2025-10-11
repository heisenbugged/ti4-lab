import { Fragment, useEffect, useState, useMemo } from "react";
import {
  Text,
  Container,
  Button,
  Table,
  Group,
  Slider,
  Stack,
  TextInput,
  Image,
  Box,
  Paper,
  Select,
  Modal,
  List,
  Alert,
  Badge,
  Popover,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Anchor,
} from "@mantine/core";
import { FactionId } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { factionAudios, LineType } from "~/data/factionAudios";
import { VoiceLineButton } from "./components/VoiceLineButton";
import { ActionFunctionArgs, json, redirect } from "@remix-run/server-runtime";
import { Form, useLoaderData, useSearchParams } from "@remix-run/react";
import { useAudioPlayer } from "./useAudioPlayer";
import { SpotifyLoginButton } from "./components/SpotifyLoginButton";
import { useSpotifyLogin } from "./useSpotifyLogin";
import {
  SpotifyDeviceSelector,
  SpotifyDeviceType,
} from "./components/SpotifyDeviceSelector";
import { SpotifyPlaylistUI } from "./components/SpotifyPlaylistUI";
import { createSession } from "~/drizzle/soundboardSession.server";
import { useSocketConnection } from "~/useSocketConnection";
import QRCode from "react-qr-code";
import { SpotifyPlaybackState } from "~/vendors/spotifyApi";
import {
  IconMusic,
  IconRefresh,
  IconPlayerPlay,
  IconSquare,
  IconVolume,
  IconVolumeOff,
  IconDeviceDesktop,
  IconDeviceMobile,
  IconDeviceSpeaker,
  IconDeviceUnknown,
  IconPlayerSkipForward,
  IconTrash,
  IconX,
  IconList,
  IconInfoCircle,
} from "@tabler/icons-react";
import styles from "./styles.module.css";

// Line type display names dictionary
const LINE_TYPE_DISPLAY_NAMES: Record<LineType, string> = {
  battleLines: "Battle Line",
  homeDefense: "Home Defense",
  homeInvasion: "Home Invasion",
  defenseOutnumbered: "Outnumbered",
  offenseSuperior: "Superiority",
  jokes: "Joke",
  special: "Special",
  special2: "Special 2",
  roleplayYes: "Yes",
  roleplayNo: "No",
  roleplayIRefuse: "I Refuse",
  roleplayDealWithIt: "Deal With It",
  roleplayNotEnough: "Not Enough",
  roleplayTooMuch: "Too Much",
  roleplaySabotage: "Sabotage",
  roleplayFire: "Fire!",
  announcerWarsundown: "War Sun Down",
  announcerBreak: "Break Time",
  announcerInvasionstopped: "Invasion Stopped",
  announcerAnnihilation: "Annihilation",
  announcerDreaddown: "Dreadnought Down",
  announcerCriticalhit: "Critical Hit",
  announcerAgenda: "Agenda Phase",
};

const factionData = Object.entries(factions)
  .filter((f) => f[1].set === "base" || f[1].set === "pok")
  .sort((a, b) => a[1].name.localeCompare(b[1].name))
  .map(([id, data]) => ({
    value: id,
    label: data.name,
  }));

// Voice Line Queue Display
interface VoiceLineQueueProps {
  queue: Array<{
    factionId: FactionId | "announcer";
    type: LineType;
    id: string;
  }>;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const VoiceLineQueue = ({ queue, onRemove, onClear }: VoiceLineQueueProps) => {
  const [opened, setOpened] = useState(false);

  if (queue.length === 0) {
    return null;
  }

  return (
    <Popover
      opened={opened}
      onChange={setOpened}
      position="top"
      width={300}
      shadow="md"
    >
      <Popover.Target>
        <Button
          variant="subtle"
          size="sm"
          leftSection={<IconList size={16} />}
          rightSection={
            <Badge size="sm" circle variant="filled" color="blue">
              {queue.length}
            </Badge>
          }
          onClick={() => setOpened((o) => !o)}
        >
          Queue
        </Button>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack>
          <Group justify="space-between">
            <Text fw={500}>Queued Voice Lines</Text>
            <ActionIcon
              variant="subtle"
              color="red"
              onClick={onClear}
              title="Clear queue"
            >
              <IconTrash size={16} />
            </ActionIcon>
          </Group>
          <ScrollArea h={Math.min(200, queue.length * 60)} offsetScrollbars>
            <Stack gap="xs">
              {queue.map((item, index) => (
                <Paper key={item.id} withBorder p="xs">
                  <Group justify="space-between" wrap="nowrap">
                    <Group gap="xs" style={{ flex: 1 }}>
                      <Text size="sm" fw={700} c="dimmed">
                        {index + 1}.
                      </Text>
                      {item.factionId === "announcer" ? (
                        <Box
                          style={{
                            width: 20,
                            height: 20,
                            borderRadius: "50%",
                            backgroundColor: "orange",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "10px",
                            fontWeight: "bold",
                            color: "white",
                          }}
                        >
                          A
                        </Box>
                      ) : (
                        <FactionIcon
                          faction={item.factionId as FactionId}
                          style={{ width: 20, height: 20 }}
                        />
                      )}
                      <Text size="sm" truncate style={{ flex: 1 }}>
                        {item.factionId === "announcer"
                          ? LINE_TYPE_DISPLAY_NAMES[item.type]
                          : item.type === "special"
                            ? factionAudios[item.factionId as FactionId]
                                ?.special?.title
                            : item.type === "special2"
                              ? factionAudios[item.factionId as FactionId]
                                  ?.special2?.title
                              : LINE_TYPE_DISPLAY_NAMES[item.type]}
                      </Text>
                    </Group>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="red"
                      onClick={() => onRemove(item.id)}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </ScrollArea>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
};

interface SpotifyPlaybackUIProps {
  currentPlayback: SpotifyPlaybackState | null;
}

const SpotifyPlaybackUI = ({ currentPlayback }: SpotifyPlaybackUIProps) => {
  if (!currentPlayback) return <></>;

  return (
    <>
      <Group justify="space-between" align="center">
        <Image
          src="/spotifylogo.svg"
          alt="Spotify Logo"
          style={{ width: 90, height: 24 }}
        />
        <Button
          variant="outline"
          color="red"
          size="xs"
          component="a"
          href="/voices/logout"
        >
          Logout
        </Button>
      </Group>
      <Paper radius="md" p="xs" withBorder>
        <Group gap="md" wrap="nowrap">
          <Image
            src={currentPlayback.albumImage.url}
            alt="Album Art"
            width={currentPlayback.albumImage.width}
            height={currentPlayback.albumImage.height}
            radius="sm"
          />
          <Stack gap={2} style={{ overflow: "hidden" }}>
            <Tooltip label={currentPlayback.track.name} openDelay={500}>
              <Text
                fw={500}
                size="sm"
                component="a"
                href={currentPlayback.track.external_urls.spotify}
                target="_blank"
                className={styles.hoverableTextLink}
                truncate
                style={{ maxWidth: "100%" }}
              >
                {currentPlayback.track.name}
              </Text>
            </Tooltip>
            <Group gap={0}>
              {currentPlayback.artists.map(
                (
                  artist: { id: string; name: string; uri: string },
                  index: number,
                ) => (
                  <Fragment key={artist.id}>
                    {index > 0 && (
                      <Text c="dimmed" size="sm">
                        {" "}
                        ,{" "}
                      </Text>
                    )}
                    <Tooltip label={artist.name} openDelay={500}>
                      <Text
                        className={styles.hoverableTextLink}
                        component="a"
                        href={artist.uri}
                        target="_blank"
                        c="dimmed"
                        size="sm"
                        truncate
                      >
                        {artist.name}
                      </Text>
                    </Tooltip>
                  </Fragment>
                ),
              )}
            </Group>
          </Stack>
        </Group>
      </Paper>
    </>
  );
};

const DEFAULT_FACTION_SLOTS: FactionId[] = [
  "arborec",
  "argent",
  "mentak",
  "naalu",
  "naazrokha",
  "nekro",
  "titans",
  "vulraith",
  "yin",
  "yssaril",
  "mahact",
  "barony",
  "saar",
  "jolnar",
  "l1z1x",
  "sol",
  "hacan",
  "nomad",
  "xxcha",
  "empyrean",
  "muaat",
];

export default function SoundboardMaster() {
  const { spotifyClientId, spotifyCallbackUrl } =
    useLoaderData<typeof loader>();
  const [playlistId, setPlaylistId] = useState<string | undefined>(undefined);
  const [searchParams] = useSearchParams();
  const factionsParam = searchParams.get("factions");
  const sessionId = searchParams.get("session");
  const [factionSlots, setFactionSlots] = useState<FactionId[]>(() => {
    if (factionsParam) {
      return factionsParam.split(",") as FactionId[];
    }
    return DEFAULT_FACTION_SLOTS;
  });
  const [isVoiceLinePlaying, setIsVoiceLinePlaying] = useState(false);

  useEffect(() => {
    if (!playlistId) {
      const stored = localStorage.getItem("spotifyPlaylistId");
      setPlaylistId(stored || "6O6izIEToh3JI4sAtHQn6J");
    }
    if (playlistId) localStorage.setItem("spotifyPlaylistId", playlistId);
  }, [playlistId]);

  const [volume, setVolume] = useState(1);
  const { accessToken } = useSpotifyLogin();

  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: () => socket?.emit("joinSoundboardSession", sessionId),
    });

  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit("joinSoundboardSession", sessionId);
    socket.on("requestSessionData", () =>
      socket.emit("sendSessionData", sessionId, factionSlots),
    );
    socket.on("playLine", (factionId, lineType) =>
      playAudio(factionId, lineType),
    );
    socket.on("stopLine", () => stopAudio());
  }, [sessionId, socket]);

  const {
    playAudio,
    stopAudio,
    endWar,
    loadingAudio,
    isWarMode,
    voiceLineRef,
    currentPlayback,
    startBattle,
    audioProgress,
    getDevices,
    availableDevices,
    isLoadingDevices,
    noActiveDeviceError,
    setNoActiveDeviceError,
    transferToDevice,
    voiceLineQueue,
    playbackRestrictions,
    removeFromQueue,
    clearQueue,
  } = useAudioPlayer({
    accessToken,
    playlistId: playlistId || "6O6izIEToh3JI4sAtHQn6J",
    lineFinished: () => {
      if (!socket) return;
      socket.emit("lineFinished", sessionId);
      setIsVoiceLinePlaying(false);
    },
  });

  // Create lookup maps for queued voice lines for quick checking if a voice line is queued
  const queuedLinesMap = useMemo(() => {
    const map = new Map<string, boolean>();

    voiceLineQueue.forEach((item) => {
      const key = `${item.factionId}-${item.type}`;
      map.set(key, true);
    });

    return map;
  }, [voiceLineQueue]);

  const isVoiceLineQueued = (factionId: FactionId, type: LineType) => {
    return queuedLinesMap.has(`${factionId}-${type}`);
  };

  useEffect(() => {
    if (accessToken) getDevices();
  }, [accessToken]);

  const handlePlayAudio = async (factionId: FactionId, type: LineType) => {
    if (!socket) return;

    // For battle-related lines, check if there's an active Spotify device first
    const shouldStartBattle = [
      "battleLines",
      "homeInvasion",
      "homeDefense",
      "defenseOutnumbered",
      "offenseSuperior",
    ].includes(type);

    // If this line will trigger battle music and we have Spotify access,
    // check for active devices first
    if (shouldStartBattle && accessToken) {
      // Refresh device list to make sure we have current information
      const devices = await getDevices();
      const hasActiveDevice = devices?.some(
        (d: SpotifyDeviceType) => d.is_active,
      );

      // If no active device is found but devices exist, show device selector
      if (!hasActiveDevice) {
        setNoActiveDeviceError(true);
        return; // Don't play audio until device is selected
      }
    }

    // If we have an active device or don't need one, proceed with playing audio
    playAudio(factionId, type);
    setIsVoiceLinePlaying(true);
  };

  const handleStopAudio = () => {
    stopAudio();
    setIsVoiceLinePlaying(false);
  };

  const handleSelectDevice = async (deviceId: string) => {
    if (deviceId === "refresh") {
      // Just refresh the device list
      getDevices();
      return;
    }

    const success = await transferToDevice(deviceId);
    if (success) {
      setNoActiveDeviceError(false);
    }
  };

  // New helper method to format the loading audio text
  const getAudioDisplayText = (loadingAudio: string) => {
    if (!loadingAudio) return [null, null];

    const [factionId, lineType] = loadingAudio.split("-") as [
      FactionId,
      LineType,
    ];
    let lineTypeDisplay = LINE_TYPE_DISPLAY_NAMES[lineType];
    if (lineType === "special") {
      lineTypeDisplay =
        factionAudios[factionId]?.special?.title || lineTypeDisplay;
    } else if (lineType === "special2") {
      lineTypeDisplay =
        factionAudios[factionId]?.special2?.title || lineTypeDisplay;
    }

    return [factionId, lineTypeDisplay];
  };

  const [playingFaction, playingLineType] = loadingAudio
    ? getAudioDisplayText(loadingAudio)
    : [null, null];

  return (
    <Container py="xl" maw={1400} pos="relative" mt="sm">
      {socket && isDisconnected && (
        <Button
          variant="filled"
          size="md"
          radius="xl"
          leftSection={<IconRefresh size={20} />}
          style={{
            position: "fixed",
            top: "100px",
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

      <Stack mb="xl" gap="md" mt="lg">
        {sessionId && (
          <Group gap="lg">
            <Stack>
              <Text fw={500}>Session Code: {sessionId}</Text>
              <Text>https://tidraft.com/voices/{sessionId}</Text>
            </Stack>
            <Stack align="center" gap={4}>
              <QRCode
                value={`https://tidraft.com/voices/${sessionId}`}
                size={200}
              />

              <Text size="sm" c="dimmed">
                Scan to join session
              </Text>
            </Stack>
          </Group>
        )}

        {!accessToken && (
          <Paper
            radius="md"
            p="md"
            withBorder
            maw={400}
            pos="absolute"
            right={0}
            top={0}
          >
            <Stack>
              <Group align="center" gap="md" justify="space-between">
                <div style={{ flex: 0.5, height: 38 }}>
                  <img src="/spotifylogo.svg" alt="Spotify Logo" />
                </div>
                <SpotifyLoginButton
                  accessToken={accessToken}
                  spotifyCallbackUrl={spotifyCallbackUrl}
                  spotifyClientId={spotifyClientId}
                />
              </Group>
              <Text size="sm" c="dimmed">
                Log in with Spotify to control background music during peace and
                war times. When war breaks out, the music will automatically
                switch to more intense tracks, and return to the peaceful
                playlist when war ends.
              </Text>
            </Stack>
          </Paper>
        )}

        {/* Spotify Controls */}
        <Group grow align="end" justify="flex-end">
          {accessToken && playbackRestrictions === false ? (
            <SpotifyPlaylistUI
              playlistId={playlistId}
              setPlaylistId={setPlaylistId}
              isWarMode={isWarMode}
              endWar={endWar}
            />
          ) : null}

          {!sessionId ? (
            <Form method="post">
              <Button type="submit" size="xl">
                Create Session
              </Button>
            </Form>
          ) : (
            <Button
              size="xl"
              color="blue"
              variant="outline"
              onClick={() => (window.location.href = window.location.pathname)}
            >
              End Session
            </Button>
          )}

          {accessToken && (
            <Stack mt={12} w={300} style={{ overflow: "hidden" }}>
              {playbackRestrictions === null ? null : playbackRestrictions ? (
                <Alert color="blue" title="Spotify Premium Required">
                  Spotify Premium lets you play any track, podcast episode or
                  audiobook, ad-free and with better audio quality. Go to{" "}
                  <Anchor
                    href="https://spotify.com/premium"
                    target="_blank"
                    c="blue"
                  >
                    spotify.com/premium
                  </Anchor>{" "}
                  to try it for free.
                </Alert>
              ) : (
                <SpotifyPlaybackUI currentPlayback={currentPlayback} />
              )}
            </Stack>
          )}
        </Group>
      </Stack>

      <Table verticalSpacing="lg" horizontalSpacing="lg">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Faction</Table.Th>
            <Table.Th>Lines</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {factionSlots.map((faction, index) => (
            <Table.Tr key={`${faction}-${index}`}>
              <Table.Td>
                <Group gap="xs">
                  <FactionIcon
                    faction={faction}
                    style={{ width: 32, height: 32 }}
                  />
                  <Select
                    value={faction}
                    onChange={(newFaction) => {
                      if (newFaction) {
                        const newSlots = [...factionSlots];
                        newSlots[index] = newFaction as FactionId;
                        setFactionSlots(newSlots);
                      }
                    }}
                    data={factionData}
                    w={200}
                  />
                </Group>
              </Table.Td>

              <Table.Td>
                <Group gap="md">
                  {accessToken && (
                    <Button
                      size="sm"
                      variant="outline"
                      color="green"
                      p={6}
                      onClick={() => startBattle(faction)}
                    >
                      <IconMusic size={16} />
                    </Button>
                  )}
                  <VoiceLineButton
                    faction={faction}
                    label="Battle Line"
                    type="battleLines"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "battleLines")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "battleLines")}
                  />
                  <Stack gap="xs">
                    <VoiceLineButton
                      faction={faction}
                      label="Outnumbered"
                      type="defenseOutnumbered"
                      loadingAudio={loadingAudio}
                      onPlay={() =>
                        handlePlayAudio(faction, "defenseOutnumbered")
                      }
                      onStop={handleStopAudio}
                      isQueued={isVoiceLineQueued(
                        faction,
                        "defenseOutnumbered",
                      )}
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Superiority"
                      type="offenseSuperior"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "offenseSuperior")}
                      onStop={handleStopAudio}
                      isQueued={isVoiceLineQueued(faction, "offenseSuperior")}
                    />
                  </Stack>

                  <VoiceLineButton
                    faction={faction}
                    label="Home Defense"
                    type="homeDefense"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeDefense")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "homeDefense")}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Planet Invasion"
                    type="homeInvasion"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeInvasion")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "homeInvasion")}
                  />

                  <VoiceLineButton
                    faction={faction}
                    label={factionAudios[faction]?.special?.title ?? ""}
                    type="special"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "special")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "special")}
                  />
                  {factionAudios[faction]?.special2 && (
                    <VoiceLineButton
                      faction={faction}
                      label={factionAudios[faction]?.special2?.title ?? ""}
                      type="special2"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "special2")}
                      onStop={handleStopAudio}
                      isQueued={isVoiceLineQueued(faction, "special2")}
                    />
                  )}

                  <VoiceLineButton
                    faction={faction}
                    label="Joke"
                    type="jokes"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "jokes")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "jokes")}
                  />
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      {/* Credits section - now a regular footer at bottom of content */}
      <Box
        style={(theme) => ({
          borderTop: `1px solid ${theme.colors.dark[6]}`,
          marginTop: theme.spacing.xl,
          marginBottom: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          paddingBottom: theme.spacing.md,
          textAlign: "center",
        })}
      >
        <Text size="xs" c="dimmed" fs="italic">
          Many thanks to Cacotopos for writing, direction, and general
          feedback/support. Absol for lore accuracy. Xane225 for a ridiculous
          amount of editing.
        </Text>
      </Box>

      {/* Spacing div to prevent content from being hidden behind fixed player */}
      <div style={{ height: 100 }} />

      {/* Footer */}
      <Box
        component="footer"
        style={(theme) => ({
          borderTop: `1px solid ${theme.colors.dark[6]}`,
          padding: theme.spacing.md,
          backgroundColor: theme.colors.dark[8],
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1,
        })}
      >
        <Container size="xl" px={0}>
          <Group gap="md" align="center">
            <Group gap="xs">
              <Button
                variant="filled"
                size="sm"
                onClick={() => {
                  if (playingFaction && playingLineType) {
                    // Toggle pause/play on the voice line
                    if (voiceLineRef.current?.playing()) {
                      voiceLineRef.current.pause();
                      setIsVoiceLinePlaying(false);
                    } else {
                      voiceLineRef.current?.play();
                      setIsVoiceLinePlaying(true);
                    }
                  }
                }}
                disabled={!(playingFaction && playingLineType)}
              >
                {isVoiceLinePlaying ? (
                  <IconSquare size={16} />
                ) : (
                  <IconPlayerPlay size={16} />
                )}
              </Button>

              {/* Skip to next in queue button */}
              {voiceLineQueue.length > 0 && (
                <Tooltip label="Skip to next in queue">
                  <ActionIcon
                    variant="filled"
                    color="blue"
                    size="md"
                    onClick={() => {
                      stopAudio();
                      if (voiceLineQueue.length > 0) {
                        const nextItem = voiceLineQueue[0];
                        playAudio(nextItem.factionId, nextItem.type, true);
                      }
                    }}
                  >
                    <IconPlayerSkipForward size={16} />
                  </ActionIcon>
                </Tooltip>
              )}

              {playingFaction && playingLineType && (
                <Group gap="xs">
                  <FactionIcon
                    faction={playingFaction as FactionId}
                    style={{ width: 16, height: 16 }}
                  />
                  <Text size="sm" fw={500} truncate>
                    {playingLineType}
                  </Text>
                </Group>
              )}
            </Group>

            <Group gap="xs" style={{ flex: 1 }}>
              <Slider
                w="100%"
                min={0}
                max={1}
                step={0.1}
                showLabelOnHover={false}
                label={null}
                labelAlwaysOn={false}
                value={audioProgress || 0}
                onChange={(newPosition) => {
                  if (voiceLineRef.current && loadingAudio) {
                    // Get the total duration of the audio and calculate the seek position
                    const duration = voiceLineRef.current.duration();
                    const seekPosition = duration * newPosition;
                    voiceLineRef.current.seek(seekPosition);
                  }
                }}
                disabled={!loadingAudio}
                styles={(theme) => ({
                  track: {
                    backgroundColor: theme.colors.dark[4],
                    height: 6,
                  },
                  bar: {
                    backgroundColor: theme.colors.blue[6],
                    height: 6,
                  },
                  thumb: {
                    display: loadingAudio ? undefined : "none",
                    height: 16,
                    width: 16,
                    backgroundColor: theme.white,
                    borderWidth: 1,
                  },
                })}
              />
            </Group>

            {/* Queue Display */}
            <VoiceLineQueue
              queue={voiceLineQueue}
              onRemove={removeFromQueue}
              onClear={clearQueue}
            />

            <Group gap="xs">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => {
                  if (volume > 0) {
                    setVolume(0);
                    voiceLineRef.current?.volume(0);
                  } else {
                    setVolume(0.5);
                    voiceLineRef.current?.volume(0.5);
                  }
                }}
              >
                {volume === 0 ? (
                  <IconVolumeOff size={16} />
                ) : (
                  <IconVolume size={16} />
                )}
              </Button>
              <Slider
                w={100}
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(newVolume) => {
                  setVolume(newVolume);
                  voiceLineRef.current?.volume(newVolume);
                }}
              />
            </Group>
          </Group>
        </Container>
      </Box>

      {/* Add the device selector modal */}
      <SpotifyDeviceSelector
        isOpen={noActiveDeviceError}
        onClose={() => setNoActiveDeviceError(false)}
        devices={availableDevices}
        isLoading={isLoadingDevices}
        onSelectDevice={handleSelectDevice}
      />
    </Container>
  );
}

export const loader = async () => {
  const clientId = process.env.SPOTIFY_OAUTH_CLIENT_ID;
  const envRedirect = process.env.SPOTIFY_OAUTH_REDIRECT_URI;

  if (!clientId || !envRedirect) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  const u = new URL(envRedirect);
  u.pathname = "/voices/callback";

  return json({
    spotifyClientId: clientId,
    spotifyCallbackUrl: u.toString(),
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await createSession();
  return redirect(`/voices?session=${session.id}`);
}
