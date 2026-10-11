import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import {
  createPresetMap,
  likePresetMap,
  listPresetMaps,
  presetMapById,
  presetMapBySlug,
  recordPresetMapView,
} from "~/drizzle/presetMap.server";
import {
  BrowseFilters,
  browseMaps,
  latestMaps,
  matchesFilters,
  parseBrowseFilters,
  pickMapOfTheDay,
  playerCountOptions,
  PRESET_PAGE_SIZE,
  spotlightPool,
} from "~/utils/presetDiscovery";
import { getRequestIp, isNonHumanRequest } from "~/utils/request.server";
import { expectRecord, expectString, optionalNumber } from "./validate";

function validateFilters(filters: BrowseFilters) {
  return parseBrowseFilters(expectRecord(filters, "filters"));
}

/** Everything on the community page except the paged grid. */
export const getPresetMapsOverview = createServerFn()
  .validator(validateFilters)
  .handler(async ({ data: filters }) => {
    const presets = await listPresetMaps();
    const now = Date.now();

    // Shelves follow the player filter but step aside when browsing one author.
    const forPlayers = presets.filter((preset) =>
      matchesFilters(preset, { players: filters.players, author: null }),
    );
    const showShelves = filters.author == null;
    const spotlight = showShelves
      ? pickMapOfTheDay(spotlightPool(forPlayers), now)
      : null;
    const newArrivals = showShelves
      ? latestMaps(
          forPlayers.filter((preset) => preset.id !== spotlight?.id),
          6,
        )
      : [];

    return {
      now,
      total: presets.length,
      playerOptions: playerCountOptions(presets),
      // Ungrouped count of maps matching the filters, for the section header.
      matching: presets.filter((preset) => matchesFilters(preset, filters))
        .length,
      spotlight,
      newArrivals,
    };
  });

/** One page of the community grid, filtered and grouped like the page itself. */
export const getPresetMapsPage = createServerFn()
  .validator((input: BrowseFilters & { offset: number }) => ({
    filters: validateFilters(input),
    offset: Math.max(0, optionalNumber(input.offset) ?? 0),
  }))
  .handler(async ({ data: { filters, offset } }) => {
    const items = browseMaps(await listPresetMaps(), filters);
    return {
      items: items.slice(offset, offset + PRESET_PAGE_SIZE),
      hasMore: offset + PRESET_PAGE_SIZE < items.length,
    };
  });

export const getPresetMap = createServerFn()
  .validator((slug: string) => expectString(slug, "Map slug"))
  .handler(async ({ data: slug }) => {
    const preset = await presetMapBySlug(slug);
    if (!preset) throw notFound();
    return preset;
  });

/**
 * Counts a view of a map page; returns the new total. Called once the page is
 * on screen, so link preloads and non-JS crawlers don't count.
 */
export const recordPresetView = createServerFn({ method: "POST" })
  .validator((id: string) => expectString(id, "Map ID"))
  .handler(async ({ data: id }) => {
    const request = getRequest();
    const preset = await presetMapById(id);
    if (!preset) throw notFound();
    if (isNonHumanRequest(request)) return preset.views;
    return recordPresetMapView(id, getRequestIp(request));
  });

export const publishPresetMap = createServerFn({ method: "POST" })
  .validator(
    (input: {
      name: string;
      description: string;
      author: string;
      mapString: string;
      mapConfigId: string;
    }) => {
      expectRecord(input);
      return {
        name: expectString(input.name, "Name").trim(),
        description: expectString(input.description, "Description").trim(),
        author: expectString(input.author, "Author").trim(),
        mapString: expectString(input.mapString, "Map").trim(),
        mapConfigId: expectString(input.mapConfigId, "Map config").trim(),
      };
    },
  )
  .handler(async ({ data }) => {
    const preset = await createPresetMap(data);
    return { id: preset.id, slug: preset.slug };
  });

/** Likes a map (once per visitor); returns the new like total. */
export const likePreset = createServerFn({ method: "POST" })
  .validator((id: string) => expectString(id, "Map ID"))
  .handler(async ({ data: id }) => {
    const preset = await presetMapById(id);
    if (!preset) throw notFound();
    return likePresetMap(id, getRequestIp(getRequest()));
  });
