import { useCallback, useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import {
  Text,
  Container,
  Button,
  Table,
  Group,
  Slider,
  Stack,
} from "@mantine/core";
import { FactionId } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";
import { IconBrandSpotify } from "@tabler/icons-react";
import querystring from "querystring";
import { spotifyApi } from "~/vendors/spotifyApi";
import {
  factionAudios,
  getAllSrcs,
  getAudioSrc,
  LineType,
} from "~/data/factionAudios";
import { VoiceLineButton } from "./components/VoiceLineButton";
import { json } from "@remix-run/server-runtime";
import { useFetcher, useLoaderData } from "@remix-run/react";

type VoiceLineMemory = {
  [K in FactionId]?: {
    [type: string]: string[];
  };
};

type Track = {
  src: string;
  title: string;
  artist: string;
  duration?: number;
  startTime?: number; // in milliseconds
};

const factionIds: FactionId[] = [
  "sol",
  "hacan",
  "nomad",
  "xxcha",
  "muaat",
  "empyrean",
];

export default function Audio() {
  const [voiceLineMemory, setVoiceLineMemory] = useState<VoiceLineMemory>({});

  const { spotifyClientId, spotifyCallbackUrl } =
    useLoaderData<typeof loader>();
  const lastKnownPositionRef = useRef<{
    track: Track;
    position: number;
  } | null>(null);

  const voiceLineRef = useRef<Howl | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [volume, setVolume] = useState(1); // Add volume state
  const [isWarMode, setIsWarMode] = useState(false);

  const { accessToken, refreshSpotifyToken } = useSpotifyLogin();

  const startBattle = async (factionId: FactionId) => {
    if (!accessToken) return;
    if (!isWarMode) {
      const currentPlayback = await spotifyApi.getCurrentPlayback(accessToken);
      console.log("currentPlayback", currentPlayback);
      if (currentPlayback) {
        lastKnownPositionRef.current = currentPlayback;
      }

      const delay = factionAudios[factionId].battleAnthemDelay ?? 0;

      await spotifyApi.startPlayback(
        accessToken,
        factionAudios[factionId].battleAnthem,
        delay,
      );
      setIsWarMode(true);
    }
  };

  const endWar = async () => {
    if (!accessToken || !lastKnownPositionRef.current) return;
    await goBackToLastKnownPosition();
    setLoadingAudio(null);
    setIsWarMode(false);
  };

  const stopAudio = () => {
    voiceLineRef.current?.stop();
    setLoadingAudio(null);
  };

  const playAudio = (factionId: FactionId, type: LineType) => {
    voiceLineRef.current?.stop();
    setLoadingAudio(`${factionId}-${type}`);

    const shouldStartBattle = [
      "battleLines",
      "homeInvasion",
      "homeDefense",
      "defenseOutnumbered",
      "offenseSuperior",
    ].includes(type);

    // Start battle for specific voice lines
    if (shouldStartBattle) startBattle(factionId);

    // Get all possible lines for this faction/type
    const allPossibleLines = getAllSrcs(factionId, type);
    if (!allPossibleLines?.length) return;

    // Get previously played lines
    const playedLines = voiceLineMemory[factionId]?.[type] || [];

    // Filter out previously played lines
    const availableLines = allPossibleLines.filter(
      (line) => !playedLines.includes(line),
    );

    // If no new lines available, reset memory for this faction/type
    if (availableLines.length === 0) {
      setVoiceLineMemory((prev) => ({
        ...prev,
        [factionId]: {
          ...prev[factionId],
          [type]: [],
        },
      }));
      // Use all lines again
      const selectedLine =
        allPossibleLines[Math.floor(Math.random() * allPossibleLines.length)];
      updateMemory(factionId, type, selectedLine);
      playLine(selectedLine, shouldStartBattle);
    } else {
      // Select a random new line
      const selectedLine =
        availableLines[Math.floor(Math.random() * availableLines.length)];
      updateMemory(factionId, type, selectedLine);
      playLine(selectedLine, shouldStartBattle);
    }
  };

  const updateMemory = (factionId: FactionId, type: string, line: string) => {
    setVoiceLineMemory((prev) => ({
      ...prev,
      [factionId]: {
        ...prev[factionId],
        [type]: [...(prev[factionId]?.[type] || []), line],
      },
    }));
  };

  const playLine = (src: string, shouldStartBattle: boolean) => {
    const sound = new Howl({
      src: [src],
      html5: true,
      volume: volume,
      onend: () => {
        setLoadingAudio(null);
      },
      onloaderror: () => {
        setLoadingAudio(null);
        console.error("Error loading audio");
      },
    });

    voiceLineRef.current = sound;
    const timeout = shouldStartBattle ? 500 : 0;
    setTimeout(() => sound.play(), timeout);
  };

  const goBackToLastKnownPosition = async () => {
    if (!accessToken) return;

    voiceLineRef.current?.stop();

    if (
      lastKnownPositionRef.current &&
      lastKnownPositionRef.current.context?.uri ===
        "spotify:playlist:6O6izIEToh3JI4sAtHQn6J"
    ) {
      console.log("resuming playback");
      await spotifyApi.resumePlaybackAtPosition(
        accessToken,
        "spotify:playlist:6O6izIEToh3JI4sAtHQn6J",
        lastKnownPositionRef.current.track.uri,
        lastKnownPositionRef.current.position,
      );
    } else {
      console.log("no last known position");
      // If no last known position, start playlist from beginning
      await spotifyApi.startPlaylist(
        accessToken,
        "spotify:playlist:6O6izIEToh3JI4sAtHQn6J",
      );
    }
  };

  const spotifyAuthParams = {
    response_type: "code",
    client_id: spotifyClientId,
    scope: [
      "user-read-playback-state",
      "user-modify-playback-state",
      "user-read-currently-playing",
      "app-remote-control",
      "streaming",
      "playlist-read-private",
      "playlist-read-collaborative",
      "user-read-playback-position",
    ].join(" "),
    redirect_uri: spotifyCallbackUrl,
  };

  return (
    <Container py="xl" maw={1400}>
      {!accessToken ? (
        <Button
          leftSection={<IconBrandSpotify />}
          color="green"
          variant="filled"
          component="a"
          href={`https://accounts.spotify.com/authorize?${querystring.stringify(spotifyAuthParams)}`}
        >
          Login with Spotify
        </Button>
      ) : undefined}

      {accessToken && <Text>Logged in to spotify</Text>}

      {isWarMode && (
        <Button color="red" variant="filled" onClick={endWar} mb="xl">
          End War
        </Button>
      )}

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
                    onPlay={() => playAudio(faction, "battleLines")}
                    onStop={stopAudio}
                  />
                  <Stack gap="xs">
                    <VoiceLineButton
                      faction={faction}
                      label="Outnumbered"
                      type="defenseOutnumbered"
                      loadingAudio={loadingAudio}
                      onPlay={() => playAudio(faction, "defenseOutnumbered")}
                      onStop={stopAudio}
                    />
                    <VoiceLineButton
                      faction={faction}
                      label="Superiority"
                      type="offenseSuperior"
                      loadingAudio={loadingAudio}
                      onPlay={() => playAudio(faction, "offenseSuperior")}
                      onStop={stopAudio}
                    />
                  </Stack>

                  <VoiceLineButton
                    faction={faction}
                    label="Home Defense"
                    type="homeDefense"
                    loadingAudio={loadingAudio}
                    onPlay={() => playAudio(faction, "homeDefense")}
                    onStop={stopAudio}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Planet Invasion"
                    type="homeInvasion"
                    loadingAudio={loadingAudio}
                    onPlay={() => playAudio(faction, "homeInvasion")}
                    onStop={stopAudio}
                  />

                  <VoiceLineButton
                    faction={faction}
                    label={factionAudios[faction]?.special?.title ?? ""}
                    type="special"
                    loadingAudio={loadingAudio}
                    onPlay={() => playAudio(faction, "special")}
                    onStop={stopAudio}
                  />
                  <VoiceLineButton
                    faction={faction}
                    label="Joke"
                    type="jokes"
                    loadingAudio={loadingAudio}
                    onPlay={() => playAudio(faction, "jokes")}
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

interface SpotifyTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export function useSpotifyLogin() {
  const [tokens, setTokens] = useState<SpotifyTokens>({
    accessToken: null,
    refreshToken: null,
  });
  const refreshFetcher = useFetcher();

  // Function to handle refresh
  // Memoize the refresh function with useCallback
  const refreshSpotifyToken = useCallback(() => {
    refreshFetcher.submit(null, {
      method: "get",
      action: "/soundboard/refresh",
    });
  }, [refreshFetcher]);

  // Set up automatic refresh every 15 minutes
  useEffect(() => {
    const refreshInterval = setInterval(refreshSpotifyToken, 15 * 60 * 1000);
    return () => clearInterval(refreshInterval);
  }, [refreshSpotifyToken]);

  // handle refresh response
  useEffect(() => {
    if (refreshFetcher.data) {
      setTokens((prev) => ({
        ...prev,
        accessToken: refreshFetcher.data.accessToken,
      }));
    }
  }, [refreshFetcher.data]);

  // use effect is so it's done client side only
  useEffect(() => {
    const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) {
        return parts.pop()?.split(";").shift() || null;
      }
      return null;
    };

    setTokens({
      accessToken: getCookie("spotifyAccessToken"),
      refreshToken: getCookie("spotifyRefreshToken"),
    });
  }, []);

  return { ...tokens, refreshSpotifyToken };
}
