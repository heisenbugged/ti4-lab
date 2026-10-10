import { useEffect, useState, useMemo } from "react";
import {
  Button,
  ButtonAnchor,
  Heading,
  IconButton,
  Modal,
  Notice,
  Popover,
  SectionHeader,
  Select,
  Slider,
  Switch,
  Text,
  Tooltip,
  cx,
} from "~/ui";
import { FactionId } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { factionAudios, LineType, announcerAudios } from "~/data/factionAudios";
import {
  AnnouncerBadge,
  VoiceButton,
  VoiceLineButton,
} from "~/components/voices/VoiceLineButton";
import { ActionFunctionArgs, data, redirect } from "react-router";
import { Form, useSearchParams, useLoaderData } from "react-router";
import { useAudioPlayer } from "~/components/voices/useAudioPlayer";
import { useSocketConnection } from "~/useSocketConnection";
import QRCode from "react-qr-code";
import { createSession } from "~/drizzle/soundboardSession.server";
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconVolume,
  IconVolumeOff,
  IconPlayerSkipForward,
  IconTrash,
  IconX,
  IconRefresh,
  IconQrcode,
  IconMusic,
  IconBrandSpotify,
} from "@tabler/icons-react";
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
import { SpotifyLoginButton } from "~/components/voices/SpotifyLoginButton";
import { useSpotifyLogin } from "~/components/voices/useSpotifyLogin";
import {
  SpotifyDeviceSelector,
  type SpotifyDeviceType,
} from "~/components/voices/SpotifyDeviceSelector";
import { SpotifyPlaylistUI } from "~/components/voices/SpotifyPlaylistUI";

const LINE_TYPE_DISPLAY_NAMES: Record<LineType, string> = {
  battleLines: "Battle line",
  homeDefense: "Home defense",
  homeInvasion: "Home invasion",
  defenseOutnumbered: "Outnumbered",
  offenseSuperior: "Superiority",
  jokes: "Joke",
  special: "Special",
  special2: "Special 2",
  roleplayYes: "Yes",
  roleplayNo: "No",
  roleplayIRefuse: "I refuse",
  roleplayDealWithIt: "Deal with it",
  roleplayNotEnough: "Not enough",
  roleplayTooMuch: "Too much",
  roleplaySabotage: "Sabotage",
  roleplayFire: "Fire!",
  announcerWarsundown: "War Sun down",
  announcerBreak: "Break time",
  announcerInvasionstopped: "Invasion stopped",
  announcerAnnihilation: "Annihilation",
  announcerDreaddown: "Dreadnought down",
  announcerCriticalhit: "Critical hit",
  announcerAgenda: "Agenda phase",
};

const DEFAULT_PLAYLIST_ID = "6O6izIEToh3JI4sAtHQn6J";

const readStoredPlaylistId = () =>
  localStorage.getItem("spotifyPlaylistId") || DEFAULT_PLAYLIST_ID;

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
const ANNOUNCER_LINES: LineType[] = [
  "announcerWarsundown",
  "announcerBreak",
  "announcerInvasionstopped",
  "announcerAnnihilation",
  "announcerDreaddown",
  "announcerCriticalhit",
  "announcerAgenda",
];

const COMBAT_LINES: Array<{ type: LineType; label: string; combat: boolean }> =
  [
    { type: "battleLines", label: "Battle", combat: true },
    { type: "homeDefense", label: "Defend", combat: true },
    { type: "homeInvasion", label: "Invade", combat: true },
    { type: "defenseOutnumbered", label: "Outnumbered", combat: false },
    { type: "offenseSuperior", label: "Superior", combat: false },
  ];

const ROLEPLAY_LINES: Array<{ type: LineType; label: string }> = [
  { type: "roleplayYes", label: "Yes" },
  { type: "roleplayNo", label: "No" },
  { type: "roleplayIRefuse", label: "Refuse" },
  { type: "roleplayDealWithIt", label: "Deal" },
  { type: "roleplayNotEnough", label: "Not enough" },
  { type: "roleplayTooMuch", label: "Too much" },
  { type: "roleplaySabotage", label: "Sabotage" },
  { type: "roleplayFire", label: "Fire!" },
];

const lineTitle = (factionId: FactionId | "announcer", type: LineType) => {
  if (factionId === "announcer") return LINE_TYPE_DISPLAY_NAMES[type];
  if (type === "special")
    return (
      factionAudios[factionId]?.special?.title ?? LINE_TYPE_DISPLAY_NAMES[type]
    );
  if (type === "special2")
    return (
      factionAudios[factionId]?.special2?.title ?? LINE_TYPE_DISPLAY_NAMES[type]
    );
  return LINE_TYPE_DISPLAY_NAMES[type];
};

function SourceIcon({
  factionId,
  size,
}: {
  factionId: FactionId | "announcer";
  size: number;
}) {
  return factionId === "announcer" ? (
    <AnnouncerBadge size={size} />
  ) : (
    <FactionIcon faction={factionId} style={{ width: size, height: size }} />
  );
}

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
      onOpenChange={setOpened}
      side="top"
      align="end"
      width={280}
      padding={false}
      trigger={
        <Button size="sm" className={styles.queueButton}>
          Queue {queue.length}
        </Button>
      }
    >
      <div className={styles.queueHeader}>
        <Text size="sm" weight={600}>
          Queued lines
        </Text>
        <Button
          size="sm"
          variant="tertiary"
          icon={<IconTrash size={14} />}
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
      <ol className={styles.queueList}>
        {queue.map((item, index) => (
          <li key={item.id} className={styles.queueItem}>
            <span className={styles.queueItemIndex}>{index + 1}</span>
            <SourceIcon factionId={item.factionId} size={20} />
            <span className={styles.queueItemName}>
              {lineTitle(item.factionId, item.type)}
            </span>
            <IconButton
              label="Remove from queue"
              size="xs"
              onClick={() => onRemove(item.id)}
            >
              <IconX size={14} />
            </IconButton>
          </li>
        ))}
      </ol>
    </Popover>
  );
};

interface ClosedCaptionsProps {
  caption: string;
  factionId: FactionId | "announcer";
}

const ClosedCaptions = ({ caption, factionId }: ClosedCaptionsProps) => {
  return (
    <div className={ccStyles.container} role="status" aria-live="polite">
      <div className={ccStyles.caption}>
        <SourceIcon factionId={factionId} size={24} />
        <p className={ccStyles.text}>{caption}</p>
      </div>
    </div>
  );
};

const ClosedCaptionsToggle = ({
  sessionId,
  checked,
  onChange,
}: {
  sessionId: string | null;
  checked: boolean;
  onChange: (enabled: boolean) => void;
}) => {
  const handleToggle = (newValue: boolean) => {
    onChange(newValue);
    trackButtonClick({
      buttonType: "closed_captions_toggle",
      context: newValue ? "cc_on" : "cc_off",
      sessionId: sessionId || undefined,
    });
  };

  return (
    <Switch
      label="Captions"
      aria-label="Closed captions"
      checked={checked}
      onChange={handleToggle}
    />
  );
};

/** Lines of this type not yet played this session. */
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
    <VoiceButton
      label={label}
      playing={isLoading}
      queued={isQueued}
      disabled={isDisabled}
      count={lineCount}
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
    />
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

  // Read after hydration; the server has no localStorage.
  useEffect(() => {
    setPlaylistId(readStoredPlaylistId());
  }, []);

  // Clearing the field falls back to the last saved playlist.
  const changePlaylistId = (id: string) => {
    if (!id) {
      setPlaylistId(readStoredPlaylistId());
      return;
    }
    localStorage.setItem("spotifyPlaylistId", id);
    setPlaylistId(id);
  };

  // Opens whenever a session starts (creating one redirects back here).
  const [qrModalOpened, setQrModalOpened] = useState(!!sessionId);
  const [qrForSession, setQrForSession] = useState(sessionId);
  if (sessionId !== qrForSession) {
    setQrForSession(sessionId);
    if (sessionId) setQrModalOpened(true);
  }

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
    playlistId: playlistId || DEFAULT_PLAYLIST_ID,
    lineFinished: () => {
      if (!socket) return;
      socket.emit("lineFinished", sessionId);
      setIsVoiceLinePlaying(false);
    },
  });

  const currentCaption =
    closedCaptionsEnabled && currentAudio?.caption
      ? currentAudio.caption
      : null;

  const currentCaptionFaction =
    currentCaption && loadingAudio
      ? (loadingAudio.split("-")[0] as FactionId | "announcer")
      : null;

  useEffect(() => {
    trackPageView({
      route: "/voices",
      sessionId: sessionId || undefined,
    });
    if (sessionId) {
      trackSessionEvent({ action: "session_joined", sessionId });
    }
    const stopTimeOnPage = trackTimeOnPage("/voices", sessionId || undefined);
    return () => stopTimeOnPage?.();
  }, [sessionId]);

  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: (socket) => socket.emit("joinSoundboardSession", sessionId),
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

    return () => {
      socket.off("requestSessionData", handleRequestSessionData);
      socket.off("playLine", handlePlayLine);
      socket.off("stopLine", handleStopLine);
    };
  }, [sessionId, socket, factionSlots, playAudio, stopAudio]);

  // Queue item id by "<faction>-<type>", for queued state and removal.
  const queuedLines = useMemo(
    () =>
      new Map(
        voiceLineQueue.map((item) => [
          `${item.factionId}-${item.type}`,
          item.id,
        ]),
      ),
    [voiceLineQueue],
  );

  const isQueued = (factionId: FactionId | "announcer", type: LineType) =>
    queuedLines.has(`${factionId}-${type}`);

  const handleRemoveFromQueue = (
    factionId: FactionId | "announcer",
    type: LineType,
  ) => {
    const id = queuedLines.get(`${factionId}-${type}`);
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

    trackVoiceLineClick({
      faction: factionId,
      lineType: type,
      sessionId: sessionId || undefined,
      isQueued: isQueued(factionId, type),
    });

    playAudio(factionId, type, false);
    setIsVoiceLinePlaying(true);
  };

  const handlePlayAnnouncerAudio = async (type: LineType) => {
    if (!socket) return;

    trackVoiceLineClick({
      faction: "announcer",
      lineType: type,
      sessionId: sessionId || undefined,
      isQueued: isQueued("announcer", type),
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

  const [playingFaction, playingLineType] = loadingAudio
    ? (loadingAudio.split("-") as [FactionId | "announcer", LineType])
    : [null, null];
  const playingTitle =
    playingFaction && playingLineType
      ? lineTitle(playingFaction, playingLineType)
      : null;

  const playLine = (faction: FactionId, type: LineType) => ({
    loadingAudio,
    onPlay: () => handlePlayAudio(faction, type),
    onStop: handleStopAudio,
    onRemoveFromQueue: () => handleRemoveFromQueue(faction, type),
    isQueued: isQueued(faction, type),
    lineCount: getRemainingLineCount(faction, type, voiceLineMemory),
  });

  const sessionUrl = `https://tidraft.com/voices/${sessionId}`;

  return (
    <div className={styles.page}>
      {socket && isDisconnected && (
        <div className={styles.reconnect}>
          <Button
            icon={<IconRefresh size={18} />}
            onClick={handleReconnect}
            loading={isReconnecting}
          >
            Refresh
          </Button>
        </div>
      )}

      <header className={styles.head}>
        <div className={styles.titleBlock}>
          <Heading variant="title" as="h1">
            Voice lines
          </Heading>
          <Text size="sm" tone="muted">
            Play faction lines at the table. Start a session so everyone&apos;s
            phone can trigger them.
          </Text>
          <div className={styles.sessionRow}>
            {!sessionId ? (
              <Form method="post" onSubmit={handleCreateSession}>
                <Button
                  type="submit"
                  variant="primary"
                  icon={<IconMusic size={18} />}
                >
                  Create session
                </Button>
              </Form>
            ) : (
              <Button
                variant="danger"
                onClick={() => {
                  handleEndSession();
                  window.location.href = window.location.pathname;
                }}
              >
                End session
              </Button>
            )}
            <ClientOnly>
              {() => (
                <ClosedCaptionsToggle
                  sessionId={sessionId}
                  checked={closedCaptionsEnabled}
                  onChange={changeClosedCaptionsEnabled}
                />
              )}
            </ClientOnly>
          </div>

          {sessionId && (
            <div className={styles.session}>
              <button
                type="button"
                className={styles.qrThumb}
                onClick={handleShowQrCode}
                aria-label="Show QR code"
              >
                <QRCode value={sessionUrl} size={76} />
              </button>
              <div className={styles.sessionInfo}>
                <Text size="xs" tone="muted" weight={600}>
                  Session code
                </Text>
                <span className={styles.sessionCode}>{sessionId}</span>
                <Text size="sm" tone="muted" truncate>
                  tidraft.com/voices/{sessionId}
                </Text>
              </div>
              <Button
                size="sm"
                variant="tertiary"
                icon={<IconQrcode size={16} />}
                onClick={handleShowQrCode}
                className={styles.sessionQrButton}
              >
                Show QR code
              </Button>
            </div>
          )}
        </div>

        <section className={styles.spotify} aria-label="Spotify">
          <div className={styles.spotifyHead}>
            <span className={styles.spotifyTitle}>
              <IconBrandSpotify size={18} />
              Spotify
            </span>
            {accessToken ? (
              <ButtonAnchor size="sm" variant="tertiary" href="/voices/logout">
                Log out
              </ButtonAnchor>
            ) : (
              <SpotifyLoginButton
                accessToken={accessToken}
                spotifyCallbackUrl={spotifyCallbackUrl}
                spotifyClientId={spotifyClientId}
              />
            )}
          </div>

          {!accessToken ? (
            <Text size="sm" tone="muted">
              Connect Spotify to control background music. Battle music plays
              automatically during combat. Needs Spotify Premium.
            </Text>
          ) : playbackRestrictions ? (
            <Notice tone="warning">
              Spotify Premium required for playback control.
            </Notice>
          ) : (
            <>
              {currentPlayback && (
                <div className={styles.playback}>
                  <img
                    src={currentPlayback.albumImage.url}
                    alt=""
                    width={40}
                    height={40}
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
                    <span className={styles.artistName}>
                      {currentPlayback.artists
                        .map((a: { name: string }) => a.name)
                        .join(", ")}
                    </span>
                  </div>
                </div>
              )}
              <SpotifyPlaylistUI
                playlistId={playlistId}
                setPlaylistId={changePlaylistId}
                isWarMode={isWarMode}
                endWar={endWar}
              />
            </>
          )}
        </section>
      </header>

      <section className={styles.announcer} aria-labelledby="announcer-title">
        <div className={styles.announcerHead}>
          <AnnouncerBadge />
          <Heading variant="heading" as="h2" id="announcer-title">
            Announcer
          </Heading>
          <Text size="sm" tone="muted" className={styles.announcerMeta}>
            Game event announcements
          </Text>
        </div>
        <div className={styles.lineRow}>
          {ANNOUNCER_LINES.map((type) => (
            <AnnouncerVoiceLineButton
              key={type}
              type={type}
              label={LINE_TYPE_DISPLAY_NAMES[type]}
              loadingAudio={loadingAudio}
              onPlay={() => handlePlayAnnouncerAudio(type)}
              onStop={handleStopAudio}
              onRemoveFromQueue={() => handleRemoveFromQueue("announcer", type)}
              isQueued={isQueued("announcer", type)}
              lineCount={getRemainingLineCount(
                "announcer" as FactionId,
                type,
                voiceLineMemory,
              )}
            />
          ))}
        </div>
      </section>

      <section className={styles.factions}>
        <SectionHeader
          title="Factions"
          meta={`${factionSlots.length} factions. Swap any card to a different faction.`}
        />

        <div className={styles.factionGrid}>
          {factionSlots.map((faction, index) => (
            <section
              key={`${faction}-${index}`}
              className={styles.factionCard}
              aria-label={factions[faction]?.name}
            >
              <header className={styles.factionCardHeader}>
                <FactionIcon
                  faction={faction}
                  style={{ width: 26, height: 26 }}
                />
                <h3 className={styles.factionName}>
                  {factions[faction]?.name}
                </h3>
                <Select
                  size="sm"
                  aria-label={`Faction for this card (${factions[faction]?.name})`}
                  className={styles.factionSelect}
                  width={34}
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
                  options={factionData}
                />
              </header>
              <div className={styles.factionCardBody}>
                <span className={styles.groupLabel}>Combat</span>
                <div className={styles.lineRow}>
                  {COMBAT_LINES.map((line) => (
                    <VoiceLineButton
                      key={line.type}
                      faction={faction}
                      label={line.label}
                      type={line.type}
                      variant={line.combat ? "primary" : "secondary"}
                      {...playLine(faction, line.type)}
                    />
                  ))}
                </div>

                {(factionAudios[faction]?.special ||
                  factionAudios[faction]?.special2 ||
                  factionAudios[faction]?.jokes) && (
                  <>
                    <span className={styles.groupLabel}>Special</span>
                    <div className={styles.lineRow}>
                      {factionAudios[faction]?.special && (
                        <VoiceLineButton
                          faction={faction}
                          label={
                            factionAudios[faction]?.special?.title ?? "Special"
                          }
                          type="special"
                          {...playLine(faction, "special")}
                        />
                      )}
                      {factionAudios[faction]?.special2 && (
                        <VoiceLineButton
                          faction={faction}
                          label={
                            factionAudios[faction]?.special2?.title ??
                            "Special 2"
                          }
                          type="special2"
                          {...playLine(faction, "special2")}
                        />
                      )}
                      <VoiceLineButton
                        faction={faction}
                        label="Joke"
                        type="jokes"
                        variant="tertiary"
                        {...playLine(faction, "jokes")}
                      />
                    </div>
                  </>
                )}

                {/* Roleplay buttons for specific factions */}
                {(faction === "nomad" ||
                  faction === "vulraith" ||
                  faction === "hacan") &&
                  factionAudios[faction]?.roleplayYes && (
                    <>
                      <span className={styles.groupLabel}>Roleplay</span>
                      <div className={styles.lineRow}>
                        {ROLEPLAY_LINES.map((line) => (
                          <VoiceLineButton
                            key={line.type}
                            faction={faction}
                            label={line.label}
                            type={line.type}
                            variant="tertiary"
                            {...playLine(faction, line.type)}
                          />
                        ))}
                      </div>
                    </>
                  )}
              </div>
            </section>
          ))}
        </div>
      </section>

      <section className={styles.credits}>
        <SectionHeader title="Credits" />
        <div className={styles.creditsGrid}>
          {CREDITS.map((group) => (
            <div key={group.title} className={styles.creditsGroup}>
              <Text size="sm" weight={600}>
                {group.title}
              </Text>
              <dl className={styles.creditsList}>
                {group.people.map((person) => (
                  <div
                    key={`${person.name}-${person.role}`}
                    className={styles.creditRow}
                  >
                    <dt>
                      {person.href ? (
                        <a
                          href={person.href}
                          target="_blank"
                          rel="noreferrer"
                          className={styles.creditLink}
                        >
                          {person.name}
                        </a>
                      ) : (
                        person.name
                      )}
                    </dt>
                    <dd>{person.role}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
        </div>
      </section>

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

      <footer className={styles.player} aria-label="Player">
        <div className={styles.playerInner}>
          <IconButton
            label={isVoiceLinePlaying ? "Pause" : "Play"}
            onClick={() => {
              if (playingTitle) {
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
            disabled={!playingTitle}
          >
            {isVoiceLinePlaying ? (
              <IconPlayerStop size={18} />
            ) : (
              <IconPlayerPlay size={18} />
            )}
          </IconButton>

          <Tooltip label="Skip to next">
            <IconButton
              label="Skip to next"
              disabled={voiceLineQueue.length === 0}
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
              <IconPlayerSkipForward size={18} />
            </IconButton>
          </Tooltip>

          <div className={styles.nowPlaying}>
            {playingFaction && playingTitle ? (
              <>
                <SourceIcon factionId={playingFaction} size={26} />
                <span className={styles.nowPlayingText}>
                  <b>{playingTitle}</b>
                  <small>
                    {playingFaction === "announcer"
                      ? "Announcer"
                      : factions[playingFaction]?.name}
                  </small>
                </span>
              </>
            ) : (
              <Text size="sm" tone="muted" truncate>
                Nothing playing
              </Text>
            )}
          </div>

          <div
            className={cx(styles.seek, !loadingAudio && styles.seekDisabled)}
            aria-disabled={!loadingAudio}
          >
            <Slider
              label="Seek"
              min={0}
              max={1}
              step={0.01}
              value={audioProgress || 0}
              onChange={(value) => {
                const newPosition = Array.isArray(value) ? value[0] : value;
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

          <IconButton
            label={volume === 0 ? "Unmute" : "Mute"}
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
              <IconVolumeOff size={18} />
            ) : (
              <IconVolume size={18} />
            )}
          </IconButton>
          <div className={styles.volume}>
            <Slider
              label="Volume"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={(value) => {
                const newVolume = Array.isArray(value) ? value[0] : value;
                setVolume(newVolume);
                voiceLineRef.current?.volume(newVolume);
              }}
            />
          </div>
        </div>
      </footer>

      <Modal
        opened={qrModalOpened}
        onClose={() => setQrModalOpened(false)}
        title="Session QR code"
        description="Scan this QR code to join the session"
        size="lg"
        footer={
          <Button variant="primary" onClick={() => setQrModalOpened(false)}>
            Done
          </Button>
        }
      >
        <div className={styles.qrLarge}>
          {sessionId && (
            <QRCode
              value={sessionUrl}
              size={512}
              style={{ width: "100%", height: "auto", maxWidth: 420 }}
              viewBox="0 0 256 256"
            />
          )}
        </div>
        <Text size="sm" tone="muted" align="center">
          {sessionUrl}
        </Text>
      </Modal>

      {currentCaption && currentCaptionFaction && (
        <ClosedCaptions
          caption={currentCaption}
          factionId={currentCaptionFaction}
        />
      )}
    </div>
  );
}

type Credit = { name: string; role: string; href?: string };

const CREDITS: Array<{ title: string; people: Credit[] }> = [
  {
    title: "Script and direction",
    people: [
      {
        name: "Meme Philosopher",
        role: "Project director, scriptwriting, FX, website & funding",
      },
      {
        name: "Cacotopos",
        role: "Mentak, Nekro Virus, Ghosts of Creuss scripts & feedback",
      },
      { name: "Mcstevo", role: "“Chief Critic” (allegedly)" },
      { name: "Absol225", role: "Lore accuracy & script feedback" },
    ],
  },
  {
    title: "Audio FX",
    people: [
      { name: "Xane225", role: "Hacan, L1Z1X, Empyrean, Nomad, Muaat, Mahact" },
      {
        name: "Martin Pazos",
        href: "https://www.martinpazosaudio.com/",
        role: "Creuss, Sardakk, Arborec, Argent, Naalu, Naaz-Rhoka, Nekro, Vuil'Raith, Letnev, Saar, Jol-Nar",
      },
      { name: "Meme Philosopher", role: "Yin, Yssaril, Nomad, Sol, Mentak" },
    ],
  },
  {
    title: "Voice performances",
    people: [
      {
        name: "Jez Sands",
        href: "https://jezsands.wixsite.com/profile/voiceover-artist",
        role: "Announcer voice",
      },
      {
        name: "Jenna Sharpe",
        href: "https://www.jennasharpe.com/",
        role: "Mentak, Argent Flight, Naalu, Ghosts of Creuss",
      },
      {
        name: "Jas Patrick",
        href: "https://jaspatrick.com/",
        role: "Saar, Xxcha, Yin, Letnev, Yssaril, Naaz-Rhoka (Dart), Sol (male)",
      },
      {
        name: "Daniel Pierce",
        href: "https://soundcloud.com/depthpersuasion",
        role: "Arborec, Vuil'Raith, Hacan, Nomad, Sardakk",
      },
      {
        name: "Bryan Olson",
        href: "https://www.bryanjolson.com/",
        role: "Muaat, Empyrean, L1Z1X, Mahact, Nekro Virus",
      },
      {
        name: "Jack Dundon",
        href: "https://www.jackdoesvoices.com/",
        role: "Titans of Ul, Jol-Nar, Naaz-Rhoka (Tai)",
      },
      {
        name: "Elizabeth Sadyah",
        href: "https://www.elizabethsaydahvo.com/",
        role: "Winnu",
      },
      {
        name: "Gina Leigh Smith",
        href: "https://www.ginaleighsmith.com/",
        role: "Federation of Sol (female)",
      },
    ],
  },
];

export const loader = async () => {
  const clientId = process.env.SPOTIFY_OAUTH_CLIENT_ID;
  const redirectUrl = process.env.SPOTIFY_OAUTH_REDIRECT_URI;
  if (!clientId || !redirectUrl) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  return data({
    spotifyClientId: clientId,
    spotifyCallbackUrl: redirectUrl.toString(),
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await createSession();

  // Keep the current faction slots in the session URL.
  const searchParams = new URL(request.url).searchParams;
  searchParams.set("session", session.id);
  return redirect(`/voices?${searchParams.toString()}`);
}
