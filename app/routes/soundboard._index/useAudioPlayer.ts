import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import { factionAudios, getAllSrcs, LineType } from "~/data/factionAudios";
import { FactionId } from "~/types";
import { useSpotifyLogin } from "./useSpotifyLogin";
import { useSpotifyPlayer } from "./useSpotifyPlayer";

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
  const { saveCurrentPosition, startBattleAnthem, restoreLastPosition } =
    useSpotifyPlayer(accessToken, playlistId);

  const [voiceLineMemory, setVoiceLineMemory] = useState<VoiceLineMemory>({});
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [volume, setVolume] = useState(1);
  const voiceLineRef = useRef<Howl | null>(null);
  const [isWarMode, setIsWarMode] = useState(false);
  const isWarModeRef = useRef(isWarMode);
  useEffect(() => {
    isWarModeRef.current = isWarMode;
  }, [isWarMode]);

  const stopAudio = () => {
    voiceLineRef.current?.stop();
    setLoadingAudio(null);
  };

  const startBattle = async (factionId: FactionId) => {
    if (!accessToken) return;
    if (!isWarModeRef.current) {
      await saveCurrentPosition();
      const delay = factionAudios[factionId].battleAnthemDelay ?? 0;
      await startBattleAnthem(factionAudios[factionId].battleAnthem, delay);
      setIsWarMode(true);
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
        lineFinished();
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

  return {
    loadingAudio,
    volume,
    setVolume,
    playAudio,
    stopAudio,
    isWarMode,
    endWar,
    voiceLineRef,
  };
}
