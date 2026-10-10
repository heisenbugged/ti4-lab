import {
  IconShare,
  IconPlayerPlay,
  IconArrowBackUp,
  IconMicrophone2,
} from "@tabler/icons-react";
import {
  Button,
  ButtonAnchor,
  CopyButton,
  Heading,
  Panel,
  SectionHeader,
  Segmented,
  Table,
  Text,
} from "~/ui";
import { useDraft } from "~/draftStore";
import { SummaryRow } from "./SummaryRow";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { PlayerInputSection } from "~/routes/draft.new/components/PlayerInputSection";
import {
  hydratedMapStringsAtom,
  useHydratedDraft,
} from "~/hooks/useHydratedDraft";
import type { ExternalMapStringFormat } from "~/mapgen/utils/externalMapStringCodec";
import { MapSection } from "../sections";
import { useAtom } from "jotai";
import { useSyncDraft } from "~/hooks/useSyncDraft";
import { PlanetFinder } from "./PlanetFinder";
import { useSafeOutletContext } from "~/useSafeOutletContext";
import { trackButtonClick } from "~/lib/analytics.client";
import { StartingUnitsTable } from "~/components/StartingUnitsTable";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { PlayerChip } from "./PlayerChip";
import { factions as allFactions } from "~/data/factionData";
import classes from "./FinalizedDraft.module.css";

const ordinal = (n: number) =>
  n === 1 ? "Speaker" : `${n}${n === 2 ? "nd" : n === 3 ? "rd" : "th"}`;

export function FinalizedDraft() {
  const navigate = useNavigate();
  const { adminMode, originalArt, setOriginalArt } = useSafeOutletContext();

  const draftUrl = useDraft((state) => state.draftUrl);
  const draft = useDraft((state) => state.draft);
  const { updatePlayerName } = useDraft((state) => state.actions);
  const selections = useDraft((state) => state.draft.selections);
  const {
    slices,
    players,
    settings: { draftSpeaker, draftPlayerColors, draftGameMode },
  } = draft;
  const showSeat = draftSpeaker || draftGameMode === "texasStyle";
  const showSliceSummary =
    draftGameMode !== "texasStyle" && draftGameMode !== "presetMap";
  const { hydratedPlayers } = useHydratedDraft();
  const { syncDraft, undoLastPick } = useSyncDraft();

  const sortedPlayers = useMemo(
    () =>
      [...hydratedPlayers].sort((a, b) => a.speakerOrder! - b.speakerOrder!),
    [hydratedPlayers],
  );
  const [mapStrings] = useAtom(hydratedMapStringsAtom);
  const [mapStringFormat, setMapStringFormat] =
    useState<ExternalMapStringFormat>("ttpg");
  const mapString = mapStrings[mapStringFormat];

  const handleSoundboardClick = () => {
    const factionIds = hydratedPlayers
      .map((p) => p.faction)
      .filter(Boolean)
      .join(",");

    // Track button click with PostHog
    trackButtonClick({
      buttonType: "load_soundboard",
      context: "finalized_draft",
    });

    navigate(`/voices?factions=${factionIds}`);
  };

  return (
    <div className={classes.page}>
      <PlanetFinder onSystemSelected={syncDraft} />

      <header className={classes.header}>
        <div className={classes.titleBlock}>
          <Heading variant="title">Draft complete</Heading>
          <Text size="sm" tone="muted" truncate>
            {draftUrl}, finished in {selections.length} picks.
          </Text>
        </div>
        <div className={classes.actions}>
          <ButtonAnchor
            variant="primary"
            href={`/draft/${draftUrl}.png`}
            target="_blank"
            rel="noreferrer"
            icon={<IconShare size={18} />}
          >
            Share image
          </ButtonAnchor>
          <Button icon={<IconMicrophone2 size={18} />} onClick={handleSoundboardClick}>
            Soundboard
          </Button>
          <span className={classes.divider} aria-hidden />
          <Button
            variant="tertiary"
            icon={<IconPlayerPlay size={16} />}
            onClick={() => navigate(`/draft/${draftUrl}/replay`)}
          >
            Replay draft
          </Button>
          <Button
            variant="tertiary"
            icon={<IconArrowBackUp size={16} />}
            onClick={undoLastPick}
            disabled={selections.length === 0}
          >
            Undo last
          </Button>
        </div>
      </header>

      <div className={classes.grid}>
        <div className={classes.left}>
          <section className={classes.sec}>
            <SectionHeader title="Draft summary" />
            {showSliceSummary ? (
              <Table minWidth={760}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Player</Table.Th>
                    <Table.Th>Faction</Table.Th>
                    <Table.Th>Speaker</Table.Th>
                    {showSeat && <Table.Th>Seat</Table.Th>}
                    <Table.Th>SV</Table.Th>
                    <Table.Th>Optimal</Table.Th>
                    <Table.Th>Features</Table.Th>
                    {draftPlayerColors && <Table.Th>Colour</Table.Th>}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedPlayers.map((p) => (
                    <SummaryRow
                      key={p.id}
                      player={p}
                      slice={slices[p.sliceIdx!]}
                      draftSpeaker={showSeat}
                      showPlayerColor={!!draftPlayerColors}
                    />
                  ))}
                </Table.Tbody>
              </Table>
            ) : (
              <Table minWidth={480}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Player</Table.Th>
                    <Table.Th>Faction</Table.Th>
                    <Table.Th>Speaker</Table.Th>
                    {showSeat && <Table.Th>Seat</Table.Th>}
                    {draftPlayerColors && <Table.Th>Colour</Table.Th>}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedPlayers.map((player) => {
                    const faction =
                      player.faction !== undefined
                        ? allFactions[player.faction]
                        : undefined;
                    return (
                      <Table.Tr key={player.id}>
                        <Table.Td className={classes.playerCell}>
                          <PlayerChip player={player} size="sm" />
                        </Table.Td>
                        <Table.Td>
                          {faction ? (
                            <span className={classes.faction}>
                              <FactionIcon faction={faction.id} style={{ width: 22, height: 22, flex: "none" }} />
                              <span className={classes.factionName}>{faction.name}</span>
                            </span>
                          ) : (
                            <Text as="span" size="sm" tone="muted">
                              Not chosen
                            </Text>
                          )}
                        </Table.Td>
                        <Table.Td>
                          {player.speakerOrder !== undefined
                            ? ordinal(player.speakerOrder + 1)
                            : "-"}
                        </Table.Td>
                        {showSeat && (
                          <Table.Td numeric>
                            {player.seatIdx !== undefined
                              ? player.seatIdx + 1
                              : "-"}
                          </Table.Td>
                        )}
                        {draftPlayerColors && (
                          <Table.Td>{player.factionColor}</Table.Td>
                        )}
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            )}
          </section>

          {draftGameMode === "twilightsFall" && (
            <section className={classes.sec}>
              <SectionHeader title="Starting units" />
              <Table minWidth={520}>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Player</Table.Th>
                    <Table.Th>Faction</Table.Th>
                    <Table.Th>Units</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {sortedPlayers.map((player) => {
                    const startingUnitsFaction = player.startingUnitsFactionId
                      ? allFactions[player.startingUnitsFactionId]
                      : undefined;
                    const fleetComposition =
                      startingUnitsFaction?.fleetComposition;

                    if (!fleetComposition) return null;

                    return (
                      <Table.Tr key={player.id}>
                        <Table.Td className={classes.playerCell}>
                          <PlayerChip player={player} size="sm" />
                        </Table.Td>
                        <Table.Td>
                          {player.startingUnitsFactionId &&
                            startingUnitsFaction && (
                              <span className={classes.faction}>
                                <FactionIcon
                                  faction={player.startingUnitsFactionId}
                                  style={{ width: 22, height: 22, flex: "none" }}
                                />
                                <span className={classes.factionName}>
                                  {startingUnitsFaction.name}
                                </span>
                              </span>
                            )}
                        </Table.Td>
                        <Table.Td>
                          <StartingUnitsTable
                            fleetComposition={fleetComposition}
                            showTitle={false}
                          />
                        </Table.Td>
                      </Table.Tr>
                    );
                  })}
                </Table.Tbody>
              </Table>
            </section>
          )}

          <section className={classes.sec}>
            <SectionHeader title="Tiles" />
            <Text size="sm" tone="muted" className={classes.tiles}>
              {mapString
                .split(" ")
                .sort((a, b) => Number(a) - Number(b))
                .join(", ")}
            </Text>
          </section>

          <section className={classes.sec}>
            <SectionHeader title="Map string">
              <Segmented
                size="sm"
                label="Map string format"
                options={[
                  { label: "TTPG", value: "ttpg" },
                  { label: "Async", value: "async" },
                ]}
                value={mapStringFormat}
                onChange={(value) =>
                  setMapStringFormat(value as ExternalMapStringFormat)
                }
              />
            </SectionHeader>
            <div className={classes.mapString}>
              <input
                className={classes.mapStringInput}
                value={mapString}
                readOnly
                aria-label={`${mapStringFormat === "ttpg" ? "TTPG" : "Async"} map string`}
                onFocus={(e) => e.currentTarget.select()}
              />
              <CopyButton value={mapString} size="md" />
            </div>
          </section>

          {adminMode && (
            <Panel aria-label="Player names">
              <PlayerInputSection
                players={players}
                onChangeName={(playerIdx, name) => {
                  updatePlayerName(playerIdx, name);
                }}
              />
              <div className={classes.adminSave}>
                <Button variant="primary" onClick={syncDraft}>
                  Save
                </Button>
              </div>
            </Panel>
          )}
        </div>
        <div className={classes.right}>
          <MapSection
            titleChildren={
              <Segmented
                size="sm"
                label="Map art"
                options={[
                  { label: "Lab art", value: "lab" },
                  { label: "Original", value: "original" },
                ]}
                value={originalArt ? "original" : "lab"}
                onChange={(v) => setOriginalArt(v === "original")}
              />
            }
          />
        </div>
      </div>
    </div>
  );
}
