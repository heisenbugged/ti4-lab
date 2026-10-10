import { Button, TextInput } from "~/ui";
import styles from "./Spotify.module.css";

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
    <div className={styles.playlist}>
      <TextInput
        size="sm"
        label="Playlist ID"
        placeholder="Enter Spotify playlist ID"
        hint="Copy-paste the Spotify playlist ID that will resume when the war ends."
        value={playlistId || ""}
        onChange={(e) =>
          setPlaylistId(extractPlaylistId(e.currentTarget.value))
        }
      />
      <Button
        size="sm"
        variant="danger"
        onClick={endWar}
        disabled={!isWarMode}
        className={styles.endWar}
      >
        End war
      </Button>
    </div>
  );
};

export type { SpotifyPlaylistUIProps };
