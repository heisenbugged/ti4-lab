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
import { ActionFunctionArgs, data, redirect } from "react-router";
import { Form, useLoaderData, useSearchParams } from "react-router";
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
  IconMicrophone2,
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
    <Container py="lg" maw={1400}>
      {/* Reconnect button */}
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

      {/* Page Header */}
      <div className={styles.pageHeader}>
        <Stack gap="xs">
          <h1 className={styles.pageTitle}>Soundboard</h1>
          {!sessionId ? (
            <Form method="post">
              <Button
                type="submit"
                size="md"
                color="blue"
                leftSection={<IconMusic size={18} />}
              >
                Create Session
              </Button>
            </Form>
          ) : (
            <Group gap="sm">
              <Button
                size="sm"
                color="red"
                variant="light"
                onClick={() => (window.location.href = window.location.pathname)}
              >
                End Session
              </Button>
            </Group>
          )}
        </Stack>

        {/* Session Info */}
        {sessionId && (
          <div className={styles.sessionPanel}>
            <Group gap="lg" align="flex-start">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Session Code
                </Text>
                <Text className={styles.sessionCode}>{sessionId}</Text>
                <Text size="sm" c="dimmed">
                  tidraft.com/voices/{sessionId}
                </Text>
              </Stack>
              <Stack align="center" gap={4}>
                <div className={styles.qrContainer}>
                  <QRCode
                    value={`https://tidraft.com/voices/${sessionId}`}
                    size={100}
                  />
                </div>
                <Text size="xs" c="dimmed">
                  Scan to join
                </Text>
              </Stack>
            </Group>
          </div>
        )}

        {/* Spotify Panel */}
        <div className={styles.spotifyPanel}>
          <Stack gap="sm">
            <Group justify="space-between" align="center">
              <Image
                src="/spotifylogo.svg"
                alt="Spotify"
                style={{ width: 80, height: 24 }}
              />
              {accessToken ? (
                <Button
                  variant="subtle"
                  color="red"
                  size="compact-xs"
                  component="a"
                  href="/voices/logout"
                >
                  Logout
                </Button>
              ) : (
                <SpotifyLoginButton
                  accessToken={accessToken}
                  spotifyCallbackUrl={spotifyCallbackUrl}
                  spotifyClientId={spotifyClientId}
                />
              )}
            </Group>

            {!accessToken ? (
              <Text size="xs" c="dimmed">
                Connect Spotify to control background music. Battle music plays
                automatically during combat.
              </Text>
            ) : playbackRestrictions ? (
              <Alert color="yellow" variant="light" p="xs">
                <Text size="xs">
                  Spotify Premium required for playback control.
                </Text>
              </Alert>
            ) : (
              <>
                {currentPlayback && (
                  <div className={styles.playbackCard}>
                    <Image
                      src={currentPlayback.albumImage.url}
                      alt="Album"
                      w={40}
                      h={40}
                      radius="sm"
                    />
                    <div className={styles.playbackInfo}>
                      <a
                        href={currentPlayback.track.external_urls.spotify}
                        target="_blank"
                        rel="noreferrer"
                        className={styles.trackName}
                      >
                        {currentPlayback.track.name}
                      </a>
                      <div className={styles.artistName}>
                        {currentPlayback.artists
                          .map((a: { name: string }) => a.name)
                          .join(", ")}
                      </div>
                    </div>
                  </div>
                )}
                <SpotifyPlaylistUI
                  playlistId={playlistId}
                  setPlaylistId={setPlaylistId}
                  isWarMode={isWarMode}
                  endWar={endWar}
                />
              </>
            )}
          </Stack>
        </div>
      </div>

      {/* Factions Section */}
      <section>
        <div className={styles.sectionHeader}>
          <IconMicrophone2 size={16} color="var(--mantine-color-dimmed)" />
          <h2 className={styles.sectionTitle}>Voice Lines</h2>
          <Text size="xs" c="dimmed" ml="auto">
            {factionSlots.length} factions
          </Text>
        </div>

        <div className={styles.factionGrid}>
          {factionSlots.map((faction, index) => (
            <div key={`${faction}-${index}`} className={styles.factionCard}>
              <div className={styles.factionCardHeader}>
                <FactionIcon
                  faction={faction}
                  style={{ width: 24, height: 24 }}
                />
                <span className={styles.factionName}>
                  {factions[faction]?.name}
                </span>
                <Select
                  size="xs"
                  variant="unstyled"
                  value={faction}
                  onChange={(newFaction) => {
                    if (newFaction) {
                      const newSlots = [...factionSlots];
                      newSlots[index] = newFaction as FactionId;
                      setFactionSlots(newSlots);
                    }
                  }}
                  data={factionData}
                  w={32}
                  styles={{
                    input: { padding: 0, minHeight: 0, height: "auto" },
                  }}
                  rightSection={null}
                  comboboxProps={{ width: 200, position: "bottom-end" }}
                />
              </div>
              <div className={styles.factionCardBody}>
                <div className={styles.voiceLineGroup}>
                  {accessToken && (
                    <Tooltip label="Start battle music">
                      <Button
                        size="compact-xs"
                        variant="light"
                        color="green"
                        onClick={() => startBattle(faction)}
                      >
                        <IconMusic size={14} />
                      </Button>
                    </Tooltip>
                  )}
                  <VoiceLineButton
                    faction={faction}
                    label="Battle"
                    type="battleLines"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "battleLines")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "battleLines")}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Outnumbered"
                    type="defenseOutnumbered"
                    loadingAudio={loadingAudio}
                    onPlay={() =>
                      handlePlayAudio(faction, "defenseOutnumbered")
                    }
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "defenseOutnumbered")}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Superior"
                    type="offenseSuperior"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "offenseSuperior")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "offenseSuperior")}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Defend"
                    type="homeDefense"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeDefense")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "homeDefense")}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Invade"
                    type="homeInvasion"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeInvasion")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "homeInvasion")}
                  />
                  {factionAudios[faction]?.special && (
                    <VoiceLineButton
                      faction={faction}
                      label={factionAudios[faction]?.special?.title ?? "Special"}
                      type="special"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "special")}
                      onStop={handleStopAudio}
                      isQueued={isVoiceLineQueued(faction, "special")}
                    />
                  )}
                  {factionAudios[faction]?.special2 && (
                    <VoiceLineButton
                      faction={faction}
                      label={factionAudios[faction]?.special2?.title ?? "Special 2"}
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Credits */}
      <div className={styles.credits}>
        Many thanks to Cacotopos for writing, direction, and general
        feedback/support. Absol for lore accuracy. Xane225 for a ridiculous
        amount of editing.
      </div>

      {/* Footer spacer */}
      <div className={styles.footerSpacer} />

      {/* Audio Player Footer */}
      <footer className={styles.playerFooter}>
        <div className={styles.playerContent}>
          <div className={styles.playerControls}>
            <Button
              variant="filled"
              size="compact-sm"
              onClick={() => {
                if (playingFaction && playingLineType) {
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
                <IconSquare size={14} />
              ) : (
                <IconPlayerPlay size={14} />
              )}
            </Button>

            {voiceLineQueue.length > 0 && (
              <Tooltip label="Skip to next">
                <ActionIcon
                  variant="light"
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
                  <IconPlayerSkipForward size={14} />
                </ActionIcon>
              </Tooltip>
            )}
          </div>

          {playingFaction && playingLineType && (
            <div className={styles.nowPlaying}>
              <FactionIcon
                faction={playingFaction as FactionId}
                style={{ width: 18, height: 18 }}
              />
              <span className={styles.nowPlayingText}>{playingLineType}</span>
            </div>
          )}

          <div className={styles.progressContainer}>
            <Slider
              size="xs"
              min={0}
              max={1}
              step={0.01}
              label={null}
              value={audioProgress || 0}
              onChange={(newPosition) => {
                if (voiceLineRef.current && loadingAudio) {
                  const duration = voiceLineRef.current.duration();
                  const seekPosition = duration * newPosition;
                  voiceLineRef.current.seek(seekPosition);
                }
              }}
              disabled={!loadingAudio}
            />
          </div>

          <VoiceLineQueue
            queue={voiceLineQueue}
            onRemove={removeFromQueue}
            onClear={clearQueue}
          />

          <div className={styles.volumeControls}>
            <ActionIcon
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
            </ActionIcon>
            <Slider
              size="xs"
              w={80}
              min={0}
              max={1}
              step={0.01}
              label={null}
              value={volume}
              onChange={(newVolume) => {
                setVolume(newVolume);
                voiceLineRef.current?.volume(newVolume);
              }}
            />
          </div>
        </div>
      </footer>

      {/* Device selector modal */}
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

  return data({
    spotifyClientId: clientId,
    spotifyCallbackUrl: u.toString(),
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await createSession();
  return redirect(`/voices?session=${session.id}`);
}
