import { Button, Heading, Text } from "~/ui";
import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { factionAudios, LineType } from "~/data/factionAudios";
import { factions } from "~/data/factionData";
import { useSocketConnection } from "~/useSocketConnection";
import { VoiceLineButton } from "~/components/voices/VoiceLineButton";
import { FactionId } from "~/types";
import { SelectFaction } from "./-components/SelectFaction";
import { IconRefresh } from "@tabler/icons-react";
import styles from "./session.module.css";

export const Route = createFileRoute("/voices/$id")({
  component: SoundboardProxy,
});

function SoundboardProxy() {
  const { id: sessionId } = Route.useParams();
  const [loadingAudio, setLoadingAudio] = useState<string | null>(null);
  const [factionIds, setFactionIds] = useState<FactionId[] | undefined>(
    undefined,
  );
  const { socket, isDisconnected, isReconnecting, reconnect } =
    useSocketConnection({
      onConnect: (socket) => socket.emit("joinSoundboardSession", sessionId),
    });
  const [faction, setFaction] = useState<FactionId | undefined>(undefined);

  useEffect(() => {
    if (!socket || !sessionId) return;
    socket.emit("joinSoundboardSession", sessionId);
    socket.emit("requestSessionData", sessionId);

    const handleSessionData = (ids: FactionId[]) => setFactionIds(ids);
    const handleLineFinished = () => setLoadingAudio(null);
    socket.on("sendSessionData", handleSessionData);
    socket.on("lineFinished", handleLineFinished);
    return () => {
      socket.off("sendSessionData", handleSessionData);
      socket.off("lineFinished", handleLineFinished);
    };
  }, [sessionId, socket]);

  const handlePlayAudio = (factionId: FactionId, type: LineType) => {
    if (!socket) return;
    setLoadingAudio(`${factionId}-${type}`);
    socket.emit("playLine", sessionId, factionId, type);
  };

  const handleStopAudio = () => {
    if (!socket) return;

    setLoadingAudio(null);
    socket.emit("stopLine", sessionId);
  };

  if (factionIds === undefined) return null;
  if (faction === undefined)
    return (
      <SelectFaction factionIds={factionIds} onFactionSelected={setFaction} />
    );

  const line = (type: LineType) => ({
    faction,
    type,
    loadingAudio,
    onPlay: () => handlePlayAudio(faction, type),
    onStop: handleStopAudio,
    size: "lg" as const,
    width: "100%",
  });

  return (
    <div className={styles.page}>
      {socket && isDisconnected && (
        <div className={styles.reconnect}>
          <Button
            icon={<IconRefresh size={18} />}
            onClick={reconnect}
            loading={isReconnecting}
          >
            Refresh
          </Button>
        </div>
      )}

      <header className={styles.factionHead}>
        <FactionIcon faction={faction} style={{ width: 40, height: 40 }} />
        <Heading variant="title" as="h1" truncate>
          {factions[faction].name}
        </Heading>
      </header>

      <section className={styles.group}>
        <Text size="sm" tone="muted" weight={600}>
          Combat
        </Text>
        <VoiceLineButton
          label="Battle line"
          variant="primary"
          {...line("battleLines")}
        />
        <div className={styles.pair}>
          <VoiceLineButton
            label="Outnumbered"
            {...line("defenseOutnumbered")}
          />
          <VoiceLineButton label="Superiority" {...line("offenseSuperior")} />
        </div>
        <VoiceLineButton
          label="Home defense (epic speech)"
          variant="primary"
          {...line("homeDefense")}
        />
        <VoiceLineButton
          label="Planet invasion"
          variant="primary"
          {...line("homeInvasion")}
        />
      </section>

      <section className={styles.group}>
        <Text size="sm" tone="muted" weight={600}>
          Special
        </Text>
        <VoiceLineButton
          label={factionAudios[faction]?.special?.title ?? ""}
          {...line("special")}
        />
        {factionAudios[faction]?.special2 && (
          <VoiceLineButton
            label={factionAudios[faction]?.special2?.title ?? ""}
            {...line("special2")}
          />
        )}
        <VoiceLineButton label="Joke" {...line("jokes")} />
      </section>

      {(faction === "nomad" || faction === "vulraith" || faction === "hacan") &&
        factionAudios[faction]?.roleplayYes && (
          <section className={styles.group}>
            <Text size="sm" tone="muted" weight={600}>
              Roleplay lines
            </Text>
            <div className={styles.pair}>
              <VoiceLineButton label="Yes" {...line("roleplayYes")} />
              <VoiceLineButton label="No" {...line("roleplayNo")} />
              <VoiceLineButton label="I refuse" {...line("roleplayIRefuse")} />
              <VoiceLineButton
                label="Deal with it"
                {...line("roleplayDealWithIt")}
              />
              <VoiceLineButton
                label="Not enough"
                {...line("roleplayNotEnough")}
              />
              <VoiceLineButton label="Too much" {...line("roleplayTooMuch")} />
              <VoiceLineButton label="Sabotage" {...line("roleplaySabotage")} />
              <VoiceLineButton label="Fire!" {...line("roleplayFire")} />
            </div>
          </section>
        )}
    </div>
  );
}
