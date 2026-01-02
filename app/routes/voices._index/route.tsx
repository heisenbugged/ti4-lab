import { Fragment, useEffect, useState, useMemo, useRef } from "react";
import {
  Text,
  Container,
  Button,
  Table,
  Group,
  Slider,
  Stack,
  Select,
  Paper,
  Badge,
  Popover,
  ScrollArea,
  ActionIcon,
  Tooltip,
  Box,
  Alert,
  Anchor,
  Modal,
  Switch,
  Image,
  Loader,
  Title,
} from "@mantine/core";
import { FactionId } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { factionAudios, LineType, announcerAudios } from "~/data/factionAudios";
import { VoiceLineButton } from "../soundboard._index/components/VoiceLineButton";
import { ActionFunctionArgs, json, redirect } from "@remix-run/server-runtime";
import { Form, useSearchParams, useLoaderData } from "@remix-run/react";
import { useAudioPlayer } from "../soundboard._index/useAudioPlayer";
import { useSocketConnection } from "~/useSocketConnection";
import QRCode from "react-qr-code";
import { createSession } from "~/drizzle/soundboardSession.server";
import {
  IconPlayerPlay,
  IconSquare,
  IconVolume,
  IconVolumeOff,
  IconPlayerSkipForward,
  IconTrash,
  IconX,
  IconList,
  IconRefresh,
  IconInfoCircle,
  IconQrcode,
  IconMicrophone2,
  IconMusic,
} from "@tabler/icons-react";
import { SectionTitle } from "~/components/Section";
import {
  trackPageView,
  trackVoiceLineClick,
  trackButtonClick,
  trackSessionEvent,
  trackTimeOnPage,
} from "~/lib/analytics.client";
import { ClientOnly } from "remix-utils/client-only";
import ccStyles from "./ClosedCaptions.module.css";
import styles from "./styles.module.css";
import { SpotifyLoginButton } from "../soundboard._index/components/SpotifyLoginButton";
import { useSpotifyLogin } from "../soundboard._index/useSpotifyLogin";
import { SpotifyPlaybackState } from "~/vendors/spotifyApi";
import {
  SpotifyDeviceSelector,
  type SpotifyDeviceType,
} from "../soundboard._index/components/SpotifyDeviceSelector";
import { SpotifyPlaylistUI } from "../soundboard._index/components/SpotifyPlaylistUI";

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

const DEFAULT_FACTION_SLOTS: FactionId[] = [
  "arborec",
  "argent",
  "barony",
  "creuss",
  "empyrean",
  "hacan",
  "jolnar",
  "l1z1x",
  "mahact",
  "mentak",
  "muaat",
  "naalu",
  "naazrokha",
  "nekro",
  "nomad",
  "saar",
  "sardakk",
  "sol",
  "titans",
  "vulraith",
  "winnu",
  "xxcha",
  "yin",
  "yssaril",
];

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
      width={280}
      shadow="none"
      styles={{ dropdown: { padding: 0, border: "none", background: "transparent" } }}
    >
      <Popover.Target>
        <button className={styles.queueButton} onClick={() => setOpened((o) => !o)}>
          <IconList size={14} />
          <span>Queue</span>
          <span className={styles.queueBadge}>{queue.length}</span>
        </button>
      </Popover.Target>
      <Popover.Dropdown>
        <div className={styles.queuePopover}>
          <div className={styles.queueHeader}>
            <span className={styles.queueTitle}>Queued Lines</span>
            <button className={styles.queueClearButton} onClick={onClear} title="Clear queue">
              <IconTrash size={14} />
            </button>
          </div>
          <div className={styles.queueList}>
            {queue.map((item, index) => (
              <div key={item.id} className={styles.queueItem}>
                <span className={styles.queueItemIndex}>{index + 1}</span>
                <div className={styles.queueItemIcon}>
                  {item.factionId === "announcer" ? (
                    <div className={styles.queueItemAnnouncerIcon}>A</div>
                  ) : (
                    <FactionIcon
                      faction={item.factionId as FactionId}
                      style={{ width: 20, height: 20 }}
                    />
                  )}
                </div>
                <span className={styles.queueItemName}>
                  {item.factionId === "announcer"
                    ? LINE_TYPE_DISPLAY_NAMES[item.type]
                    : item.type === "special"
                      ? factionAudios[item.factionId as FactionId]?.special?.title
                      : item.type === "special2"
                        ? factionAudios[item.factionId as FactionId]?.special2?.title
                        : LINE_TYPE_DISPLAY_NAMES[item.type]}
                </span>
                <button className={styles.queueItemRemove} onClick={() => onRemove(item.id)}>
                  <IconX size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
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

// Closed Captions Display Component
interface ClosedCaptionsProps {
  caption: string;
  visible: boolean;
  factionId: FactionId | "announcer";
}

const ClosedCaptions = ({
  caption,
  visible,
  factionId,
}: ClosedCaptionsProps) => {
  if (!visible || !caption) return null;

  return (
    <Box className={ccStyles.container}>
      <Paper withBorder className={ccStyles.paper}>
        <Group gap="xs" justify="center" align="center">
          {factionId === "announcer" ? (
            <Box
              style={{
                width: 24,
                height: 24,
                borderRadius: "50%",
                backgroundColor: "orange",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "12px",
                fontWeight: "bold",
                color: "white",
              }}
            >
              A
            </Box>
          ) : (
            <FactionIcon
              faction={factionId as FactionId}
              style={{ width: 24, height: 24 }}
            />
          )}
          <Text fw={600} c="white" ta="center" className={ccStyles.text}>
            {caption}
          </Text>
        </Group>
      </Paper>
    </Box>
  );
};

// Client-only component for closed captions toggle
const ClosedCaptionsToggle = ({
  sessionId,
  checked,
  onChange,
}: {
  sessionId: string | null;
  checked: boolean;
  onChange: (enabled: boolean) => void;
}) => {
  const handleToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.currentTarget.checked;

    // Notify parent component
    onChange(newValue);

    // Analytics: Track CC toggle
    trackButtonClick({
      buttonType: "closed_captions_toggle",
      context: newValue ? "cc_on" : "cc_off",
      sessionId: sessionId || undefined,
    });
  };

  return (
    <Switch
      label={
        <Box
          py={2}
          px="md"
          style={{ borderRadius: 4, border: "1px solid white" }}
        >
          <Text size="xs" fw={700} style={{ fontFamily: "monospace" }}>
            CC
          </Text>
        </Box>
      }
      size="md"
      checked={checked}
      onChange={handleToggle}
    />
  );
};

// Helper function to calculate the remaining line count for a specific faction and line type
const getRemainingLineCount = (
  factionId: FactionId,
  type: LineType,
  voiceLineMemory: {
    [K in FactionId]?: {
      [type: string]: string[];
    };
  },
): number => {
  // Handle announcer types differently since they're not tied to factions
  if (type.startsWith("announcer")) {
    const announcerData = announcerAudios[type as keyof typeof announcerAudios];
    const totalCount = Array.isArray(announcerData) ? announcerData.length : 0;

    // Use "announcer" as the key instead of factionId for announcer memory
    const playedCount =
      voiceLineMemory["announcer" as FactionId]?.[type]?.length || 0;

    return Math.max(0, totalCount - playedCount);
  }

  const factionData = factionAudios[factionId];
  if (!factionData) return 0;

  // Get total count for this line type
  let totalCount = 0;
  if (type === "special") {
    totalCount = factionData.special?.entries?.length || 0;
  } else if (type === "special2") {
    totalCount = factionData.special2?.entries?.length || 0;
  } else {
    const typeData = factionData[type as keyof typeof factionData];
    totalCount = Array.isArray(typeData) ? typeData.length : 0;
  }

  // Get played count from memory
  const playedCount = voiceLineMemory[factionId]?.[type]?.length || 0;

  // Return remaining count
  return Math.max(0, totalCount - playedCount);
};

// Announcer Voice Line Button Component
interface AnnouncerVoiceLineButtonProps {
  type: LineType;
  loadingAudio: string | null;
  onPlay: () => void;
  onStop: () => void;
  onRemoveFromQueue?: () => void;
  label: string;
  isQueued?: boolean;
  lineCount?: number;
}

const AnnouncerVoiceLineButton = ({
  type,
  loadingAudio,
  onPlay,
  onStop,
  onRemoveFromQueue,
  label,
  isQueued = false,
  lineCount,
}: AnnouncerVoiceLineButtonProps) => {
  const isLoading = loadingAudio === `announcer-${type}`;
  const isDisabled = !announcerAudios[type as keyof typeof announcerAudios];

  return (
    <button
      className={`${styles.announcerButton} ${isQueued ? styles.announcerButtonQueued : ""} ${isLoading ? styles.announcerButtonLoading : ""} ${isDisabled ? styles.announcerButtonDisabled : ""}`}
      disabled={isDisabled}
      onClick={() => {
        if (isLoading) {
          onStop();
          return;
        }
        if (isQueued && onRemoveFromQueue) {
          onRemoveFromQueue();
          return;
        }
        onPlay();
      }}
    >
      {/* Always render text to maintain button size, hide when loading */}
      <span className={`${styles.announcerButtonLabel} ${isLoading ? styles.announcerButtonLabelHidden : ""}`}>
        {isQueued ? "Queued" : label}
      </span>
      {/* Loader overlays the hidden text */}
      {isLoading && (
        <span className={styles.announcerButtonLoaderOverlay}>
          <Loader size={14} type="bars" color="currentColor" />
        </span>
      )}
      {!isLoading && !isQueued && lineCount !== undefined && lineCount > 1 && (
        <span className={styles.announcerButtonBadge}>{lineCount}</span>
      )}
    </button>
  );
};

export default function VoicesMaster() {
  const { spotifyClientId, spotifyCallbackUrl } =
    useLoaderData<typeof loader>();
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
  const [volume, setVolume] = useState(1);
  const { accessToken } = useSpotifyLogin();
  const [playlistId, setPlaylistId] = useState<string | undefined>(undefined);
  const timeOnPageTracker = useRef<(() => void) | null>(null);
  const [qrModalOpened, setQrModalOpened] = useState(false);
  useEffect(() => {
    if (!playlistId) {
      const stored = localStorage.getItem("spotifyPlaylistId");
      setPlaylistId(stored || "6O6izIEToh3JI4sAtHQn6J");
    }
    if (playlistId) localStorage.setItem("spotifyPlaylistId", playlistId);
  }, [playlistId]);

  const [closedCaptionsEnabled, setClosedCaptionsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("closedCaptionsEnabled");
      return saved === "true";
    }
    return false;
  });

  const changeClosedCaptionsEnabled = (enabled: boolean) => {
    localStorage.setItem("closedCaptionsEnabled", enabled.toString());
    setClosedCaptionsEnabled(enabled);
  };

  const {
    playAudio,
    stopAudio,
    endWar,
    loadingAudio,
    currentAudio,
    isWarMode,
    voiceLineRef,
    currentPlayback,
    audioProgress,
    getDevices,
    availableDevices,
    isLoadingDevices,
    noActiveDeviceError,
    setNoActiveDeviceError,
    transferToDevice,
    playbackRestrictions,
    voiceLineQueue,
    removeFromQueue,
    clearQueue,
    voiceLineMemory,
  } = useAudioPlayer({
    accessToken,
    playlistId: playlistId || "6O6izIEToh3JI4sAtHQn6J",
    lineFinished: () => {
      if (!socket) return;
      socket.emit("lineFinished", sessionId);
      setIsVoiceLinePlaying(false);
    },
  });

  // Derive current caption from playing audio state - much simpler now!
  const currentCaption =
    closedCaptionsEnabled && currentAudio?.caption
      ? currentAudio.caption
      : null;

  const currentCaptionFaction =
    currentCaption && loadingAudio
      ? (loadingAudio.split("-")[0] as FactionId | "announcer")
      : null;

  // Analytics: Track page view and time on page
  useEffect(() => {
    trackPageView({
      route: "/voices",
      sessionId: sessionId || undefined,
    });

    // Start tracking time on page
    const tracker = trackTimeOnPage("/voices", sessionId || undefined);
    timeOnPageTracker.current = tracker || null;

    // Track time on page when component unmounts
    return () => {
      if (timeOnPageTracker.current) {
        timeOnPageTracker.current();
      }
    };
  }, [sessionId]);

  // Show QR modal when session is first created
  useEffect(() => {
    if (sessionId) {
      setQrModalOpened(true);
    }
  }, [sessionId]);

  // Track session events
  useEffect(() => {
    if (sessionId) {
      trackSessionEvent({
        action: "session_joined",
        sessionId: sessionId,
      });
    }
  }, [sessionId]);

  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: () => socket?.emit("joinSoundboardSession", sessionId),
    });

  useEffect(() => {
    if (!socket || !sessionId) return;

    socket.emit("joinSoundboardSession", sessionId);

    const handleRequestSessionData = () =>
      socket.emit("sendSessionData", sessionId, factionSlots);

    const handlePlayLine = (factionId: FactionId, lineType: LineType) => {
      playAudio(factionId, lineType, true);
    };

    const handleStopLine = () => stopAudio();

    socket.on("requestSessionData", handleRequestSessionData);
    socket.on("playLine", handlePlayLine);
    socket.on("stopLine", handleStopLine);

    // CRITICAL: Clean up event listeners when effect re-runs or component unmounts
    return () => {
      socket.off("requestSessionData", handleRequestSessionData);
      socket.off("playLine", handlePlayLine);
      socket.off("stopLine", handleStopLine);
    };
  }, [sessionId, socket, factionSlots, playAudio, stopAudio]);

  // Create lookup maps for queued voice lines - stores item ID for removal
  const queuedLinesMap = useMemo(() => {
    const map = new Map<string, string>(); // key -> item.id

    voiceLineQueue.forEach((item) => {
      const key = `${item.factionId}-${item.type}`;
      map.set(key, item.id);
    });

    return map;
  }, [voiceLineQueue]);

  const isVoiceLineQueued = (factionId: FactionId, type: LineType) => {
    return queuedLinesMap.has(`${factionId}-${type}`);
  };

  const getQueuedItemId = (factionId: FactionId | "announcer", type: LineType) => {
    return queuedLinesMap.get(`${factionId}-${type}`);
  };

  const isAnnouncerLineQueued = (type: LineType) => {
    return queuedLinesMap.has(`announcer-${type}`);
  };

  const handleRemoveFromQueue = (factionId: FactionId | "announcer", type: LineType) => {
    const id = getQueuedItemId(factionId, type);
    if (id) {
      removeFromQueue(id);
      trackButtonClick({
        buttonType: "remove_from_queue",
        context: `${factionId}-${type}`,
        sessionId: sessionId || undefined,
      });
    }
  };

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

    if (shouldStartBattle && accessToken) {
      const devices = await getDevices();
      const hasActiveDevice = devices?.some(
        (d: SpotifyDeviceType) => d.is_active,
      );
      if (!hasActiveDevice) {
        setNoActiveDeviceError(true);
        return;
      }
    }

    // Analytics: Track voice line click
    trackVoiceLineClick({
      faction: factionId,
      lineType: type,
      sessionId: sessionId || undefined,
      isQueued: isVoiceLineQueued(factionId, type),
    });

    playAudio(factionId, type, false);
    setIsVoiceLinePlaying(true);
  };

  const handlePlayAnnouncerAudio = async (type: LineType) => {
    if (!socket) return;

    // Analytics: Track voice line click for announcer
    trackVoiceLineClick({
      faction: "announcer",
      lineType: type,
      sessionId: sessionId || undefined,
      isQueued: isAnnouncerLineQueued(type),
    });

    playAudio("announcer" as FactionId, type, false);
    setIsVoiceLinePlaying(true);
  };

  const handleStopAudio = () => {
    stopAudio();
    setIsVoiceLinePlaying(false);
  };

  const handleCreateSession = () => {
    trackButtonClick({
      buttonType: "create_session",
      context: "voices_page",
    });
  };

  const handleShowQrCode = () => {
    trackButtonClick({
      buttonType: "show_qr_code",
      context: "voices_page",
      sessionId: sessionId || undefined,
    });
    setQrModalOpened(true);
  };

  const handleEndSession = () => {
    trackButtonClick({
      buttonType: "end_session",
      context: "voices_page",
      sessionId: sessionId || undefined,
    });

    if (sessionId) {
      trackSessionEvent({
        action: "session_ended",
        sessionId: sessionId,
      });
    }
  };

  const handleReconnect = () => {
    trackButtonClick({
      buttonType: "reconnect",
      context: "voices_page",
      sessionId: sessionId || undefined,
    });
    reconnect();
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
          onClick={handleReconnect}
          loading={isReconnecting}
        >
          Refresh
        </Button>
      )}

      {/* Page Header */}
      <Group className={styles.pageHeader} align="flex-start" justify="space-between" wrap="wrap">
        <Stack gap="xs">
          <Title order={1} className={styles.pageTitle}>Voice Lines</Title>
          {!sessionId ? (
            <Form method="post" onSubmit={handleCreateSession}>
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
                onClick={() => {
                  handleEndSession();
                  window.location.href = window.location.pathname;
                }}
              >
                End Session
              </Button>
            </Group>
          )}
        </Stack>

        {/* Session Info */}
        {sessionId && (
          <Paper className={styles.sessionPanel} p="md" withBorder>
            <Group gap="lg" align="flex-start">
              <Stack gap="xs">
                <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
                  Session Code
                </Text>
                <Text className={styles.sessionCode}>{sessionId}</Text>
                <Text size="sm" c="dimmed">
                  tidraft.com/voices/{sessionId}
                </Text>
                <Button
                  size="xs"
                  variant="light"
                  color="blue"
                  leftSection={<IconQrcode size={14} />}
                  onClick={handleShowQrCode}
                >
                  Show QR Code
                </Button>
              </Stack>
              <Stack align="center" gap={4}>
                <Box className={styles.qrContainer}>
                  <QRCode
                    value={`https://tidraft.com/voices/${sessionId}`}
                    size={100}
                  />
                </Box>
                <Text size="xs" c="dimmed">
                  Scan to join
                </Text>
              </Stack>
            </Group>
          </Paper>
        )}

        {/* Spotify Panel */}
        <Paper className={styles.spotifyPanel} p="md" withBorder>
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
        </Paper>
      </Group>

      {/* Controls Row */}
      <Group justify="flex-end" gap="md" mb="md">
        <ClientOnly>
          {() => (
            <ClosedCaptionsToggle
              sessionId={sessionId}
              checked={closedCaptionsEnabled}
              onChange={changeClosedCaptionsEnabled}
            />
          )}
        </ClientOnly>
      </Group>

      {/* Announcer Section */}
      <Paper className={styles.announcerPanel} p="md" withBorder mb="xl">
        <Group className={styles.announcerHeader} gap="sm" mb="md">
          <Box className={styles.announcerIcon}>A</Box>
          <Title order={3} className={styles.announcerTitle}>Announcer</Title>
          <Text size="xs" c="dimmed" ml="auto">
            Game event announcements
          </Text>
        </Group>
        <Group gap="sm" wrap="wrap">
            <AnnouncerVoiceLineButton
              type="announcerWarsundown"
              label="War Sun Down"
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio("announcerWarsundown")}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", "announcerWarsundown")}
              isQueued={isAnnouncerLineQueued("announcerWarsundown")}
              lineCount={getRemainingLineCount("announcer" as FactionId, "announcerWarsundown", voiceLineMemory)}
            />

            <AnnouncerVoiceLineButton
              type="announcerBreak"
              label="Break Time"
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio("announcerBreak")}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", "announcerBreak")}
              isQueued={isAnnouncerLineQueued("announcerBreak")}
              lineCount={getRemainingLineCount("announcer" as FactionId, "announcerBreak", voiceLineMemory)}
            />

            <AnnouncerVoiceLineButton
              type="announcerInvasionstopped"
              label="Invasion Stopped"
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio("announcerInvasionstopped")}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", "announcerInvasionstopped")}
              isQueued={isAnnouncerLineQueued("announcerInvasionstopped")}
              lineCount={getRemainingLineCount("announcer" as FactionId, "announcerInvasionstopped", voiceLineMemory)}
            />

            <AnnouncerVoiceLineButton
              type="announcerAnnihilation"
              label="Annihilation"
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio("announcerAnnihilation")}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", "announcerAnnihilation")}
              isQueued={isAnnouncerLineQueued("announcerAnnihilation")}
              lineCount={getRemainingLineCount("announcer" as FactionId, "announcerAnnihilation", voiceLineMemory)}
            />

            <AnnouncerVoiceLineButton
              type="announcerDreaddown"
              label="Dreadnought Down"
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio("announcerDreaddown")}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", "announcerDreaddown")}
              isQueued={isAnnouncerLineQueued("announcerDreaddown")}
              lineCount={getRemainingLineCount("announcer" as FactionId, "announcerDreaddown", voiceLineMemory)}
            />

            <AnnouncerVoiceLineButton
              type="announcerCriticalhit"
              label="Critical Hit"
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio("announcerCriticalhit")}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", "announcerCriticalhit")}
              isQueued={isAnnouncerLineQueued("announcerCriticalhit")}
              lineCount={getRemainingLineCount("announcer" as FactionId, "announcerCriticalhit", voiceLineMemory)}
            />

            <AnnouncerVoiceLineButton
              type="announcerAgenda"
              label="Agenda Phase"
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio("announcerAgenda")}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", "announcerAgenda")}
              isQueued={isAnnouncerLineQueued("announcerAgenda")}
              lineCount={getRemainingLineCount("announcer" as FactionId, "announcerAgenda", voiceLineMemory)}
            />
        </Group>
      </Paper>

      {/* Factions Section */}
      <Box component="section">
        <Group className={styles.sectionHeader} gap="sm" mb="md">
          <IconMicrophone2 size={16} color="var(--mantine-color-dimmed)" />
          <Title order={4} className={styles.sectionTitle}>Voice Lines</Title>
          <Text size="xs" c="dimmed" ml="auto">
            {factionSlots.length} factions
          </Text>
        </Group>

        <Box className={styles.factionGrid}>
          {factionSlots.map((faction, index) => (
            <Paper key={`${faction}-${index}`} className={styles.factionCard} withBorder>
              <Group className={styles.factionCardHeader} gap="sm">
                <FactionIcon
                  faction={faction}
                  style={{ width: 24, height: 24 }}
                />
                <Text className={styles.factionName} flex={1}>
                  {factions[faction]?.name}
                </Text>
                <Select
                  size="xs"
                  variant="default"
                  value={faction}
                  onChange={(newFaction) => {
                    if (newFaction) {
                      const newSlots = [...factionSlots];
                      newSlots[index] = newFaction as FactionId;
                      setFactionSlots(newSlots);

                      trackButtonClick({
                        buttonType: "faction_select",
                        context: `${faction}_to_${newFaction}`,
                        sessionId: sessionId || undefined,
                      });
                    }
                  }}
                  data={factionData}
                  w={140}
                  comboboxProps={{ width: 200, position: "bottom-end" }}
                />
              </Group>
              <Box className={styles.factionCardBody}>
                {/* Combat voice lines - primary actions */}
                <div className={styles.voiceLineSection}>
                  <div className={styles.voiceLineSectionLabel}>Combat</div>
                  <div className={styles.voiceLineGroup}>
                    <VoiceLineButton
                      faction={faction}
                      label="Battle"
                      type="battleLines"
                      variant="primary"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "battleLines")}
                      onStop={handleStopAudio}
                      onRemoveFromQueue={() => handleRemoveFromQueue(faction, "battleLines")}
                      isQueued={isVoiceLineQueued(faction, "battleLines")}
                      lineCount={getRemainingLineCount(faction, "battleLines", voiceLineMemory)}
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Defend"
                      type="homeDefense"
                      variant="primary"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "homeDefense")}
                      onStop={handleStopAudio}
                      onRemoveFromQueue={() => handleRemoveFromQueue(faction, "homeDefense")}
                      isQueued={isVoiceLineQueued(faction, "homeDefense")}
                      lineCount={getRemainingLineCount(faction, "homeDefense", voiceLineMemory)}
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Invade"
                      type="homeInvasion"
                      variant="primary"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "homeInvasion")}
                      onStop={handleStopAudio}
                      onRemoveFromQueue={() => handleRemoveFromQueue(faction, "homeInvasion")}
                      isQueued={isVoiceLineQueued(faction, "homeInvasion")}
                      lineCount={getRemainingLineCount(faction, "homeInvasion", voiceLineMemory)}
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Outnumbered"
                      type="defenseOutnumbered"
                      variant="secondary"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "defenseOutnumbered")}
                      onStop={handleStopAudio}
                      onRemoveFromQueue={() => handleRemoveFromQueue(faction, "defenseOutnumbered")}
                      isQueued={isVoiceLineQueued(faction, "defenseOutnumbered")}
                      lineCount={getRemainingLineCount(faction, "defenseOutnumbered", voiceLineMemory)}
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Superior"
                      type="offenseSuperior"
                      variant="secondary"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "offenseSuperior")}
                      onStop={handleStopAudio}
                      onRemoveFromQueue={() => handleRemoveFromQueue(faction, "offenseSuperior")}
                      isQueued={isVoiceLineQueued(faction, "offenseSuperior")}
                      lineCount={getRemainingLineCount(faction, "offenseSuperior", voiceLineMemory)}
                    />
                  </div>
                </div>

                {/* Special abilities and misc */}
                {(factionAudios[faction]?.special || factionAudios[faction]?.special2 || factionAudios[faction]?.jokes) && (
                  <div className={styles.voiceLineSection}>
                    <div className={styles.voiceLineSectionLabel}>Special</div>
                    <div className={styles.voiceLineGroup}>
                      {factionAudios[faction]?.special && (
                        <VoiceLineButton
                          faction={faction}
                          label={factionAudios[faction]?.special?.title ?? "Special"}
                          type="special"
                          variant="secondary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "special")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "special")}
                          isQueued={isVoiceLineQueued(faction, "special")}
                          lineCount={getRemainingLineCount(faction, "special", voiceLineMemory)}
                        />
                      )}
                      {factionAudios[faction]?.special2 && (
                        <VoiceLineButton
                          faction={faction}
                          label={factionAudios[faction]?.special2?.title ?? "Special 2"}
                          type="special2"
                          variant="secondary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "special2")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "special2")}
                          isQueued={isVoiceLineQueued(faction, "special2")}
                          lineCount={getRemainingLineCount(faction, "special2", voiceLineMemory)}
                        />
                      )}
                      <VoiceLineButton
                        faction={faction}
                        label="Joke"
                        type="jokes"
                        variant="tertiary"
                        loadingAudio={loadingAudio}
                        onPlay={() => handlePlayAudio(faction, "jokes")}
                        onStop={handleStopAudio}
                        onRemoveFromQueue={() => handleRemoveFromQueue(faction, "jokes")}
                        isQueued={isVoiceLineQueued(faction, "jokes")}
                        lineCount={getRemainingLineCount(faction, "jokes", voiceLineMemory)}
                      />
                    </div>
                  </div>
                )}

                {/* Roleplay buttons for specific factions */}
                {(faction === "nomad" || faction === "vulraith" || faction === "hacan") &&
                  factionAudios[faction]?.roleplayYes && (
                    <div className={styles.voiceLineSection}>
                      <div className={styles.voiceLineSectionLabel}>Roleplay</div>
                      <div className={styles.voiceLineGroup}>
                        <VoiceLineButton
                          faction={faction}
                          label="Yes"
                          type="roleplayYes"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplayYes")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplayYes")}
                          isQueued={isVoiceLineQueued(faction, "roleplayYes")}
                          lineCount={getRemainingLineCount(faction, "roleplayYes", voiceLineMemory)}
                        />
                        <VoiceLineButton
                          faction={faction}
                          label="No"
                          type="roleplayNo"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplayNo")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplayNo")}
                          isQueued={isVoiceLineQueued(faction, "roleplayNo")}
                          lineCount={getRemainingLineCount(faction, "roleplayNo", voiceLineMemory)}
                        />
                        <VoiceLineButton
                          faction={faction}
                          label="Refuse"
                          type="roleplayIRefuse"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplayIRefuse")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplayIRefuse")}
                          isQueued={isVoiceLineQueued(faction, "roleplayIRefuse")}
                          lineCount={getRemainingLineCount(faction, "roleplayIRefuse", voiceLineMemory)}
                        />
                        <VoiceLineButton
                          faction={faction}
                          label="Deal"
                          type="roleplayDealWithIt"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplayDealWithIt")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplayDealWithIt")}
                          isQueued={isVoiceLineQueued(faction, "roleplayDealWithIt")}
                          lineCount={getRemainingLineCount(faction, "roleplayDealWithIt", voiceLineMemory)}
                        />
                        <VoiceLineButton
                          faction={faction}
                          label="Not Enough"
                          type="roleplayNotEnough"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplayNotEnough")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplayNotEnough")}
                          isQueued={isVoiceLineQueued(faction, "roleplayNotEnough")}
                          lineCount={getRemainingLineCount(faction, "roleplayNotEnough", voiceLineMemory)}
                        />
                        <VoiceLineButton
                          faction={faction}
                          label="Too Much"
                          type="roleplayTooMuch"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplayTooMuch")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplayTooMuch")}
                          isQueued={isVoiceLineQueued(faction, "roleplayTooMuch")}
                          lineCount={getRemainingLineCount(faction, "roleplayTooMuch", voiceLineMemory)}
                        />
                        <VoiceLineButton
                          faction={faction}
                          label="Sabotage"
                          type="roleplaySabotage"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplaySabotage")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplaySabotage")}
                          isQueued={isVoiceLineQueued(faction, "roleplaySabotage")}
                          lineCount={getRemainingLineCount(faction, "roleplaySabotage", voiceLineMemory)}
                        />
                        <VoiceLineButton
                          faction={faction}
                          label="Fire!"
                          type="roleplayFire"
                          variant="tertiary"
                          loadingAudio={loadingAudio}
                          onPlay={() => handlePlayAudio(faction, "roleplayFire")}
                          onStop={handleStopAudio}
                          onRemoveFromQueue={() => handleRemoveFromQueue(faction, "roleplayFire")}
                          isQueued={isVoiceLineQueued(faction, "roleplayFire")}
                          lineCount={getRemainingLineCount(faction, "roleplayFire", voiceLineMemory)}
                        />
                      </div>
                    </div>
                  )}
              </Box>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Credits section */}
      <div className={styles.creditsSection}>
        <h3 className={styles.creditsTitle}>Credits</h3>

        <div className={styles.creditsGroup}>
          <div className={styles.creditsSubtitle}>Script & Direction</div>
          <div className={styles.creditsList}>
            <div className={styles.creditRow}>
              <span className={styles.creditName}>Meme Philosopher</span>
              <span className={styles.creditRole}>Project director, scriptwriting, FX, website & funding</span>
            </div>
            <div className={styles.creditRow}>
              <span className={styles.creditName}>Cacotopos</span>
              <span className={styles.creditRole}>Mentak, Nekro Virus, Ghosts of Creuss scripts & feedback</span>
            </div>
            <div className={styles.creditRow}>
              <span className={styles.creditName}>Mcstevo</span>
              <span className={styles.creditRole}>&quot;Chief Critic&quot; (allegedly)</span>
            </div>
            <div className={styles.creditRow}>
              <span className={styles.creditName}>Absol225</span>
              <span className={styles.creditRole}>Lore accuracy & script feedback</span>
            </div>
          </div>
        </div>

        <div className={styles.creditsGroup}>
          <div className={styles.creditsSubtitle}>Audio FX</div>
          <div className={styles.creditsList}>
            <div className={styles.creditRow}>
              <span className={styles.creditName}>Xane225</span>
              <span className={styles.creditRole}>Hacan, L1Z1X, Empyrean, Nomad, Muaat, Mahact</span>
            </div>
            <div className={styles.creditRow}>
              <a href="https://www.martinpazosaudio.com/" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Martin Pazos</a>
              <span className={styles.creditRole}>Creuss, Sardakk, Arborec, Argent, Naalu, Naaz-Rhoka, Nekro, Vuil&apos;Raith, Letnev, Saar, Jol-Nar</span>
            </div>
            <div className={styles.creditRow}>
              <span className={styles.creditName}>Meme Philosopher</span>
              <span className={styles.creditRole}>Yin, Yssaril, Nomad, Sol, Mentak</span>
            </div>
          </div>
        </div>

        <div className={styles.creditsGroup}>
          <div className={styles.creditsSubtitle}>Voice Performances</div>
          <div className={styles.creditsList}>
            <div className={styles.creditRow}>
              <a href="https://www.jennasharpe.com/" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Jenna Sharpe</a>
              <span className={styles.creditRole}>Mentak, Argent Flight, Naalu, Ghosts of Creuss</span>
            </div>
            <div className={styles.creditRow}>
              <a href="https://jaspatrick.com/" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Jas Patrick</a>
              <span className={styles.creditRole}>Saar, Xxcha, Yin, Letnev, Yssaril, Naaz-Rhoka (Dart), Sol (male)</span>
            </div>
            <div className={styles.creditRow}>
              <a href="https://soundcloud.com/depthpersuasion" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Daniel Pierce</a>
              <span className={styles.creditRole}>Arborec, Vuil&apos;Raith, Hacan, Nomad, Sardakk</span>
            </div>
            <div className={styles.creditRow}>
              <a href="https://www.bryanjolson.com/" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Bryan Olson</a>
              <span className={styles.creditRole}>Muaat, Empyrean, L1Z1X, Mahact, Nekro Virus</span>
            </div>
            <div className={styles.creditRow}>
              <a href="https://www.jackdoesvoices.com/" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Jack Dundon</a>
              <span className={styles.creditRole}>Titans of Ul, Jol-Nar, Naaz-Rhoka (Tai)</span>
            </div>
            <div className={styles.creditRow}>
              <a href="https://www.elizabethsaydahvo.com/" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Elizabeth Sadyah</a>
              <span className={styles.creditRole}>Winnu</span>
            </div>
            <div className={styles.creditRow}>
              <a href="https://www.ginaleighsmith.com/" target="_blank" rel="noreferrer" className={styles.creditNameLink}>Gina Leigh Smith</a>
              <span className={styles.creditRole}>Federation of Sol (female)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Device selector for Spotify when no active device */}
      <SpotifyDeviceSelector
        isOpen={noActiveDeviceError}
        onClose={() => setNoActiveDeviceError(false)}
        devices={availableDevices}
        isLoading={isLoadingDevices}
        onSelectDevice={async (deviceId: string) => {
          if (deviceId === "refresh") {
            await getDevices();
            return;
          }
          const success = await transferToDevice(deviceId);
          if (success) setNoActiveDeviceError(false);
        }}
      />

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
                    trackButtonClick({
                      buttonType: "pause_audio",
                      context: "footer_player",
                      sessionId: sessionId || undefined,
                    });
                  } else {
                    voiceLineRef.current?.play();
                    setIsVoiceLinePlaying(true);
                    trackButtonClick({
                      buttonType: "resume_audio",
                      context: "footer_player",
                      sessionId: sessionId || undefined,
                    });
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
                    trackButtonClick({
                      buttonType: "skip_to_next",
                      context: "footer_player",
                      sessionId: sessionId || undefined,
                    });
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
              {playingFaction === "announcer" ? (
                <Box
                  style={{
                    width: 18,
                    height: 18,
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
                  faction={playingFaction as FactionId}
                  style={{ width: 18, height: 18 }}
                />
              )}
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
                  trackButtonClick({
                    buttonType: "audio_seek",
                    context: "footer_player",
                    sessionId: sessionId || undefined,
                  });
                }
              }}
              disabled={!loadingAudio}
            />
          </div>

          <VoiceLineQueue
            queue={voiceLineQueue}
            onRemove={(id) => {
              removeFromQueue(id);
              trackButtonClick({
                buttonType: "remove_from_queue",
                context: "queue_popup",
                sessionId: sessionId || undefined,
              });
            }}
            onClear={() => {
              clearQueue();
              trackButtonClick({
                buttonType: "clear_queue",
                context: "queue_popup",
                sessionId: sessionId || undefined,
              });
            }}
          />

          <div className={styles.volumeControls}>
            <ActionIcon
              variant="subtle"
              size="sm"
              onClick={() => {
                if (volume > 0) {
                  setVolume(0);
                  voiceLineRef.current?.volume(0);
                  trackButtonClick({
                    buttonType: "mute_audio",
                    context: "footer_player",
                    sessionId: sessionId || undefined,
                  });
                } else {
                  setVolume(0.5);
                  voiceLineRef.current?.volume(0.5);
                  trackButtonClick({
                    buttonType: "unmute_audio",
                    context: "footer_player",
                    sessionId: sessionId || undefined,
                  });
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

      {/* QR Code Modal */}
      <Modal
        opened={qrModalOpened}
        onClose={() => setQrModalOpened(false)}
        title="Session QR Code"
        centered
        size="xl"
      >
        <Stack align="center" gap="md">
          {sessionId && (
            <QRCode
              value={`https://tidraft.com/voices/${sessionId}`}
              size={600}
            />
          )}
          <Text size="sm" c="dimmed" ta="center">
            Scan this QR code to join the session
          </Text>
          <Text size="xs" c="dimmed" ta="center">
            https://tidraft.com/voices/{sessionId}
          </Text>
        </Stack>
      </Modal>

      {/* Closed Captions Display */}
      {currentCaption && currentCaptionFaction && (
        <ClosedCaptions
          caption={currentCaption}
          visible={closedCaptionsEnabled}
          factionId={currentCaptionFaction}
        />
      )}
    </Container>
  );
}

export const loader = async () => {
  const clientId = process.env.SPOTIFY_OAUTH_CLIENT_ID;
  const redirectUrl = process.env.SPOTIFY_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUrl) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  return json({
    spotifyClientId: clientId,
    spotifyCallbackUrl: redirectUrl.toString(),
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await createSession();

  // Parse existing query parameters from the request URL
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);

  // Add the new session parameter
  searchParams.set("session", session.id);

  // Redirect with all parameters preserved
  return redirect(`/voices?${searchParams.toString()}`);
}

export function extractPlaylistId(input: string) {
  const match = input.match(/playlist[/:]([a-zA-Z0-9]{22})/);
  return match ? match[1] : input;
}
