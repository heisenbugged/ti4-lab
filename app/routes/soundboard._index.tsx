import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import {
  Text,
  Container,
  Button,
  Table,
  Group,
  Loader,
  Slider,
  Stack,
} from "@mantine/core";
import { FactionId } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factions } from "~/data/factionData";

type Track = {
  src: string;
  title: string;
  artist: string;
  duration?: number;
  startTime?: number; // in milliseconds
};

const solDefenseTrack: Track = {
  src: "/sol.mp3",
  title: "Sol Defense",
  artist: "Raaagh",
};

const hacanWarTrack: Track = {
  src: "/hacan.mp3",
  title: "Hacan Invasion War",
  artist: "Raaagh",
};

const spotifyToken = "ENTER_HERE";
const factionIds: FactionId[] = ["sol", "hacan", "xxcha", "nomad"];
const factionAudios: Record<FactionId, Record<string, string>> = {
  sol: {
    homeDefense: "/sol.mp3",
  },
  hacan: {
    homeDefense: "/hacan.mp3",
  },
};

export default function Audio() {
  // const lastKnownPositionRef = useRef<{
  //   track: Track;
  //   position: number;
  // } | null>(null);

  const voiceLineRef = useRef<Howl | null>(null);
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [volume, setVolume] = useState(1); // Add volume state

  const stopAudio = () => {
    voiceLineRef.current?.stop();
    setLoadingAudio(null);
  };

  const playHomeDefense = (factionId: FactionId) => {
    voiceLineRef.current?.stop();
    setLoadingAudio(`${factionId}-defense`);

    const sound = new Howl({
      src: [factionAudios[factionId]!!.homeDefense],
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
    sound.play();
  };

  // const startSpotifyPlayback = async () => {
  //   try {
  //     const currentPlayback = await spotifyApi.getCurrentPlayback(spotifyToken);
  //     if (currentPlayback) {
  //       console.log("currentPlayback", currentPlayback);
  //       lastKnownPositionRef.current = currentPlayback;
  //     }
  //     await spotifyApi.startPlayback(
  //       spotifyToken,
  //       "spotify:track:61Ps2sXXwiYCcyAynt81JI",
  //       82000,
  //     );
  //   } catch (error) {
  //     console.error("Error controlling Spotify playback:", error);
  //   }
  // };

  // const goBackToLastKnownPosition = async () => {
  //   solDefenseSoundRef.current?.stop();

  //   await spotifyApi.resumePlaybackAtPosition(
  //     spotifyToken,
  //     "spotify:playlist:6O6izIEToh3JI4sAtHQn6J",
  //     lastKnownPositionRef.current.track.uri,
  //     lastKnownPositionRef.current.position,
  //   );
  // };

  return (
    <Container py="xl">
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
                  <Button
                    variant="light"
                    color="green"
                    size="compact-md"
                    disabled={factionAudios[faction]?.battleLine === undefined}
                  >
                    Battle Line
                  </Button>
                  <Button
                    variant="light"
                    color="blue"
                    size="compact-md"
                    onClick={() => {
                      if (loadingAudio === `${faction}-defense`) {
                        stopAudio();
                      } else {
                        playHomeDefense(faction);
                      }
                    }}
                    w="140px"
                    disabled={factionAudios[faction]?.homeDefense === undefined}
                  >
                    {loadingAudio === `${faction}-defense` ? (
                      <Loader size="xs" type="bars" color="blue" />
                    ) : (
                      "Home Defense"
                    )}
                  </Button>
                  <Button
                    variant="light"
                    color="red"
                    size="compact-md"
                    disabled={
                      factionAudios[faction]?.homeInvasion === undefined
                    }
                  >
                    Home Invasion
                  </Button>

                  <Button
                    variant="light"
                    color="yellow"
                    size="compact-md"
                    disabled={factionAudios[faction]?.joke === undefined}
                  >
                    Joke
                  </Button>
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

const spotifyApi = {
  async getCurrentPlayback(token: string) {
    try {
      const response = await fetch("https://api.spotify.com/v1/me/player", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return {
        track: data.item,
        position: data.progress_ms,
        isPlaying: data.is_playing,
      };
    } catch (error) {
      console.error("Error getting Spotify playback state:", error);
      return null;
    }
  },

  async startPlayback(token: string, trackUri: string, positionMs: number) {
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uris: [trackUri],
          position_ms: positionMs,
        }),
      });
    } catch (error) {
      console.error("Error controlling Spotify playback:", error);
    }
  },

  async resumePlaybackAtPosition(
    token: string,
    contextUri: string,
    trackUri: string,
    positionMs: number,
  ) {
    try {
      await fetch("https://api.spotify.com/v1/me/player/play", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          context_uri: contextUri,
          offset: {
            uri: trackUri,
          },
          position_ms: positionMs,
        }),
      });
    } catch (error) {
      console.error("Error resuming Spotify playback:", error);
    }
  },
};
