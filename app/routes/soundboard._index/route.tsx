import { Fragment, useEffect, useState } from "react";
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
  lighten,
  Modal,
  List,
  Alert,
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
import { createSession } from "~/drizzle/soundboardSession.server";
import { useSocketConnection } from "~/useSocketConnection";
import QRCode from "react-qr-code";
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
};

const factionData = Object.entries(factions)
  .filter((f) => f[1].set === "base" || f[1].set === "pok")
  .sort((a, b) => a[1].name.localeCompare(b[1].name))
  .map(([id, data]) => ({
    value: id,
    label: data.name,
  }));

// New component: Spotify Device Selector
interface SpotifyDeviceType {
  id: string;
  is_active: boolean;
  name: string;
  type: string;
}

interface SpotifyDeviceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  devices: SpotifyDeviceType[];
  isLoading: boolean;
  onSelectDevice: (deviceId: string) => void;
}

const SpotifyDeviceSelector = ({
  isOpen,
  onClose,
  devices,
  isLoading,
  onSelectDevice,
}: SpotifyDeviceSelectorProps) => {
  const getDeviceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "computer":
        return <IconDeviceDesktop size={20} />;
      case "smartphone":
        return <IconDeviceMobile size={20} />;
      case "speaker":
        return <IconDeviceSpeaker size={20} />;
      default:
        return <IconDeviceUnknown size={20} />;
    }
  };

  return (
    <Modal
      opened={isOpen}
      onClose={onClose}
      title="No Active Spotify Device"
      centered
      size="md"
    >
      <Alert color="blue" title="Playback requires an active device" mb="md">
        Spotify requires an active device to play music. Please select one of
        your available devices below or open the Spotify app on a device.
      </Alert>

      {isLoading ? (
        <Text>Loading available devices...</Text>
      ) : devices.length === 0 ? (
        <Stack>
          <Text>
            No Spotify devices found. Please open Spotify on any device.
          </Text>
          <Button
            onClick={() => window.open("https://open.spotify.com", "_blank")}
            fullWidth
          >
            Open Spotify Web Player
          </Button>
          <Group grow mt="md">
            <Button
              onClick={() => onSelectDevice("refresh")}
              variant="filled"
              leftSection={<IconRefresh size={16} />}
            >
              Refresh Devices
            </Button>
            <Button onClick={onClose} variant="outline">
              Cancel
            </Button>
          </Group>
        </Stack>
      ) : (
        <Stack>
          <Group justify="space-between" mb="xs">
            <Text fw={500} size="sm">
              Select a device:
            </Text>
            <Button
              variant="subtle"
              size="xs"
              onClick={() => onSelectDevice("refresh")}
              leftSection={<IconRefresh size={14} />}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Group>
          <List spacing="xs">
            {devices.map((device: SpotifyDeviceType) => (
              <List.Item key={device.id} icon={getDeviceIcon(device.type)}>
                <Button
                  variant={device.is_active ? "filled" : "outline"}
                  onClick={() => onSelectDevice(device.id)}
                  fullWidth
                  leftSection={getDeviceIcon(device.type)}
                >
                  {device.name} {device.is_active && "(active)"}
                </Button>
              </List.Item>
            ))}
          </List>
          <Button onClick={onClose} variant="outline" mt="md">
            Cancel
          </Button>
        </Stack>
      )}
    </Modal>
  );
};

export default function SoundboardMaster() {
  const { spotifyClientId, spotifyCallbackUrl } =
    useLoaderData<typeof loader>();
  const [playlistId, setPlaylistId] = useState<string | undefined>(undefined);
  const [factionSlots, setFactionSlots] = useState<FactionId[]>([
    "l1z1x",
    "sol",
    "hacan",
    "nomad",
    "xxcha",
    "empyrean",
  ]);
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
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: () => socket?.emit("joinSoundboardSession", sessionId),
    });

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
  } = useAudioPlayer({
    accessToken,
    playlistId: playlistId || "6O6izIEToh3JI4sAtHQn6J",
    lineFinished: () => {
      if (!socket) return;
      socket.emit("lineFinished", sessionId);
      setIsVoiceLinePlaying(false);
    },
  });

  useEffect(() => {
    if (accessToken) {
      getDevices();
    }
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
              <Text>https://tidraft.com/soundboard/{sessionId}</Text>
            </Stack>
            <Stack align="center" gap={4}>
              <QRCode
                value={`https://tidraft.com/soundboard/${sessionId}`}
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
              <SpotifyLoginButton
                accessToken={accessToken}
                spotifyCallbackUrl={spotifyCallbackUrl}
                spotifyClientId={spotifyClientId}
              />
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
          <Group align="end" style={{ flex: 2 }}>
            {accessToken && (
              <Stack mt={12} w={300} style={{ overflow: "hidden" }}>
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
                    href="/soundboard/logout"
                  >
                    Logout
                  </Button>
                </Group>
                <Paper radius="md" p="xs" withBorder>
                  {currentPlayback ? (
                    <Group gap="md" wrap="nowrap">
                      <Image
                        src={currentPlayback.albumImage.url}
                        alt="Album Art"
                        width={currentPlayback.albumImage.width}
                        height={currentPlayback.albumImage.height}
                        radius="sm"
                      />
                      <Stack gap={2} style={{ overflow: "hidden" }}>
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
                        <Group gap={0}>
                          {currentPlayback.artists.map((artist, index) => (
                            <Fragment key={artist.id}>
                              {index > 0 && (
                                <Text c="dimmed" size="sm">
                                  {" "}
                                  ,{" "}
                                </Text>
                              )}
                              <Text
                                className={styles.hoverableTextLink}
                                component="a"
                                href={artist.uri}
                                target="_blank"
                                c="dimmed"
                                size="sm"
                              >
                                {artist.name}
                              </Text>
                            </Fragment>
                          ))}
                        </Group>
                      </Stack>
                    </Group>
                  ) : (
                    <Group gap="md">
                      <Box w={64} h={64} bg="dark.6" />
                      <Stack gap={2}>
                        <Box w={120} h={16} bg="dark.6" />
                        <Box w={80} h={16} bg="dark.6" />
                      </Stack>
                    </Group>
                  )}
                </Paper>
              </Stack>
            )}

            {accessToken && (
              <TextInput
                size="xl"
                label="Playlist ID"
                placeholder="Enter Spotify playlist ID"
                description="Copy-paste the playlist ID from spotify that will be resumed when the war ends"
                value={playlistId || ""}
                onChange={(e) =>
                  setPlaylistId(extractPlaylistId(e.currentTarget.value))
                }
                style={{ flex: 1 }}
              />
            )}

            {/* end war button */}
            {accessToken && (
              <Button
                size="xl"
                color="red"
                variant="filled"
                onClick={endWar}
                disabled={!isWarMode}
              >
                End War
              </Button>
            )}

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
                onClick={() =>
                  (window.location.href = window.location.pathname)
                }
              >
                End Session
              </Button>
            )}
          </Group>
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
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Superiority"
                      type="offenseSuperior"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "offenseSuperior")}
                      onStop={handleStopAudio}
                    />
                  </Stack>

                  <VoiceLineButton
                    faction={faction}
                    label="Home Defense"
                    type="homeDefense"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeDefense")}
                    onStop={handleStopAudio}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Planet Invasion"
                    type="homeInvasion"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeInvasion")}
                    onStop={handleStopAudio}
                  />

                  <VoiceLineButton
                    faction={faction}
                    label={factionAudios[faction]?.special?.title ?? ""}
                    type="special"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "special")}
                    onStop={handleStopAudio}
                  />
                  {factionAudios[faction]?.special2 && (
                    <VoiceLineButton
                      faction={faction}
                      label={factionAudios[faction]?.special2?.title ?? ""}
                      type="special2"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "special2")}
                      onStop={handleStopAudio}
                    />
                  )}

                  <VoiceLineButton
                    faction={faction}
                    label="Joke"
                    type="jokes"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "jokes")}
                    onStop={handleStopAudio}
                  />
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

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
          <Group gap="md">
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
  const callbackUrl = process.env.SPOTIFY_OAUTH_REDIRECT_URI;

  if (!clientId || !callbackUrl) {
    throw new Error("Missing Spotify credentials in environment variables");
  }

  return json({
    spotifyClientId: clientId,
    spotifyCallbackUrl: callbackUrl,
  });
};

export async function action({ request }: ActionFunctionArgs) {
  const session = await createSession();
  return redirect(`/soundboard?session=${session.id}`);
}

export function extractPlaylistId(input: string) {
  const match = input.match(/playlist[/:]([a-zA-Z0-9]{22})/);
  return match ? match[1] : input;
}
