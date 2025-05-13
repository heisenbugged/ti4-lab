import { useRef, useState, useEffect } from "react";
import { spotifyApi, SpotifyPlaybackState } from "~/vendors/spotifyApi";

export type SpotifyDevice = {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string;
  volume_percent: number;
};

export type SpotifyRestrictions = boolean | null;

export function useSpotifyPlayer(
  accessToken: string | null,
  playlistId: string | null,
) {
  const [currentPlayback, setCurrentPlayback] =
    useState<SpotifyPlaybackState | null>(null);
  const [availableDevices, setAvailableDevices] = useState<SpotifyDevice[]>([]);
  const [activeDevice, setActiveDevice] = useState<SpotifyDevice | null>(null);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);
  const [noActiveDeviceError, setNoActiveDeviceError] = useState(false);

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

    try {
      // Check for active devices first
      const devices = await getAndUpdateDevices();
      const hasActiveDevice = devices.some((d: SpotifyDevice) => d.is_active);

      // If no active device, throw error to trigger the device selection flow
      if (!hasActiveDevice) {
        throw new Error("No active Spotify device available");
      }

      // If we have an active device, proceed with playback
      await spotifyApi.startPlayback(accessToken, battleAnthemUri, delay);
      await getCurrentPlayback();
    } catch (error) {
      console.error("Error starting battle anthem:", error);
      setNoActiveDeviceError(true);
      await getAndUpdateDevices();
    }
  };

  const restoreLastPosition = async () => {
    if (!accessToken || !playlistId) return;

    try {
      // Check for active devices first
      const devices = await getAndUpdateDevices();
      const hasActiveDevice = devices.some((d: SpotifyDevice) => d.is_active);

      // If no active device, throw error to trigger the device selection flow
      if (!hasActiveDevice) {
        throw new Error("No active Spotify device available");
      }

      // If we have an active device, proceed with playback
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
        setTimeout(() => {
          getCurrentPlayback();
        }, 500);
      } else {
        await spotifyApi.startPlaylist(
          accessToken,
          `spotify:playlist:${playlistId}`,
        );
        setTimeout(() => {
          getCurrentPlayback();
        }, 500);
      }
      setNoActiveDeviceError(false);
    } catch (error) {
      console.error("Error restoring last position:", error);
      setNoActiveDeviceError(true);
      await getAndUpdateDevices();
    }
  };

  const getAndUpdateDevices = async () => {
    if (!accessToken) return [];

    setIsLoadingDevices(true);
    try {
      const devices = await spotifyApi.getAvailableDevices(accessToken);
      setAvailableDevices(devices);

      const active = devices.find((d: SpotifyDevice) => d.is_active);
      setActiveDevice(active || null);

      // If no active device but devices exist, we need to show the selector
      if (!active && devices.length > 0) {
        setNoActiveDeviceError(true);
      } else if (active) {
        // If we found an active device, make sure error is cleared
        setNoActiveDeviceError(false);
      }

      return devices;
    } catch (error) {
      console.error("Error fetching devices:", error);
      return [];
    } finally {
      setIsLoadingDevices(false);
    }
  };

  const transferToDevice = async (deviceId: string) => {
    if (!accessToken) return false;

    try {
      const success = await spotifyApi.transferPlayback(accessToken, deviceId);

      if (success) {
        // After a successful transfer, wait briefly and refresh the device list
        // to confirm the device is now active
        setTimeout(async () => {
          await getAndUpdateDevices();
          // Also try to get current playback to update the UI
          await getCurrentPlayback();
        }, 500);

        setNoActiveDeviceError(false);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error transferring playback:", error);
      return false;
    }
  };

  useEffect(() => {
    if (accessToken) getCurrentPlayback();
  }, [accessToken]);

  return {
    saveCurrentPosition,
    startBattleAnthem,
    restoreLastPosition,
    currentPlayback,
    getAndUpdateDevices,
    transferToDevice,
    availableDevices,
    activeDevice,
    isLoadingDevices,
    noActiveDeviceError,
    setNoActiveDeviceError,
    playbackRestrictions: currentPlayback?.device?.is_restricted,
  };
}
