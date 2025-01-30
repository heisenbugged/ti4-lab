import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import {
  Text,
  Container,
  Button,
  Table,
  Group,
  Slider,
  Stack,
  TextInput,
  Box,
} from "@mantine/core";
import { Draft, FactionId } from "~/types";
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
import { IconRefresh } from "@tabler/icons-react";

export const factionIds: FactionId[] = [
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
  useEffect(() => {
    if (!playlistId) {
      const stored = localStorage.getItem("spotifyPlaylistId");
      setPlaylistId(stored || "6O6izIEToh3JI4sAtHQn6J");
    }

    if (playlistId) {
      localStorage.setItem("spotifyPlaylistId", playlistId);
    }
  }, [playlistId]);

  const [volume, setVolume] = useState(1);
  const { accessToken } = useSpotifyLogin();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session");

  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: () => socket?.emit("joinSoundboardSession", sessionId),
    });
  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit("joinSoundboardSession", sessionId);
    socket.on("requestSessionData", () =>
      socket.emit("sendSessionData", sessionId, factionIds),
    );
    socket.on("playLine", (factionId, lineType) =>
      playAudio(factionId, lineType),
    );
    socket.on("stopLine", () => stopAudio());
  }, [sessionId, socket]);

  const {
    playAudio,
    stopAudio,
    loadingAudio,
    isWarMode,
    endWar,
    voiceLineRef,
  } = useAudioPlayer({
    accessToken,
    playlistId: playlistId || "6O6izIEToh3JI4sAtHQn6J",
    lineFinished: () => {
      if (!socket) return;
      socket.emit("lineFinished", sessionId);
    },
  });

  const handlePlayAudio = (factionId: FactionId, type: LineType) => {
    if (!socket) return;
    playAudio(factionId, type);
  };

  return (
    <Container py="xl" maw={1400}>
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

      <SpotifyLoginButton
        accessToken={accessToken}
        spotifyCallbackUrl={spotifyCallbackUrl}
        spotifyClientId={spotifyClientId}
      />
      {accessToken && <Text>Logged in to spotify</Text>}

      <Stack mb="xl" gap="md" mt="lg">
        {sessionId && (
          <Group gap="lg" justify="flex-end">
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

        {/* Spotify Controls */}
        <Group grow align="end">
          <Group align="end" style={{ flex: 2 }}>
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
            {/* end war button */}
            <Button
              size="xl"
              color="red"
              variant="filled"
              onClick={endWar}
              disabled={!isWarMode}
            >
              End War
            </Button>

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
          {factionIds.map((faction) => (
            <Table.Tr key={faction}>
              <Table.Td>
                <Group gap="xs">
                  <FactionIcon
                    faction={faction}
                    style={{ width: 32, height: 32 }}
                  />
                  <Text>{factions[faction].name}</Text>
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
                    onStop={stopAudio}
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
                      onStop={stopAudio}
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Superiority"
                      type="offenseSuperior"
                      loadingAudio={loadingAudio}
                      onPlay={() => handlePlayAudio(faction, "offenseSuperior")}
                      onStop={stopAudio}
                    />
                  </Stack>

                  <VoiceLineButton
                    faction={faction}
                    label="Home Defense"
                    type="homeDefense"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeDefense")}
                    onStop={stopAudio}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Planet Invasion"
                    type="homeInvasion"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "homeInvasion")}
                    onStop={stopAudio}
                  />

                  <VoiceLineButton
                    faction={faction}
                    label={factionAudios[faction]?.special?.title ?? ""}
                    type="special"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "special")}
                    onStop={stopAudio}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Joke"
                    type="jokes"
                    loadingAudio={loadingAudio}
                    onPlay={() => handlePlayAudio(faction, "jokes")}
                    onStop={stopAudio}
                  />
                </Group>
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>

      <Stack mt="xl" px="lg" w="100%" gap={2}>
        <Slider
          w="100%"
          min={0}
          max={1}
          step={0.01}
          value={volume}
          onChange={(newVolume) => {
            setVolume(newVolume);

            voiceLineRef.current?.volume(newVolume);
          }}
        />
        <Text c="dimmed" size="sm">
          Volume
        </Text>
      </Stack>
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
