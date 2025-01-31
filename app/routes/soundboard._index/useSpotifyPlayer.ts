import { useRef, useState } from "react";
import { spotifyApi, SpotifyPlaybackState } from "~/vendors/spotifyApi";

export function useSpotifyPlayer(
  accessToken: string | null,
  playlistId: string | null,
) {
  const [currentPlayback, setCurrentPlayback] =
    useState<SpotifyPlaybackState | null>(null);

  const getCurrentPlayback = async (save: boolean = true) => {
    if (!accessToken) return;
    const currentPlayback = await spotifyApi.getCurrentPlayback(accessToken);
    if (save) setCurrentPlayback(currentPlayback);
    return currentPlayback;
  };

  const lastKnownPositionRef = useRef<SpotifyPlaybackState | null>(null);
  const saveCurrentPosition = async () => {
    if (!accessToken) return;
    const currentPlayback = await getCurrentPlayback(false);
    if (currentPlayback) lastKnownPositionRef.current = currentPlayback;
  };

  const startBattleAnthem = async (
    battleAnthemUri: string,
    delay: number = 0,
  ) => {
    if (!accessToken) return;
    await spotifyApi.startPlayback(accessToken, battleAnthemUri, delay);

    await getCurrentPlayback();
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
      getCurrentPlayback();
    } else {
      const playlistPlay = await spotifyApi.startPlaylist(
        accessToken,
        `spotify:playlist:${playlistId}`,
      );
      getCurrentPlayback();
    }
  };

  return {
    saveCurrentPosition,
    startBattleAnthem,
    restoreLastPosition,
    currentPlayback,
  };
}
