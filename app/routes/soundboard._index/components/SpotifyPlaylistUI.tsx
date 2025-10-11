import { Group, TextInput, Button } from "@mantine/core";

interface SpotifyPlaylistUIProps {
  playlistId: string | undefined;
  setPlaylistId: (id: string) => void;
  isWarMode: boolean;
  endWar: () => void;
}

function extractPlaylistId(input: string) {
  const match = input.match(/playlist[/:]([a-zA-Z0-9]{22})/);
  return match ? match[1] : input;
}

export const SpotifyPlaylistUI = ({
  playlistId,
  setPlaylistId,
  isWarMode,
  endWar,
}: SpotifyPlaylistUIProps) => {
  return (
    <Group align="end" style={{ flex: 1 }}>
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
      <Button
        size="xl"
        color="red"
        variant="filled"
        onClick={endWar}
        disabled={!isWarMode}
      >
        End War
      </Button>
    </Group>
  );
};

export type { SpotifyPlaylistUIProps };
