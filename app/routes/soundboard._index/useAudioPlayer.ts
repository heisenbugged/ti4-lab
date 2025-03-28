import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { factionAudios, getAllSrcs, LineType } from "~/data/factionAudios";
import { FactionId } from "~/types";
import { useSpotifyLogin } from "./useSpotifyLogin";
import { useSpotifyPlayer, SpotifyDevice } from "./useSpotifyPlayer";

type VoiceLineMemory = {
  [K in FactionId]?: {
    [type: string]: string[];
  };
};

type Props = {
  accessToken: string | null;
  playlistId: string | null;
  lineFinished: () => void;
};

export function useAudioPlayer({
  accessToken,
  playlistId,
  lineFinished,
}: Props) {
  const {
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
  } = useSpotifyPlayer(accessToken, playlistId);

  const [voiceLineMemory, setVoiceLineMemory] = useState<VoiceLineMemory>({});
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const voiceLineRef = useRef<Howl | null>(null);
  const [isWarMode, setIsWarMode] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const isWarModeRef = useRef(isWarMode);

  useEffect(() => {
    isWarModeRef.current = isWarMode;
  }, [isWarMode]);

  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        window.clearInterval(progressIntervalRef.current);
      }
    };
  }, []);

  const stopAudio = () => {
    voiceLineRef.current?.stop();
    setLoadingAudio(null);
    setAudioProgress(0);
    if (progressIntervalRef.current) {
      window.clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  };

  const startBattle = async (factionId: FactionId) => {
    if (!accessToken) return;

    if (!isWarModeRef.current) {
      try {
        // Save current position first
        await saveCurrentPosition();

        // Get battle anthem details
        const delay = factionAudios[factionId].battleAnthemDelay ?? 0;
        const battleAnthemUri = factionAudios[factionId].battleAnthem;

        // This will check for active devices and show the device selector if needed
        await startBattleAnthem(battleAnthemUri, delay);

        // Only set war mode if we successfully started the battle anthem
        setIsWarMode(true);
      } catch (error) {
        console.error("Error starting battle mode:", error);
        // The error handling is done in startBattleAnthem
      }
    }
  };

  const endWar = async () => {
    if (!accessToken) return;
    await restoreLastPosition();
    stopAudio();
    setIsWarMode(false);
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
        setAudioProgress(0);
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
          progressIntervalRef.current = null;
        }
        lineFinished();
      },
      onloaderror: () => {
        setLoadingAudio(null);
        console.error("Error loading audio");
      },
      onplay: () => {
        if (progressIntervalRef.current) {
          window.clearInterval(progressIntervalRef.current);
        }

        progressIntervalRef.current = window.setInterval(() => {
          if (!sound.playing()) return;
          const progress = sound.seek() / sound.duration() || 0;
          setAudioProgress(progress);
        }, 5);
      },
    });

    voiceLineRef.current = sound;
    const timeout = shouldStartBattle ? 500 : 0;
    setTimeout(() => sound.play(), timeout);
  };

  return {
    loadingAudio,
    volume,
    isWarMode,
    voiceLineRef,
    currentPlayback,
    audioProgress,
    setVolume,
    playAudio,
    stopAudio,
    endWar,
    startBattle,
    getDevices: getAndUpdateDevices,
    transferToDevice,
    availableDevices,
    activeDevice,
    isLoadingDevices,
    noActiveDeviceError,
    setNoActiveDeviceError,
  };
}
