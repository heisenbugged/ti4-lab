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
  List,
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
} from "@mantine/core";
import { FactionId } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { factionAudios, LineType } from "~/data/factionAudios";
import { VoiceLineButton } from "../soundboard._index/components/VoiceLineButton";
import { ActionFunctionArgs, json, redirect } from "@remix-run/server-runtime";
import { Form, useSearchParams } from "@remix-run/react";
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
import styles from "./ClosedCaptions.module.css";

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
    factionId: FactionId;
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
                      <FactionIcon
                        faction={item.factionId}
                        style={{ width: 20, height: 20 }}
                      />
                      <Text size="sm" truncate style={{ flex: 1 }}>
                        {item.type === "special"
                          ? factionAudios[item.factionId]?.special?.title
                          : item.type === "special2"
                            ? factionAudios[item.factionId]?.special2?.title
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

// Closed Captions Display Component
interface ClosedCaptionsProps {
  caption: string;
  visible: boolean;
  factionId: FactionId;
}

const ClosedCaptions = ({
  caption,
  visible,
  factionId,
}: ClosedCaptionsProps) => {
  if (!visible || !caption) return null;

  return (
    <Box className={styles.container}>
      <Paper withBorder className={styles.paper}>
        <Group gap="xs" justify="center" align="center">
          <FactionIcon faction={factionId} style={{ width: 24, height: 24 }} />
          <Text fw={600} c="white" ta="center" className={styles.text}>
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

// Client-only component for transmissions toggle
const TransmissionsToggle = ({
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

    // Analytics: Track transmission toggle
    trackButtonClick({
      buttonType: "transmission_toggle",
      context: newValue ? "transmission_on" : "transmission_off",
      sessionId: sessionId || undefined,
    });
  };

  return (
    <Switch
      label="Transmissions"
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
  const factionData = factionAudios[factionId];
  if (!factionData) return 0;

  // Get total count for this line type
  let totalCount = 0;
  if (type === "special") {
    totalCount = factionData.special?.entries?.length || 0;
  } else if (type === "special2") {
    totalCount = factionData.special2?.entries?.length || 0;
  } else {
    const typeData = factionData[type];
    totalCount = Array.isArray(typeData) ? typeData.length : 0;
  }

  // Get played count from memory
  const playedCount = voiceLineMemory[factionId]?.[type]?.length || 0;

  // Return remaining count
  return Math.max(0, totalCount - playedCount);
};

export default function VoicesMaster() {
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
  const timeOnPageTracker = useRef<(() => void) | null>(null);
  const [qrModalOpened, setQrModalOpened] = useState(false);
  const [transmissionsEnabled, setTransmissionsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("transmissionsEnabled");
      return saved === "true";
    }
    return false;
  });
  const transmissionsEnabledRef = useRef(transmissionsEnabled);

  const [closedCaptionsEnabled, setClosedCaptionsEnabled] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("closedCaptionsEnabled");
      return saved === "true";
    }
    return false;
  });

  const changeTransmissionsEnabled = (enabled: boolean) => {
    localStorage.setItem("transmissionsEnabled", enabled.toString());
    transmissionsEnabledRef.current = enabled;
    setTransmissionsEnabled(enabled);
  };

  const changeClosedCaptionsEnabled = (enabled: boolean) => {
    localStorage.setItem("closedCaptionsEnabled", enabled.toString());
    setClosedCaptionsEnabled(enabled);
  };

  const {
    playAudio,
    stopAudio,
    loadingAudio,
    currentAudio,
    voiceLineRef,
    audioProgress,
    voiceLineQueue,
    removeFromQueue,
    clearQueue,
    voiceLineMemory,
  } = useAudioPlayer({
    accessToken: null,
    playlistId: null,
    transmissionsEnabled: true,
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
      ? (loadingAudio.split("-")[0] as FactionId)
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
    socket.on("requestSessionData", () =>
      socket.emit("sendSessionData", sessionId, factionSlots),
    );
    socket.on("playLine", (factionId, lineType) => {
      playAudio(
        factionId,
        lineType,
        true,
        !transmissionsEnabledRef.current,
        factionSlots.indexOf(factionId),
      );
    });
    socket.on("stopLine", () => stopAudio());
  }, [sessionId, socket]);

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

  const handlePlayAudio = async (factionId: FactionId, type: LineType) => {
    if (!socket) return;

    // Calculate transmission index based on faction's position in slots
    const factionSlotIndex = factionSlots.findIndex(
      (slot) => slot === factionId,
    );
    const transmissionIndex = factionSlotIndex >= 0 ? factionSlotIndex : 0;

    // Analytics: Track voice line click
    trackVoiceLineClick({
      faction: factionId,
      lineType: type,
      sessionId: sessionId || undefined,
      isQueued: isVoiceLineQueued(factionId, type),
    });

    playAudio(factionId, type, false, !transmissionsEnabled, transmissionIndex);
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
    <Container py="xl" maw={1600} pos="relative" mt="sm">
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

      <Stack mb="xl" gap="md" mt="lg">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          {/* Left component - changes based on session state */}
          {sessionId ? (
            <Group gap="md" align="center" wrap="wrap">
              <Stack gap="xs">
                <Text fw={500}>Session Code: {sessionId}</Text>
                <Text size="sm" c="dimmed">
                  https://tidraft.com/voices/{sessionId}
                </Text>
              </Stack>
              <Button
                variant="filled"
                color="blue"
                leftSection={<IconQrcode size={16} />}
                onClick={handleShowQrCode}
              >
                Show QR Code
              </Button>
              <Button
                variant="filled"
                color="red"
                onClick={() => {
                  handleEndSession();
                  window.location.href = window.location.pathname;
                }}
              >
                End Session
              </Button>
            </Group>
          ) : (
            <Form method="post" onSubmit={handleCreateSession}>
              <Button type="submit" size="xl">
                Create Session
              </Button>
            </Form>
          )}

          {/* Right component - always the same alert */}
          <Alert
            variant="light"
            color="blue"
            title="How to use Voice Lines"
            icon={<IconInfoCircle />}
            style={{ flex: "0 1 600px", minWidth: "300px" }}
          >
            Trigger voice lines when pivotal moments happen in your play
            sessions. Use the &apos;create session&apos; feature to allow
            players to connect via their phones to trigger their own voice lines
            on your sound system.
          </Alert>
        </Group>
      </Stack>

      {/* Transmissions and CC Toggles - positioned top right above table */}
      <Group justify="flex-end" gap="md">
        <ClientOnly>
          {() => (
            <ClosedCaptionsToggle
              sessionId={sessionId}
              checked={closedCaptionsEnabled}
              onChange={changeClosedCaptionsEnabled}
            />
          )}
        </ClientOnly>
        <ClientOnly>
          {() => (
            <TransmissionsToggle
              sessionId={sessionId}
              checked={transmissionsEnabled}
              onChange={(enabled) => {
                changeTransmissionsEnabled(enabled);

                // Analytics: Track transmission toggle
                trackButtonClick({
                  buttonType: "transmission_toggle",
                  context: enabled ? "transmission_on" : "transmission_off",
                  sessionId: sessionId || undefined,
                });
              }}
            />
          )}
        </ClientOnly>
      </Group>
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

                        // Analytics: Track faction selection
                        trackButtonClick({
                          buttonType: "faction_select",
                          context: `${faction}_to_${newFaction}`,
                          sessionId: sessionId || undefined,
                        });
                      }
                    }}
                    data={factionData}
                    w={200}
                  />
                </Group>
              </Table.Td>

              <Table.Td>
                <Group gap="md">
                  <VoiceLineButton
                    faction={faction}
                    label="Battle Line"
                    type="battleLines"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "battleLines")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "battleLines")}
                    lineCount={getRemainingLineCount(
                      faction,
                      "battleLines",
                      voiceLineMemory,
                    )}
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
                      lineCount={getRemainingLineCount(
                        faction,
                        "defenseOutnumbered",
                        voiceLineMemory,
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
                      lineCount={getRemainingLineCount(
                        faction,
                        "offenseSuperior",
                        voiceLineMemory,
                      )}
                    />
                  </Stack>

                  <VoiceLineButton
                    faction={faction}
                    label="Home Defense (Long)"
                    type="homeDefense"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeDefense")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "homeDefense")}
                    lineCount={getRemainingLineCount(
                      faction,
                      "homeDefense",
                      voiceLineMemory,
                    )}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Planet Invasion"
                    type="homeInvasion"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeInvasion")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "homeInvasion")}
                    lineCount={getRemainingLineCount(
                      faction,
                      "homeInvasion",
                      voiceLineMemory,
                    )}
                  />

                  <VoiceLineButton
                    faction={faction}
                    label={factionAudios[faction]?.special?.title ?? ""}
                    type="special"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "special")}
                    onStop={handleStopAudio}
                    isQueued={isVoiceLineQueued(faction, "special")}
                    lineCount={getRemainingLineCount(
                      faction,
                      "special",
                      voiceLineMemory,
                    )}
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
                      lineCount={getRemainingLineCount(
                        faction,
                        "special2",
                        voiceLineMemory,
                      )}
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
                    lineCount={getRemainingLineCount(
                      faction,
                      "jokes",
                      voiceLineMemory,
                    )}
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
        })}
      >
        <Stack gap="md">
          <SectionTitle title="Credits" />

          <Stack gap="md" style={{ maxWidth: 900 }} ml="lg">
            <Text size="xs" fw={700} c="dimmed" mt="lg">
              Script & Direction
            </Text>
            {/* Script & Direction */}
            <Group gap="xl" justify="space-between">
              <Text size="sm" fw={700} w={150}>
                Meme Philosopher
              </Text>
              <Text size="sm" c="dimmed" flex={1}>
                General project director (scriptwriting, fx, website, and
                funding).
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Text size="sm" fw={700} w={150}>
                Cacotopos
              </Text>
              <Text size="sm" c="dimmed" flex={1}>
                Scripts for Mentak Coalition, Nekro Virus, and Ghosts of Creuss
                and lots of feedback.
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Text size="sm" fw={700} w={150}>
                Mcstevo
              </Text>
              <Text size="sm" c="dimmed" flex={1}>
                "Chief Critic" (allegedly)
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Text size="sm" fw={700} w={150}>
                Absol225
              </Text>
              <Text size="sm" c="dimmed" flex={1}>
                Lore accuracy and script feedback.
              </Text>
            </Group>

            {/* Audio Editing Section */}
            <Text size="xs" fw={700} c="dimmed" mt="lg">
              Audio FX By
            </Text>
            <Group gap="xl" justify="space-between">
              <Text size="sm" fw={700} w={150}>
                Xane225
              </Text>
              <Text size="sm" c="dimmed" flex={1}>
                Emirates of Hacan, L1Z1X Mindnet, Empyrean, Nomad, Embers of
                Muaat, Mahact Gene-Sorcerors
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                fw={700}
                c="blue"
                href="https://www.martinpazosaudio.com/"
                target="_blank"
                w={150}
              >
                Martin Pazos
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Ghosts of Creuss, Sardakk N'orr, Arborec, Argent Flight, Naalu
                Collective, Naaz-Rhoka Alliance, Nekro Virus, Vuil'Raith Cabal,
                Barony of Letnev, Clan of Saar, Universities of Jol-Nar,
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Text size="sm" fw={700} w={150}>
                Meme Philosopher
              </Text>
              <Text size="sm" c="dimmed" flex={1}>
                Yin Brotherhood, Yssaril, Nomad, Federation of Sol, Mentak
                Coalition
              </Text>
            </Group>

            {/* Voice Acting Section */}
            <Text size="xs" fw={700} c="dimmed" mt="lg">
              Voice performances by
            </Text>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                c="blue"
                fw={700}
                w={150}
                href="https://www.jennasharpe.com/"
                target="_blank"
              >
                Jenna Sharpe
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Mentak Coalition, Argent Flight, Naalu Collective, Ghosts of
                Creuss
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                c="blue"
                fw={700}
                w={150}
                href="https://jaspatrick.com/"
                target="_blank"
              >
                Jas Patrick
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Clan of Saar, Xxcha Kingdom, Yin Brotherhood, Barony of Letnev,
                Yssaril, Naaz-Rhoka Alliance (Dart), Federation of Sol (male)
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                c="blue"
                fw={700}
                w={150}
                href="https://soundcloud.com/depthpersuasion"
                target="_blank"
              >
                Daniel Pierce
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Arborec, Vuil'Raith Cabal, Emirates of Hacan, Nomad, Sardakk
                N'orr
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                c="blue"
                fw={700}
                w={150}
                href="https://www.bryanjolson.com/"
                target="_blank"
              >
                Bryan Olson
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Embers of Muaat, Empyrean, L1Z1X, Mahact Gene-Sorcerors, Nekro
                Virus
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                c="blue"
                fw={700}
                w={150}
                href="https://www.jackdoesvoices.com/"
                target="_blank"
              >
                Jack Dundon
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Titans of Ul, Universities of Jol-Nar, Naaz-Rhoka Alliance (Tai)
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                c="blue"
                fw={700}
                w={150}
                href="https://www.elizabethsaydahvo.com/"
                target="_blank"
              >
                Elizabeth Sadyah
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Winnu
              </Text>
            </Group>
            <Group gap="xl" justify="space-between">
              <Anchor
                size="sm"
                c="blue"
                fw={700}
                w={150}
                href="https://www.ginaleighsmith.com/"
                target="_blank"
              >
                Gina Leigh Smith
              </Anchor>
              <Text size="sm" c="dimmed" flex={1}>
                Federation of Sol (female)
              </Text>
            </Group>
          </Stack>
        </Stack>
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

                      // Analytics: Track pause action
                      trackButtonClick({
                        buttonType: "pause_audio",
                        context: "footer_player",
                        sessionId: sessionId || undefined,
                      });
                    } else {
                      voiceLineRef.current?.play();
                      setIsVoiceLinePlaying(true);

                      // Analytics: Track resume action
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
                      // Analytics: Track skip action
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

                    // Analytics: Track seek action
                    trackButtonClick({
                      buttonType: "audio_seek",
                      context: "footer_player",
                      sessionId: sessionId || undefined,
                    });
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
              onRemove={(id) => {
                removeFromQueue(id);
                // Analytics: Track queue removal
                trackButtonClick({
                  buttonType: "remove_from_queue",
                  context: "queue_popup",
                  sessionId: sessionId || undefined,
                });
              }}
              onClear={() => {
                clearQueue();
                // Analytics: Track queue clear
                trackButtonClick({
                  buttonType: "clear_queue",
                  context: "queue_popup",
                  sessionId: sessionId || undefined,
                });
              }}
            />

            <Group gap="xs">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => {
                  if (volume > 0) {
                    setVolume(0);
                    voiceLineRef.current?.volume(0);

                    // Analytics: Track mute action
                    trackButtonClick({
                      buttonType: "mute_audio",
                      context: "footer_player",
                      sessionId: sessionId || undefined,
                    });
                  } else {
                    setVolume(0.5);
                    voiceLineRef.current?.volume(0.5);

                    // Analytics: Track unmute action
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

                  // Analytics: Track volume change (debounced to avoid spam)
                  if (newVolume % 0.1 === 0) {
                    trackButtonClick({
                      buttonType: "volume_change",
                      context: "footer_player",
                      sessionId: sessionId || undefined,
                    });
                  }
                }}
              />
            </Group>
          </Group>
        </Container>
      </Box>

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
  return json({});
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await createSession();
  return redirect(`/voices?session=${session.id}`);
}
