import { Container, Group, Text, Stack, Button } from "@mantine/core";
import { useParams } from "@remix-run/react";
import { useEffect, useState } from "react";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factionAudios, LineType } from "~/data/factionAudios";
import { factions } from "~/data/factionData";
import { useSocketConnection } from "~/useSocketConnection";
import { VoiceLineButton } from "../soundboard._index/components/VoiceLineButton";
import { FactionId } from "~/types";
import { SelectFaction } from "./components/SelectFaction";
import { IconRefresh } from "@tabler/icons-react";

export const factionIds: FactionId[] = ["sol", "hacan"];

export default function SoundboardProxy() {
  const { id: sessionId } = useParams();
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [factionIds, setFactionIds] = useState<FactionId[] | undefined>(
    undefined,
  );
  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: () => socket?.emit("joinSoundboardSession", sessionId),
    });
  const [faction, setFaction] = useState<FactionId | undefined>(undefined);

  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit("joinSoundboardSession", sessionId);
    socket.emit("requestSessionData", sessionId);

    socket.on("sendSessionData", (factionIds: FactionId[]) => {
      setFactionIds(factionIds);
    });
    socket.on("lineFinished", () => {
      setLoadingAudio(null);
    });
  }, [sessionId, socket]);

  const handlePlayAudio = (factionId: FactionId, type: LineType) => {
    if (!socket) return;
    setLoadingAudio(`${factionId}-${type}`);
    socket.emit("playLine", sessionId, factionId, type);
  };

  const handleStopAudio = () => {
    if (!socket) return;
    console.log("stopping audio");
    setLoadingAudio(null);
    socket.emit("stopLine", sessionId);
  };

  if (factionIds === undefined) return null;
  if (faction === undefined)
    return (
      <SelectFaction factionIds={factionIds} onFactionSelected={setFaction} />
    );

  return (
    <Container py="xl" maw={1400}>
      {socket && isDisconnected && (
        <Button
          variant="filled"
          size="md"
          radius="xl"
          leftSection={<IconRefresh size={20} />}
          style={{
            position: "fixed",
            top: "100px",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
          onClick={reconnect}
          loading={isReconnecting}
        >
          Refresh
        </Button>
      )}

      <Group gap="md" mb="md">
        <FactionIcon faction={faction} style={{ width: 32, height: 32 }} />
        <Text
          size="xl"
          ff="heading"
          style={{
            fontSize: 32,
          }}
        >
          {factions[faction].name}
        </Text>
      </Group>
      <Stack gap="md">
        <VoiceLineButton
          faction={faction}
          label="Battle Line"
          type="battleLines"
          loadingAudio={loadingAudio}
          onPlay={() => handlePlayAudio(faction, "battleLines")}
          onStop={handleStopAudio}
          size="xl"
          width="100%"
        />

        <Stack gap="xs">
          <VoiceLineButton
            faction={faction}
            label="Outnumbered"
            type="defenseOutnumbered"
            loadingAudio={loadingAudio}
            onPlay={() => handlePlayAudio(faction, "defenseOutnumbered")}
            onStop={handleStopAudio}
            size="md"
            width="auto"
          />
          <VoiceLineButton
            faction={faction}
            label="Superiority"
            type="offenseSuperior"
            loadingAudio={loadingAudio}
            onPlay={() => handlePlayAudio(faction, "offenseSuperior")}
            onStop={handleStopAudio}
            size="md"
            width="auto"
          />
        </Stack>

        <VoiceLineButton
          faction={faction}
          label="Home Defense (Epic Speech)"
          type="homeDefense"
          loadingAudio={loadingAudio}
          onPlay={() => handlePlayAudio(faction, "homeDefense")}
          onStop={handleStopAudio}
          size="xl"
          width="100%"
        />
        <VoiceLineButton
          faction={faction}
          label="Planet Invasion"
          type="homeInvasion"
          loadingAudio={loadingAudio}
          onPlay={() => handlePlayAudio(faction, "homeInvasion")}
          onStop={handleStopAudio}
          size="xl"
          width="100%"
        />

        <VoiceLineButton
          faction={faction}
          label={factionAudios[faction]?.special?.title ?? ""}
          type="special"
          loadingAudio={loadingAudio}
          onPlay={() => handlePlayAudio(faction, "special")}
          onStop={handleStopAudio}
          size="xl"
          width="100%"
        />
        <VoiceLineButton
          faction={faction}
          label="Joke"
          type="jokes"
          loadingAudio={loadingAudio}
          onPlay={() => handlePlayAudio(faction, "jokes")}
          onStop={handleStopAudio}
          size="xl"
          width="100%"
        />
      </Stack>
    </Container>
  );
}
