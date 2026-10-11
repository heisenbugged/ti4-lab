import { getRouteApi } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import type { DraftSettings, DiscordData } from "~/types";
import type {
  SliceGenerationSettings,
  SliceSettingsFormatType,
} from "~/draft/sliceSettings";
import { useDraftSetup } from "./-store";
import { buildSliceGenerationConfig } from "./-utils";
import { decodeSeededMapData } from "~/mapgen/utils/mapToDraft";
import { createMultiDraft } from "~/server/drafts.functions";
import "../new/-handoff";

const prechoiceRoute = getRouteApi("/draft/prechoice");

export const useDraftSettingsBuilder = (
  sliceSettings: Record<SliceSettingsFormatType, SliceGenerationSettings>,
) => {
  const content = useDraftSetup((state) => state.content);
  const map = useDraftSetup((state) => state.map);
  const faction = useDraftSetup((state) => state.faction);
  const slices = useDraftSetup((state) => state.slices);
  const format = useDraftSetup((state) => state.format);

  const buildDraftSettings = (): DraftSettings => {
    const factionGameSets = content.getFactionGameSets();
    const tileGameSets = content.getTileGameSets();
    const hasMinorFactions = !!faction.minorFactionsMode;

    const draftSettings: DraftSettings = {
      factionGameSets,
      tileGameSets,
      type: map.selectedMapType,
      numFactions: faction.numFactions,
      randomizeMap: !faction.minorFactionsMode,
      numPreassignedFactions: faction.preassignedFactions,
      minorFactionsMode: faction.minorFactionsMode,
      numSlices: Number(slices.numSlices),
      randomizeSlices: true,
      draftSpeaker: format.draftSpeaker,
      showMonumentImagesInFactionInfo: format.showMonumentImagesInFactionInfo,
      allowHomePlanetSearch: format.allowHomePlanetSearch,
      allowEmptyTiles: format.allowEmptyTiles,
      draftPlayerColors: format.draftPlayerColors,
      modifiers: format.banFactions
        ? { banFactions: { numFactions: 1 } }
        : undefined,
      allowedFactions: faction.allowedFactions,
      requiredFactions: faction.requiredFactions,
      factionStratification: faction.stratifiedConfig,
    };

    const sliceConfig = buildSliceGenerationConfig(
      map.selectedMapType,
      sliceSettings,
      hasMinorFactions,
    );

    if (sliceConfig) {
      draftSettings.sliceGenerationConfig = sliceConfig;
    }

    if (faction.minorFactionsMode?.mode === "sharedPool") {
      draftSettings.minorFactionsInSharedPool = true;
    } else if (faction.minorFactionsMode?.mode === "separatePool") {
      draftSettings.numMinorFactions =
        faction.minorFactionsMode.numMinorFactions;
    }

    return draftSettings;
  };

  return { buildDraftSettings };
};

export const useDraftNavigation = (discordData?: DiscordData) => {
  const navigate = prechoiceRoute.useNavigate();
  const mapSlicesString = prechoiceRoute.useSearch({ select: (s) => s.mapSlices });
  const multiDraft = useMutation({
    mutationFn: createMultiDraft,
    onSuccess: ({ prettyUrl }) =>
      navigate({ to: "/multidraft/$id", params: { id: prettyUrl } }),
  });
  const player = useDraftSetup((state) => state.player);
  const multidraft = useDraftSetup((state) => state.multidraft);
  const map = useDraftSetup((state) => state.map);

  const navigateToDraft = (draftSettings: DraftSettings) => {
    // Check if we have seeded map data in URL params AND it's compatible with selected map type
    let finalDraftSettings = draftSettings;

    if (mapSlicesString) {
      const seededData = decodeSeededMapData(mapSlicesString);
      // Only use seeded data if the current map type is compatible
      if (
        seededData &&
        seededData.compatibleDraftTypes.includes(map.selectedMapType)
      ) {
        finalDraftSettings = {
          ...draftSettings,
          randomizeSlices: false, // Use pre-seeded slices instead of generating
          presetSlices: seededData.slices,
          presetMap: seededData.presetMap,
        };
      }
    }

    if (multidraft.isMultidraft) {
      multiDraft.mutate({
        data: {
          settings: finalDraftSettings,
          players: player.players,
          discordData,
          numDrafts: multidraft.numDrafts,
        },
      });
      return;
    }

    navigate({
      to: "/draft/new",
      state: {
        newDraft: {
          draftSettings: finalDraftSettings,
          players: player.players,
          discordData,
        },
      },
    });
  };

  return { navigateToDraft };
};
