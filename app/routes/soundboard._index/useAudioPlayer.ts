import { Howl } from "howler";
import { useEffect, useRef, useState } from "react";
import {
  announcerAudios,
  factionAudios,
  getAllSrcs,
  getRandomAudioEntry,
  LineType,
  type AudioEntry,
  battleAnthemPool,
} from "~/data/factionAudios";
import { FactionId } from "~/types";
import { useSpotifyPlayer } from "./useSpotifyPlayer";

type VoiceLineMemory = {
  [K in FactionId | "announcer"]?: {
    [type: string]: string[];
  };
};

// Define the type for a queued voice line
type QueuedVoiceLine = {
  factionId: FactionId | "announcer";
  type: LineType;
  id: string; // Unique identifier for the queue item
};

type Props = {
  accessToken: string | null;
  playlistId: string | null;
  lineFinished: () => void;
};

// Auto-queue timeframe in milliseconds (2 second)
const AUTO_QUEUE_TIMEFRAME = 2000;

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
    isLoadingDevices,
    noActiveDeviceError,
    setNoActiveDeviceError,
    playbackRestrictions,
  } = useSpotifyPlayer(accessToken, playlistId);

  const [voiceLineMemory, setVoiceLineMemory] = useState<VoiceLineMemory>({});
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<AudioEntry | null>(null);
  const [volume, setVolume] = useState(1);
  const voiceLineRef = useRef<Howl | null>(null);
  const [isWarMode, setIsWarMode] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);
  const isWarModeRef = useRef(isWarMode);

  // Track the last time a voice line was triggered
  const lastVoiceLineTriggerTime = useRef<number>(0);

  // Queue state
  const [voiceLineQueue, setVoiceLineQueue] = useState<QueuedVoiceLine[]>([]);
  // Keep a ref to the queue to access current values in callbacks
  const voiceLineQueueRef = useRef<QueuedVoiceLine[]>([]);

  // Update the ref whenever the queue state changes
  useEffect(() => {
    voiceLineQueueRef.current = voiceLineQueue;
  }, [voiceLineQueue]);

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

  // Remove the effect for checking queue items when audio stops playing

  const stopAudio = () => {
    voiceLineRef.current?.stop();

    setLoadingAudio(null);
    setCurrentAudio(null);
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

        // Get battle anthem details (fallback to curated random if missing)
        const configuredAnthem = factionAudios[factionId].battleAnthem;
        const hasConfigured = Boolean(
          configuredAnthem && configuredAnthem.trim().length > 0,
        );

        let selectedUri: string;
        let selectedDelay: number;

        if (hasConfigured) {
          selectedUri = configuredAnthem as string;
          selectedDelay = factionAudios[factionId].battleAnthemDelay ?? 0;
        } else {
          // Choose from curated pool (excludes Saar and Naaz-Rokha) and respect per-anthem delay
          const pool = battleAnthemPool;
          if (!pool.length) return; // No available anthem
          const randomEntry = pool[Math.floor(Math.random() * pool.length)];
          selectedUri = randomEntry.uri;
          selectedDelay = randomEntry.delay ?? 0;
        }

        // This will check for active devices and show the device selector if needed
        await startBattleAnthem(selectedUri, selectedDelay);

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

  // Function to play the next item in the queue - this will now be called directly
  const playNextFromQueue = () => {
    // Use the ref to get the current queue state
    const currentQueue = voiceLineQueueRef.current;

    if (currentQueue.length === 0) return;
    const nextItem = currentQueue[0];

    // Update the queue state, removing the first item
    const newQueue = currentQueue.slice(1);
    voiceLineQueueRef.current = newQueue;
    setVoiceLineQueue(newQueue);

    // Play the next item
    playAudio(nextItem.factionId, nextItem.type, true);
  };

  // Function to add a voice line to the queue
  const addToQueue = (factionId: FactionId | "announcer", type: LineType) => {
    const queueItem: QueuedVoiceLine = {
      factionId,
      type,
      id: `${factionId}-${type}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    };

    // Update both the state and the ref
    const newQueue = [...voiceLineQueueRef.current, queueItem];
    voiceLineQueueRef.current = newQueue;
    setVoiceLineQueue(newQueue);

    // Update the last trigger time to reset the 2-second window
    // This ensures the timeout is from the last queued item, not the first
    lastVoiceLineTriggerTime.current = Date.now();

    // If nothing is currently playing, start playing from queue
    if (!loadingAudio && voiceLineQueueRef.current.length === 1) {
      playNextFromQueue();
    }

    return queueItem.id; // Return the ID so it can be referenced later
  };

  // Function to remove an item from the queue
  const removeFromQueue = (id: string) => {
    const newQueue = voiceLineQueueRef.current.filter((item) => item.id !== id);
    voiceLineQueueRef.current = newQueue;
    setVoiceLineQueue(newQueue);
  };

  // Function to clear the entire queue
  const clearQueue = () => {
    voiceLineQueueRef.current = [];
    setVoiceLineQueue([]);
  };

  const playAudio = (
    factionId: FactionId | "announcer",
    type: LineType,
    isFromQueue = false,
  ) => {
    const now = Date.now();
    const timeSinceLastTrigger = now - lastVoiceLineTriggerTime.current;

    // If we're already playing something and this was triggered within the auto-queue timeframe,
    // add it to the queue instead of playing immediately (unless it's already from the queue)
    if (
      !isFromQueue &&
      loadingAudio &&
      timeSinceLastTrigger < AUTO_QUEUE_TIMEFRAME
    ) {
      addToQueue(factionId, type);
      return;
    }

    // If the voice line is triggered outside the auto-queue timeframe and it's not from the queue,
    // clear any existing queue items
    if (
      !isFromQueue &&
      timeSinceLastTrigger >= AUTO_QUEUE_TIMEFRAME &&
      voiceLineQueueRef.current.length > 0
    ) {
      clearQueue();
    }

    // Update the last trigger time
    lastVoiceLineTriggerTime.current = now;

    voiceLineRef.current?.stop();
    setLoadingAudio(`${factionId}-${type}`);

    // Handle announcer types differently
    if (factionId === "announcer") {
      // Get all possible lines for this announcer type
      const allPossibleLines =
        announcerAudios[type as keyof typeof announcerAudios]?.map(
          (entry: any) => entry.url,
        ) || [];
      if (!allPossibleLines?.length) return;

      // Get previously played lines for announcer
      const playedLines = voiceLineMemory["announcer"]?.[type] || [];

      // Filter out previously played lines
      const availableLines = allPossibleLines.filter(
        (line: string) => !playedLines.includes(line),
      );

      const shouldResetMemory = availableLines.length === 0;

      // If no new lines available, reset memory and use all lines again
      // Otherwise, select from available lines
      const selectedEntry = shouldResetMemory
        ? getRandomAudioEntry("announcer" as any, type)
        : getRandomAudioEntry("announcer" as any, type, availableLines);
      if (!selectedEntry) return;

      // Determine what the new voice line list should be
      const existingLinesForType = voiceLineMemory["announcer"]?.[type] || [];
      let newVoiceLineList: string[];
      if (shouldResetMemory) {
        newVoiceLineList = [selectedEntry.url];
      } else {
        newVoiceLineList = [...existingLinesForType, selectedEntry.url];
      }

      setVoiceLineMemory((prev) => ({
        ...prev,
        ["announcer"]: {
          ...prev["announcer"],
          [type]: newVoiceLineList,
        },
      }));

      setCurrentAudio(selectedEntry);
      playLine(
        selectedEntry.url,
        false, // announcer never starts battle
        isFromQueue,
      );
      return;
    }

    const shouldStartBattle = [
      "battleLines",
      "homeInvasion",
      "homeDefense",
      "defenseOutnumbered",
      "offenseSuperior",
    ].includes(type);

    // Start battle for specific voice lines
    if (shouldStartBattle) startBattle(factionId as FactionId);

    // Get all possible lines for this faction/type
    const allPossibleLines = getAllSrcs(factionId as FactionId, type);
    if (!allPossibleLines?.length) return;

    const factionIdKey = factionId as FactionId;

    // Get previously played lines
    const playedLines = voiceLineMemory[factionIdKey]?.[type] || [];

    // Filter out previously played lines
    const availableLines = allPossibleLines.filter(
      (line) => !playedLines.includes(line),
    );

    const shouldResetMemory = availableLines.length === 0;

    // If no new lines available, reset memory and use all lines again
    // Otherwise, select from available lines
    const selectedEntry = shouldResetMemory
      ? getRandomAudioEntry(factionIdKey, type)
      : getRandomAudioEntry(factionIdKey, type, availableLines);
    if (!selectedEntry) return;

    // Determine what the new voice line list should be
    const existingLinesForType = voiceLineMemory[factionIdKey]?.[type] || [];
    let newVoiceLineList: string[];
    if (shouldResetMemory) {
      newVoiceLineList = [selectedEntry.url];
    } else {
      newVoiceLineList = [...existingLinesForType, selectedEntry.url];
    }

    setVoiceLineMemory((prev) => ({
      ...prev,
      [factionIdKey]: {
        ...prev[factionIdKey],
        [type]: newVoiceLineList,
      },
    }));

    setCurrentAudio(selectedEntry);
    playLine(selectedEntry.url, shouldStartBattle, isFromQueue);
  };

  const playLine = (
    src: string,
    shouldStartBattle: boolean,
    isFromQueue: boolean = false,
  ) => {
    console.log("playLine", src, shouldStartBattle, isFromQueue);

    // Play voice line directly
    const timeout = shouldStartBattle ? 500 : 0;
    setTimeout(() => playMainVoiceLine(), timeout);

    function playMainVoiceLine() {
      // Clean up previous voice line if it exists
      if (voiceLineRef.current) {
        voiceLineRef.current.stop();
      }

      const sound = new Howl({
        src: [src],
        html5: true,
        pool: 3,
        volume: volume,
        preload: true,
        onend: () => {
          setLoadingAudio(null);
          setCurrentAudio(null);
          setAudioProgress(0);
          if (progressIntervalRef.current) {
            window.clearInterval(progressIntervalRef.current);
            progressIntervalRef.current = null;
          }
          lineFinished();

          // Get the most current queue state from the ref
          const currentQueue = voiceLineQueueRef.current;

          // Check if there are more items in the queue
          if (currentQueue.length > 0) {
            // Call playNextFromQueue directly after a short delay
            setTimeout(playNextFromQueue, 100);
          }
        },
        onloaderror: () => {
          setLoadingAudio(null);
          setCurrentAudio(null);
          console.error("Error loading audio");

          // Get the most current queue state from the ref
          const currentQueue = voiceLineQueueRef.current;

          // If loading failed and we have more queue items, try the next item
          if (currentQueue.length > 0) {
            setTimeout(playNextFromQueue, 100);
          }
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
      sound.play();
    }
  };

  return {
    playAudio,
    stopAudio,
    endWar,
    loadingAudio,
    currentAudio,
    isWarMode,
    voiceLineRef,
    currentPlayback,
    startBattle,
    audioProgress,
    getDevices: getAndUpdateDevices,
    availableDevices,
    isLoadingDevices,
    noActiveDeviceError,
    setNoActiveDeviceError,
    transferToDevice,
    playbackRestrictions,
    // Queue-related functions
    removeFromQueue,
    clearQueue,
    voiceLineQueue,
    isPlayingQueue: voiceLineQueue.length > 0,
    // Voice line memory for tracking played lines
    voiceLineMemory,
  };
}
