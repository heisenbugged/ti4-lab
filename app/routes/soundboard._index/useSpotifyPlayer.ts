import { useRef } from "react";
import { spotifyApi } from "~/vendors/spotifyApi";

type Track = {
  src: string;
  title: string;
  artist: string;
  duration?: number;
  startTime?: number;
  uri: string;
};

export function useSpotifyPlayer(
  accessToken: string | null,
  playlistId: string | null,
) {
  const lastKnownPositionRef = useRef<{
    track: Track;
    position: number;
    context?: {
      uri: string;
    };
  } | null>(null);

  const saveCurrentPosition = async () => {
    if (!accessToken) return;
    const currentPlayback = await spotifyApi.getCurrentPlayback(accessToken);
    if (currentPlayback) lastKnownPositionRef.current = currentPlayback;
  };

  const startBattleAnthem = async (
    battleAnthemUri: string,
    delay: number = 0,
  ) => {
    if (!accessToken) return;
    await spotifyApi.startPlayback(accessToken, battleAnthemUri, delay);
  };

  const restoreLastPosition = async () => {
    if (!accessToken || !playlistId) return;

    if (
      lastKnownPositionRef.current &&
      lastKnownPositionRef.current.context?.uri ===
        `spotify:playlist:${playlistId}`
    ) {
      await spotifyApi.resumePlaybackAtPosition(
        accessToken,
        `spotify:playlist:${playlistId}`,
        lastKnownPositionRef.current.track.uri,
        lastKnownPositionRef.current.position,
      );
    } else {
      await spotifyApi.startPlaylist(
        accessToken,
        `spotify:playlist:${playlistId}`,
      );
    }
  };

  return {
    saveCurrentPosition,
    startBattleAnthem,
    restoreLastPosition,
  };
}
