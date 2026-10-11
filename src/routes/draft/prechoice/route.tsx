import { DiscordData, DraftSettings, GameSet } from "~/types";
import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { DemoMap } from "~/components/DemoMap";
import {
  IconBrandDiscordFilled,
  IconFile,
  IconInfoCircle,
  IconPlayerPlay,
} from "@tabler/icons-react";
import { DiscordBanner } from "~/components/DiscordBanner";
import {
  Button,
  NumberStepper,
  Notice,
  Panel,
  Rows,
  ListRow,
  SectionHeader,
  Segmented,
  Switch,
  notify,
  useDisclosure,
} from "~/ui";
import { SliceSettingsModal } from "~/components/SliceSettingsModal";
import {
  DEFAULT_SLICE_SETTINGS,
  type SliceSettingsFormatType,
} from "~/draft/sliceSettings";
import { DraftMode, useDraftSetup } from "./-store";
import { MAPS, ChoosableDraftType } from "./-maps";
import { ReferenceCardPacksConfigurationSection } from "./-components/ReferenceCardPacksConfigurationSection";
import { SlicesConfigurationSection } from "./-components/SlicesConfigurationSection";
import { KingsConfigurationSection } from "./-components/KingsConfigurationSection";
import { DraftConfigurationPanel } from "./-components/DraftConfigurationPanel";
import { PlayerInputSection } from "~/routes/draft/new/-components/PlayerInputSection";
import { useDraftSettingsBuilder, useDraftNavigation } from "./-hooks";
import { buildInitialTexasDraft } from "~/draft/buildInitialDraft";
import {
  getTexasSlotCounts,
  TEXAS_TILES_PER_PLAYER,
} from "~/draft/texas/texasCompatibility";
import { DiscordIntegrationModal } from "./-components/DiscordIntegrationModal";
import { MinorFactionsInfoModal } from "./-components/MinorFactionsInfoModal";
import { ContinueFromPresetModal } from "./-components/ContinueFromPresetModal";
import { playersFromDiscordData } from "~/utils/discordPlayers";
import type { DraftPreset } from "~/drizzle/draftPreset.server";
import { presetPlayerCountError } from "~/utils/draftPreset";
import { MapStyleSelector } from "./-components/MapStyleSelector";
import { SeededMapBanner } from "./-components/SeededMapBanner";
import { decodeSeededMapData } from "~/mapgen/utils/mapToDraft";
import { DraftFormatDescription } from "./-components/DraftFormatDescription";
import { getMaxAvailableSlices } from "./-utils";
import { discordOauthUrl } from "~/discord/oauthUrls";
import { useCreateDraft } from "~/hooks/useCreateDraft";
import "../new/-handoff";
import classes from "./prechoice.module.css";

const MODE_LABELS: Record<DraftMode, string> = {
  base: "Base draft",
  twilightFalls: "Twilight's Fall",
  texasStyle: "Texas style",
};

type PrechoiceSearch = {
  /** Base64 JSON from the Discord bot's /startdraft link. */
  discord?: string;
  /** Slices seeded from the map generator (see encodeSeededMapData). */
  mapSlices?: string;
  draftType?: ChoosableDraftType;
};

export const Route = createFileRoute("/draft/prechoice")({
  validateSearch: (search): PrechoiceSearch => ({
    discord: typeof search.discord === "string" ? search.discord : undefined,
    mapSlices: typeof search.mapSlices === "string" ? search.mapSlices : undefined,
    draftType:
      typeof search.draftType === "string" && search.draftType in MAPS
        ? (search.draftType as ChoosableDraftType)
        : undefined,
  }),
  component: DraftPrechoice,
});

function decodeDiscordData(discord: string | undefined) {
  if (!discord) return undefined;
  try {
    return JSON.parse(atob(discord)) as DiscordData;
  } catch {
    return undefined;
  }
}

function DraftPrechoice() {
  const invalidDraftParameters = useLocation({
    select: (location) => location.state.invalidDraftParameters,
  });
  const navigate = Route.useNavigate();
  const createDraft = useCreateDraft();
  const {
    discord,
    mapSlices: mapSlicesString,
    draftType: selectedDraftType,
  } = Route.useSearch();
  const discordData = useMemo(() => decodeDiscordData(discord), [discord]);
  const [hoveredMapType, setHoveredMapType] = useState<
    ChoosableDraftType | undefined
  >();

  const player = useDraftSetup((state) => state.player);
  const setPlayers = useDraftSetup((state) => state.player.setPlayers);
  const map = useDraftSetup((state) => state.map);
  const slices = useDraftSetup((state) => state.slices);
  const draftMode = useDraftSetup((state) => state.draftMode);
  const setDraftMode = useDraftSetup((state) => state.setDraftMode);
  const referenceCardPacks = useDraftSetup((state) => state.referenceCardPacks);
  const kings = useDraftSetup((state) => state.kings);
  const content = useDraftSetup((state) => state.content);
  const format = useDraftSetup((state) => state.format);
  const texas = useDraftSetup((state) => state.texas);
  const faction = useDraftSetup((state) => state.faction);

  const [sliceSettings, setSliceSettings] = useState(DEFAULT_SLICE_SETTINGS);

  const [activeSettingsFormat, setActiveSettingsFormat] =
    useState<SliceSettingsFormatType>("milty");

  // Initialize players from Discord data if available
  const discordDataInitialized = useRef(false);
  useEffect(() => {
    if (discordData?.players && !discordDataInitialized.current) {
      setPlayers(playersFromDiscordData(discordData));
      discordDataInitialized.current = true;
    }
  }, [discordData, setPlayers]);

  // Initialize from seeded map URL param (one-time on mount)
  const seededMapInitialized = useRef(false);
  useEffect(() => {
    if (mapSlicesString && !seededMapInitialized.current) {
      const seededData = decodeSeededMapData(mapSlicesString);
      if (seededData) {
        // Set player count based on slice count
        const sliceCount = seededData.slices.length;
        const currentPlayerCount = player.players.length;
        if (sliceCount !== currentPlayerCount) {
          const newPlayers = Array(sliceCount)
            .fill(null)
            .map((_, i) => ({
              id: i,
              name: player.players[i]?.name ?? "",
            }));
          setPlayers(newPlayers);
        }

        // Set map type to selected type from URL, or first compatible type
        const draftTypeToUse =
          selectedDraftType &&
          seededData.compatibleDraftTypes.includes(selectedDraftType)
            ? selectedDraftType
            : seededData.compatibleDraftTypes[0];

        if (draftTypeToUse) {
          map.setSelectedMapType(draftTypeToUse as ChoosableDraftType);
        }

        // Set slice count
        slices.setNumSlices(sliceCount);

        seededMapInitialized.current = true;
      }
    }
  }, [mapSlicesString, selectedDraftType, player, setPlayers, map, slices]);

  const mapType = hoveredMapType ?? map.selectedMapType;
  // Crossfade the demo map and description only once the format has changed, never on page load.
  const firstMapType = useRef(mapType);
  const switchedRef = useRef(false);
  if (mapType !== firstMapType.current) switchedRef.current = true;
  const formatSwitched = switchedRef.current;
  const playerCount = player.players.length;

  const maxSlices = useMemo(() => {
    const tileGameSets: GameSet[] =
      draftMode === "twilightFalls"
        ? ["base", "pok", "te"]
        : content.getTileGameSets();
    return Math.max(
      playerCount,
      getMaxAvailableSlices(
        map.selectedMapType,
        tileGameSets,
        !!faction.minorFactionsMode,
      ),
    );
  }, [
    content,
    draftMode,
    faction.minorFactionsMode,
    map.selectedMapType,
    playerCount,
  ]);

  const { buildDraftSettings } = useDraftSettingsBuilder(sliceSettings);
  const { navigateToDraft } = useDraftNavigation(discordData);

  const handleMapTypeSelect = (mapType: ChoosableDraftType) => {
    // Clear seeded map params from URL when map type changes
    if (mapSlicesString) {
      navigate({
        search: (prev) => ({ ...prev, mapSlices: undefined, draftType: undefined }),
        replace: true,
      });
    }
    map.setSelectedMapType(mapType);
  };

  const texasSlots = getTexasSlotCounts(map.selectedMapType);
  const texasReason = `Texas style deals ${TEXAS_TILES_PER_PLAYER} tiles per player (${texasSlots.dealtTiles} total), but ${MAPS[map.selectedMapType].title} has ${texasSlots.openSlots} open systems, so the galaxy can't be completed. Choose a different map to use Texas style.`;

  const handleContinue = () => {
    if (draftMode === "twilightFalls") {
      const draftType = map.selectedMapType;

      const twilightsFallSettings: DraftSettings = {
        type: draftType,
        nucleusStyle: draftType.startsWith("heisen"),
        numFactions: kings.numKings, // Configurable number of kings
        numKings: kings.numKings,
        factionGameSets: ["twilightsFall"], // Only Mahact Kings faction set
        tileGameSets: ["base", "pok", "te"],
        numSlices: Number(slices.numSlices),
        numReferenceCardPacks: referenceCardPacks.numReferenceCardPacks,
        randomizeMap: true,
        randomizeSlices: true,
        draftSpeaker: false,
        showMonumentImagesInFactionInfo: format.showMonumentImagesInFactionInfo,
        allowHomePlanetSearch: false,
        allowEmptyTiles: false,
        draftPlayerColors: false,
        minorFactionsMode: undefined,
        draftGameMode: "twilightsFall",
      };

      navigate({
        to: "/draft/new",
        state: {
          newDraft: {
            draftSettings: twilightsFallSettings,
            players: player.players,
            discordData,
          },
        },
      });
    } else if (draftMode === "texasStyle") {
      const baseSettings = buildDraftSettings();
      const texasSettings: DraftSettings = {
        ...baseSettings,
        draftGameMode: "texasStyle",
        draftSpeaker: false,
        draftPlayerColors: false,
        allowHomePlanetSearch: false,
        allowEmptyTiles: false,
        modifiers: { banFactions: { numFactions: 1 } },
        texasFactionHandSize: texas.factionHandSize,
        texasAllowFactionRedraw: texas.allowRedraw,
        randomizeMap: false,
        randomizeSlices: false,
      };

      // Build the full draft object and create it directly, bypassing /draft/new
      const draft = buildInitialTexasDraft(texasSettings, player.players, {
        discord: discordData,
      });
      createDraft(draft);
    } else {
      // Base draft mode - use normal settings
      const draftSettings = buildDraftSettings();
      navigateToDraft(draftSettings);
    }
  };

  // Commit on mousedown so it feels immediate; keyboard activation only fires click.
  const continueHandlers = {
    onMouseDown: (e: React.MouseEvent) => {
      if (e.button === 0) handleContinue();
    },
    onClick: (e: React.MouseEvent) => {
      if (e.detail === 0) handleContinue();
    },
  };

  const [discordOpened, { open: openDiscord, close: closeDiscord }] =
    useDisclosure(false);

  const [
    minorFactionsOpened,
    { open: openMinorFactions, close: closeMinorFactions },
  ] = useDisclosure(false);

  const [presetOpened, { open: openPreset, close: closePreset }] =
    useDisclosure(false);

  const handleContinueFromPreset = (preset: DraftPreset) => {
    // Discord players are fixed by the bot command, so they can't be padded
    // or truncated to fit the preset.
    const playerCountError =
      discordData && presetPlayerCountError(preset, player.players.length);
    if (playerCountError) {
      notify({
        tone: "danger",
        title: "Could not continue from preset",
        message: playerCountError,
      });
      return;
    }

    const adjustedPlayers = Array.from(
      { length: preset.playerCount },
      (_, index) =>
        player.players[index] ?? {
          id: index,
          name: "",
        },
    );

    navigate({
      to: "/draft/new",
      state: {
        newDraft: {
          savedDraftState: {
            ...preset.data,
            integrations: { discord: discordData },
            players: adjustedPlayers,
            selections: [],
            pickOrder: [],
          },
        },
      },
    });
  };

  const [
    sliceSettingsOpened,
    { open: openSliceSettings, close: closeSliceSettings },
  ] = useDisclosure(false);

  const handleOpenSettings = (formatType: SliceSettingsFormatType) => {
    setActiveSettingsFormat(formatType);
    openSliceSettings();
  };

  const commitLabel =
    draftMode === "texasStyle" ? "Start draft" : "Continue to draft builder";

  const demoMap = mapType && (
    <DemoMap
      key={mapType}
      fadeIn={formatSwitched}
      id="prechoice-map"
      map={MAPS[mapType].map}
      titles={MAPS[mapType].titles}
      padding={0}
    />
  );

  return (
    <>
      <SliceSettingsModal
        opened={sliceSettingsOpened}
        formatType={activeSettingsFormat}
        settings={sliceSettings[activeSettingsFormat]}
        onClose={closeSliceSettings}
        onSave={(newSettings) => {
          setSliceSettings((prev) => ({
            ...prev,
            [activeSettingsFormat]: newSettings,
          }));
        }}
      />

      <ContinueFromPresetModal
        opened={presetOpened}
        onClose={closePreset}
        onContinue={handleContinueFromPreset}
      />

      <MinorFactionsInfoModal
        opened={minorFactionsOpened}
        onClose={closeMinorFactions}
      />

      <DiscordIntegrationModal
        opened={discordOpened}
        discordOauthUrl={discordOauthUrl}
        onClose={closeDiscord}
      />

      <div className={classes.page}>
        {(mapSlicesString ||
          discordData ||
          invalidDraftParameters) && (
          <div className={classes.banners}>
            {mapSlicesString && <SeededMapBanner />}
            {discordData && <DiscordBanner />}
            {invalidDraftParameters && (
              <Notice tone="danger" title="Invalid draft parameters">
                Could not generate a draft with the given parameters. Please
                try different minimal/total optimal values.
              </Notice>
            )}
          </div>
        )}

        <div className={classes.grid}>
          <div className={classes.left}>
            <section className={classes.sec}>
              <SectionHeader title="Draft style">
                <span className={classes.meta}>{playerCount} players</span>
              </SectionHeader>
              <div className={classes.stylebox}>
                <MapStyleSelector
                  playerCount={playerCount}
                  selectedMapType={map.selectedMapType}
                  onMapTypeHover={setHoveredMapType}
                  onMapTypeSelect={handleMapTypeSelect}
                  onOpenSettings={handleOpenSettings}
                  onOpenMinorFactionsInfo={openMinorFactions}
                />
                <div className={classes.mapwrap}>{demoMap}</div>
              </div>
              <DraftFormatDescription
                key={mapType}
                fadeIn={formatSwitched}
                data={MAPS[mapType].descriptionData}
                title={MAPS[mapType].title}
              />
            </section>
          </div>

          <div className={classes.right}>
            <PlayerInputSection
              players={player.players}
              discordData={discordData}
              onChangeName={player.changeName}
              onIncreasePlayers={player.add}
              onDecreasePlayers={player.remove}
            />

            <section className={classes.sec}>
              <SectionHeader title="Configuration" />
              <Segmented<DraftMode>
                label="Draft mode"
                block
                value={draftMode}
                onChange={setDraftMode}
                options={[
                  { value: "base", label: "Base draft" },
                  { value: "twilightFalls", label: "Twilight's Fall" },
                  {
                    value: "texasStyle",
                    label: "Texas style",
                    disabled: !texasSlots.supported,
                    title: texasSlots.supported ? undefined : texasReason,
                  },
                ]}
              />
              {!texasSlots.supported && (
                <p className={classes.why}>
                  <IconInfoCircle size={14} />
                  {texasReason}
                </p>
              )}

              <div className={classes.config}>
                {draftMode === "base" && (
                  <DraftConfigurationPanel maxSlices={maxSlices} />
                )}

                {draftMode === "twilightFalls" && (
                  <>
                    <Notice tone="info" title="Simplified configuration">
                      Players pick a &ldquo;reference card pack&rdquo; during
                      the snake draft. After drafting, choose home system,
                      faction, and priority from your pack.
                    </Notice>
                    <div className={classes.two}>
                      <SlicesConfigurationSection maxSlices={maxSlices} />
                      <ReferenceCardPacksConfigurationSection />
                      <KingsConfigurationSection />
                    </div>
                  </>
                )}

                {draftMode === "texasStyle" && (
                  <>
                    <Notice tone="info" title="Texas style draft">
                      Randomized seating and speaker, faction bans,
                      simultaneous faction selection, and a pass-based tile
                      draft before the galaxy build.
                    </Notice>
                    <TexasStyleSettings
                      factionHandSize={texas.factionHandSize}
                      allowRedraw={texas.allowRedraw}
                      onChangeHandSize={texas.setFactionHandSize}
                      onToggleRedraw={texas.setAllowRedraw}
                    />
                  </>
                )}
              </div>
            </section>

            <div className={classes.actions}>
              <Button
                variant="primary"
                size="lg"
                block
                icon={<IconPlayerPlay size={18} />}
                className={classes.commit}
                {...continueHandlers}
              >
                {commitLabel}
              </Button>
              <Button
                block
                icon={<IconFile size={16} />}
                onClick={openPreset}
                className={discordData ? classes.span : undefined}
              >
                Continue from preset
              </Button>
              {!discordData && (
                <Button
                  block
                  icon={<IconBrandDiscordFilled size={16} />}
                  onClick={openDiscord}
                >
                  Integrate with Discord
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className={classes.bar}>
          <span className={classes.barText}>
            <small>
              {MAPS[map.selectedMapType].title}, {playerCount} players
            </small>
            <b>{MODE_LABELS[draftMode]}</b>
          </span>
          <Button variant="primary" {...continueHandlers}>
            {draftMode === "texasStyle" ? "Start draft" : "Continue"}
          </Button>
        </div>
      </div>
    </>
  );
}

type TexasStyleSettingsProps = {
  factionHandSize: number;
  allowRedraw: boolean;
  onChangeHandSize: (num: number) => void;
  onToggleRedraw: (v: boolean) => void;
};

function TexasStyleSettings({
  factionHandSize,
  allowRedraw,
  onChangeHandSize,
  onToggleRedraw,
}: TexasStyleSettingsProps) {
  return (
    <Panel>
      <Rows>
        <ListRow
          label="Factions dealt per player"
          hint="Deal 2 or 3 factions to each player before selection."
        >
          <NumberStepper
            value={factionHandSize}
            label="factions dealt per player"
            decrease={() => onChangeHandSize(Math.max(2, factionHandSize - 1))}
            increase={() => onChangeHandSize(Math.min(3, factionHandSize + 1))}
            decreaseDisabled={factionHandSize <= 2}
            increaseDisabled={factionHandSize >= 3}
          />
        </ListRow>
        <ListRow
          label="Allow redraw"
          hint="Players can toss both factions and draw one they must play."
        >
          <Switch
            aria-label="Allow redraw"
            checked={allowRedraw}
            onChange={onToggleRedraw}
          />
        </ListRow>
      </Rows>
    </Panel>
  );
}
