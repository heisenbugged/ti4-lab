import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import {
  Paper,
  Title,
  Text,
  Group,
  ActionIcon,
  Slider,
  Stack,
  Container,
  SimpleGrid,
  Button,
} from "@mantine/core";
import {
  IconPlayerPlay,
  IconPlayerPause,
  IconPlayerSkipBack,
  IconPlayerSkipForward,
  IconVolume,
} from "@tabler/icons-react";

type Track = {
  src: string;
  title: string;
  artist: string;
  duration?: number;
  startTime?: number; // in milliseconds
};

const solDefenseTrack: Track = {
  src: "sol.mp3",
  title: "Sol Defense",
  artist: "Raaagh",
};

const hacanWarTrack: Track = {
  src: "hacan.mp3",
  title: "Hacan Invasion War",
  artist: "Raaagh",
};

const PLAYLIST: Track[] = [
  {
    src: "peace2.mp3",
    title: "Ocean Waves",
    artist: "Nature Sounds",
    startTime: 10000,
  },
  {
    src: "peace1.mp3",
    title: "Peace of Mind",
    artist: "Ambient Dreams",
  },
];

const WAR_PLAYLIST: Track[] = [
  {
    src: "war.mp3",
    title: "War Track",
    artist: "Raaagh",
  },
  {
    src: "hacanwar2.mp3",
    title: "Hacan War",
    artist: "Raaagh",
    // startTime: 157200,
  },
];

const fadeOutTime = 2000;
const fadeInTime = 5000;
export default function Audio() {
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const [currentTrack, setCurrentTrack] = useState<Track | null>(PLAYLIST[0]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);

  const soundRef = useRef<Howl | null>(null);
  const progressInterval = useRef<NodeJS.Timeout>();

  const hacanWarSoundRef = useRef<Howl | null>(null);
  const solDefenseSoundRef = useRef<Howl | null>(null);

  const createHowl = (
    track: Track,
    autoplay = false,
    volume = 1,
    playNextTrack = true,
  ) => {
    return new Howl({
      src: [track.src],
      html5: true,
      autoplay,
      volume,
      onload: function () {
        setDuration(this.duration());
      },
      onend: function () {
        if (playNextTrack) {
          playNextTrack();
        }
      },
    });
  };

  const playTrack = (track: Track, newVolume = volume) => {
    // Fade out current track
    if (soundRef.current) {
      const oldSound = soundRef.current;
      oldSound.fade(oldSound.volume(), 0, fadeOutTime);
      oldSound.on("fade", () => {
        oldSound.unload();
      });
    }

    // Create and fade in the new track
    const newSound = createHowl(track, true, 0);

    // Seek to start time immediately after creation if specified
    if (track.startTime) {
      newSound.seek(track.startTime / 1000);
    }
    // delay the fade in to avoid a click
    setVolume(newVolume);
    setTimeout(() => {
      newSound.fade(0, newVolume, fadeInTime);
    }, 500);
    soundRef.current = newSound;

    // Update state
    setPlaying(true);
    setCurrentTrack(track);
  };

  const playTrackByIndex = (index: number) => {
    playTrack(PLAYLIST[index]);
    setCurrentTrack(PLAYLIST[index]);
    setCurrentTrackIndex(index);
  };

  const playNextTrack = () => {
    const nextIndex = (currentTrackIndex + 1) % PLAYLIST.length;
    playTrackByIndex(nextIndex);
  };

  useEffect(() => {
    soundRef.current = createHowl(PLAYLIST[0], true);
    solDefenseSoundRef.current = createHowl(solDefenseTrack, false, 1, false);
    hacanWarSoundRef.current = createHowl(hacanWarTrack, false, 1, false);
    progressInterval.current = setInterval(() => {
      setProgress(soundRef.current?.seek() || 0);
    }, 100);

    return () => {
      soundRef.current?.unload();
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, []);

  const togglePlay = () => {
    if (!soundRef.current) return;
    if (playing) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (!soundRef.current) return;
    soundRef.current.volume(newVolume);
  };

  const handleProgressChange = (newProgress: number) => {
    setProgress(newProgress);
    if (!soundRef.current) return;
    soundRef.current.seek(newProgress);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Container size="sm" py="xl">
      <Paper shadow="sm" p="md" withBorder>
        <Stack gap="md">
          <div>
            <Title order={4}>{currentTrack?.title}</Title>
            <Text c="dimmed" size="sm">
              {currentTrack?.artist}
            </Text>
          </div>

          <Group justify="center" gap="xs">
            <ActionIcon
              variant="light"
              onClick={() => {
                /* Previous track logic */
              }}
              size="lg"
            >
              <IconPlayerSkipBack size={20} />
            </ActionIcon>

            <ActionIcon
              variant="filled"
              onClick={togglePlay}
              size="lg"
              color="blue"
            >
              {playing ? (
                <IconPlayerPause size={20} />
              ) : (
                <IconPlayerPlay size={20} />
              )}
            </ActionIcon>

            <ActionIcon
              variant="light"
              onClick={() => {
                /* Next track logic */
              }}
              size="lg"
            >
              <IconPlayerSkipForward size={20} />
            </ActionIcon>
          </Group>

          <div>
            <Slider
              value={progress}
              onChange={handleProgressChange}
              max={duration}
              min={0}
              label={formatTime(progress)}
              size="sm"
              mb="xs"
            />
            <Group justify="space-between" gap="xs">
              <Text size="sm">{formatTime(progress)}</Text>
              <Text size="sm">{formatTime(duration)}</Text>
            </Group>
          </div>

          <Group justify="space-between" gap="xs">
            <ActionIcon variant="subtle" size="sm">
              <IconVolume size={16} />
            </ActionIcon>
            <Slider
              value={volume}
              onChange={handleVolumeChange}
              max={1}
              min={0}
              step={0.01}
              size="sm"
              style={{ flex: 1 }}
            />
          </Group>
        </Stack>
      </Paper>
      {/* Playlist sidebar */}
      <SimpleGrid cols={2}>
        <Paper shadow="sm" p="md" withBorder style={{ width: 300 }}>
          <Title order={4} mb="md">
            Playlist
          </Title>
          <Stack gap="xs">
            {PLAYLIST.map((track, index) => (
              <Paper
                key={track.src}
                p="xs"
                withBorder
                bg={currentTrackIndex === index ? "blue.1" : undefined}
                onClick={() => {
                  if (currentTrackIndex === index) return;
                  playTrackByIndex(index);
                }}
                style={{ cursor: "pointer" }}
              >
                <Text
                  size="sm"
                  fw={currentTrackIndex === index ? "bold" : "normal"}
                >
                  {track.title}
                </Text>
                <Text size="xs" c="dimmed">
                  {track.artist}
                </Text>
              </Paper>
            ))}
          </Stack>
        </Paper>

        <Paper shadow="sm" p="md" withBorder style={{ width: 300 }}>
          <Stack gap="xs">
            <Button
              color="red"
              variant="light"
              onClick={() => {
                playTrack(WAR_PLAYLIST[1], 0.4);
                setTimeout(() => {
                  hacanWarSoundRef.current?.play();
                }, 1000);
              }}
            >
              Play Hacan Home Defense
            </Button>
            <Button
              color="red"
              variant="light"
              onClick={() => {
                playTrack(WAR_PLAYLIST[0], 0.5);
                setTimeout(() => {
                  solDefenseSoundRef.current?.play();
                }, 1000);
              }}
            >
              Play Sol Home Defense
            </Button>

            <Text c="dimmed" size="sm">
              (some mispronunciations in audition)
            </Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      <Text mt="md" c="dimmed">
        Note: This is a very early, primitive prototype. To understand the
        experience, play one of the peace tracks for a bit. Then click one of
        the 'war' buttons and hear the war music and voice line come into sync.
      </Text>
      <Text mt="md" c="dimmed">
        The full version intends to have full playlist support. "Peace" playlist
        will just play, crossfading songs. When a 'war' song is chosen, it
        randomly samples a 'war' song and plays it. When you return to peace, it
        will return *right back* to where you were in the peace playlist, giving
        a sense of continuity.
      </Text>
      <Text mt="md" c="dimmed">
        The goal is to provide 4-6 voice lines per faction, for different
        scenarios. When choosing war, you can simply put the war soundtrack on.
        Or specify basic parameters (who is invading whom? are they outnumbered)
        with an easy to use interface which would then play the appropriate
        voice line.
      </Text>
      <Text mt="md" c="dimmed">
        NOTE: The two tracks here are just for demo purposes. They *are*
        copyrighted (will of ori + game of thrones). So please don't abuse that.
      </Text>
    </Container>
  );
}
