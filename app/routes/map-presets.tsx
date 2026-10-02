import {
  ActionIcon,
  Box,
  Button,
  Group,
  Loader,
  SegmentedControl,
  Text,
} from "@mantine/core";
import {
  Link,
  LoaderFunctionArgs,
  MetaFunction,
  useFetcher,
  useLoaderData,
  useLocation,
  useNavigate,
} from "react-router";
import { listPresetMaps } from "~/drizzle/presetMap.server";
import type { PresetMapListing } from "~/drizzle/presetMap.server";
import type { loader as presetPageLoader } from "./api.preset-maps";
import classes from "./map-presets/styles.module.css";
import {
  IconArrowRight,
  IconHeart,
  IconHeartFilled,
  IconMap,
  IconPlanet,
  IconPlayerPlay,
  IconSparkles,
  IconX,
} from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";
import {
  LegendaryDisplay,
  parseTechSkips,
  TechSkipsDisplay,
} from "~/components/PresetMapBadges";
import {
  mapGeneratorHref,
  postPresetMapLike,
  presetImageUrl,
} from "~/utils/presetMapClient";
import {
  BrowseFilters,
  browseMaps,
  GroupedMap,
  isNewMap,
  latestMaps,
  matchesFilters,
  parseBrowseFilters,
  pickMapOfTheDay,
  playerCountOptions,
  PRESET_PAGE_SIZE,
  SortMode,
  spotlightPool,
} from "~/utils/presetDiscovery";

export const meta: MetaFunction = () => [
  { title: "Community Maps - TI4 Lab" },
  {
    name: "description",
    content: "Browse community-created preset maps for Twilight Imperium 4.",
  },
];

type CardMap = GroupedMap<PresetMapListing>;
/** Like totals for maps liked this visit, by id. */
type LikedMaps = Record<string, number>;

/** Builds a listing URL from the current filters with some overridden. */
function browseHref(filters: BrowseFilters, changes: Partial<BrowseFilters>) {
  const next = { ...filters, ...changes };
  const params = new URLSearchParams();
  if (next.players != null) params.set("players", String(next.players));
  if (next.author) params.set("author", next.author);
  if (next.sort !== "played") params.set("sort", next.sort);
  const query = params.toString();
  return query ? `/map-presets?${query}` : "/map-presets";
}

function DraftCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className={classes.played}>
      <IconPlayerPlay size={11} />
      <span className={classes.playedCount}>{count}</span>
      {count === 1 ? "draft" : "drafts"}
    </span>
  );
}

function AuthorTag({ author }: { author: string }) {
  return (
    <span className={classes.authorTag}>
      <span className={classes.authorDot}>
        {author.charAt(0).toUpperCase()}
      </span>
      {author}
    </span>
  );
}

function LikeButton({
  preset,
  liked,
  onLike,
  size,
}: {
  preset: PresetMapListing;
  liked: LikedMaps;
  onLike: (id: string) => void;
  size: "xs" | "sm";
}) {
  const isLiked = preset.id in liked;
  return (
    <Group gap={4} className={classes.likeGroup}>
      <ActionIcon
        variant="subtle"
        color={isLiked ? "red" : "gray"}
        size={size}
        className={classes.heartButton}
        aria-label={isLiked ? "Liked" : `Like ${preset.name}`}
        onClick={() => onLike(preset.id)}
      >
        {isLiked ? <IconHeartFilled size={14} /> : <IconHeart size={14} />}
      </ActionIcon>
      <Text size="xs">{liked[preset.id] ?? preset.likes}</Text>
    </Group>
  );
}

function MapCard({
  preset,
  liked,
  onLike,
  isNew,
  filters,
}: {
  preset: CardMap | PresetMapListing;
  liked: LikedMaps;
  onLike: (id: string) => void;
  isNew: boolean;
  filters: BrowseFilters;
}) {
  const moreByAuthor = "moreByAuthor" in preset ? preset.moreByAuthor : 0;
  return (
    <article className={classes.card}>
      <div className={classes.mapPreviewWrap}>
        <Box
          component="img"
          src={presetImageUrl(preset)}
          alt=""
          loading="lazy"
          className={classes.mapPreview}
        />
        {preset.playerCount > 0 && (
          <span className={`${classes.playerTag} ${classes.playerChip}`}>
            {preset.playerCount}P
          </span>
        )}
        {isNew && <span className={classes.newBadge}>New</span>}
      </div>
      <div className={classes.cardContent}>
        {/* Stretched over the whole card; other controls sit above it. */}
        <Link to={`/maps/${preset.slug}`} className={classes.cardTitleLink}>
          {preset.name}
        </Link>
        <AuthorTag author={preset.author} />
        <div className={classes.mapStats}>
          {preset.avgSliceValue != null && (
            <span className={classes.stat}>
              <span className={classes.statValue}>{preset.avgSliceValue}</span>
              <span className={classes.statLabel}>Avg</span>
            </span>
          )}
          {preset.totalResources != null && preset.totalInfluence != null && (
            <span className={classes.stat}>
              <span className={classes.statValue}>
                {preset.totalResources}/{preset.totalInfluence}
              </span>
              <span className={classes.statLabel}>R/I</span>
            </span>
          )}
          <LegendaryDisplay count={preset.legendaries} />
          <TechSkipsDisplay techSkips={preset.techSkips} />
        </div>
        {preset.description && (
          <div className={classes.description}>{preset.description}</div>
        )}
      </div>
      <div className={classes.statsRow}>
        <DraftCount count={preset.draftCount} />
        <LikeButton preset={preset} liked={liked} onLike={onLike} size="xs" />
        <Button
          component="a"
          href={mapGeneratorHref(preset.mapString)}
          variant="subtle"
          color="blue"
          size="compact-xs"
          leftSection={<IconSparkles size={11} />}
          className={classes.genButton}
        >
          Generator
        </Button>
      </div>
      {moreByAuthor > 0 && (
        <Link
          to={browseHref(filters, { author: preset.author })}
          className={classes.moreByAuthor}
        >
          {moreByAuthor} more by {preset.author}
        </Link>
      )}
    </article>
  );
}

function Spotlight({
  preset,
  liked,
  onLike,
}: {
  preset: PresetMapListing;
  liked: LikedMaps;
  onLike: (id: string) => void;
}) {
  return (
    <section className={classes.spotlight}>
      <div className={classes.spotlightImageWrap}>
        <img
          src={presetImageUrl(preset)}
          alt={preset.name}
          className={classes.spotlightImage}
        />
      </div>
      <div className={classes.spotlightContent}>
        <div className={classes.spotlightKicker}>
          <IconPlanet size={13} />
          <span>Map of the day</span>
        </div>
        <h2 className={classes.spotlightName}>{preset.name}</h2>
        <div className={classes.spotlightAuthorRow}>
          <AuthorTag author={preset.author} />
          {preset.playerCount > 0 && (
            <span className={classes.playerTag}>{preset.playerCount}P</span>
          )}
        </div>
        {preset.description && (
          <p className={classes.spotlightDescription}>{preset.description}</p>
        )}
        <div className={classes.spotlightStats}>
          {preset.avgSliceValue != null && (
            <div className={classes.spotlightStat}>
              <span className={classes.spotlightStatValue}>
                {preset.avgSliceValue}
              </span>
              <span className={classes.spotlightStatLabel}>Avg Slice</span>
            </div>
          )}
          {preset.totalResources != null && preset.totalInfluence != null && (
            <div className={classes.spotlightStat}>
              <span className={classes.spotlightStatValue}>
                {preset.totalResources}/{preset.totalInfluence}
              </span>
              <span className={classes.spotlightStatLabel}>R/I</span>
            </div>
          )}
          {!!preset.legendaries && (
            <div className={classes.spotlightStat}>
              <LegendaryDisplay count={preset.legendaries} />
              <span className={classes.spotlightStatLabel}>Legendary</span>
            </div>
          )}
          {parseTechSkips(preset.techSkips) && (
            <div className={classes.spotlightStat}>
              <TechSkipsDisplay techSkips={preset.techSkips} />
              <span className={classes.spotlightStatLabel}>Tech Skips</span>
            </div>
          )}
          <div className={classes.spotlightEngagement}>
            <DraftCount count={preset.draftCount} />
            <LikeButton
              preset={preset}
              liked={liked}
              onLike={onLike}
              size="sm"
            />
          </div>
        </div>
        <Group gap="sm" mt="auto" pt="md">
          <Button
            component={Link}
            to={`/maps/${preset.slug}`}
            rightSection={<IconArrowRight size={14} />}
          >
            View map
          </Button>
          <Button
            component="a"
            href={mapGeneratorHref(preset.mapString)}
            variant="light"
            color="blue"
            leftSection={<IconSparkles size={14} />}
          >
            Open in generator
          </Button>
        </Group>
      </div>
    </section>
  );
}

function PlayerPicker({
  filters,
  options,
}: {
  filters: BrowseFilters;
  options: number[];
}) {
  const navigate = useNavigate();
  return (
    <div className={classes.playerFilter}>
      <span className={classes.playerFilterLabel}>Players</span>
      <SegmentedControl
        size="sm"
        color="blue"
        aria-label="Number of players"
        value={filters.players == null ? "any" : String(filters.players)}
        onChange={(value) =>
          navigate(
            browseHref(filters, {
              players: value === "any" ? null : Number(value),
            }),
            { preventScrollReset: true },
          )
        }
        data={[
          { label: "Any", value: "any" },
          ...options.map((players) => ({
            label: String(players),
            value: String(players),
          })),
        ]}
      />
    </div>
  );
}

/**
 * The paged grid. Keyed by the listing query, so a filter change mounts a
 * fresh list seeded from the loader's first page.
 */
function MapGrid({
  query,
  firstPage,
  initialHasMore,
  renderCard,
}: {
  query: string;
  firstPage: CardMap[];
  initialHasMore: boolean;
  renderCard: (preset: CardMap) => React.ReactNode;
}) {
  const [items, setItems] = useState(firstPage);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const fetcher = useFetcher<typeof presetPageLoader>();
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isLoading = fetcher.state !== "idle";

  const loadMore = () => {
    const params = new URLSearchParams(query);
    params.set("offset", String(items.length));
    fetcher.load(`/api/preset-maps?${params}`);
  };

  useEffect(() => {
    const page = fetcher.data;
    if (!page) return;
    setHasMore(page.hasMore);
    setItems((prev) => {
      const seen = new Set(prev.map((preset) => preset.id));
      return [...prev, ...page.items.filter((preset) => !seen.has(preset.id))];
    });
  }, [fetcher.data]);

  // Re-observed whenever the list grows so a sentinel that is still on screen
  // after a page lands (tall viewports) triggers the next page immediately.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || isLoading) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items.length, hasMore, isLoading]);

  return (
    <>
      <div className={classes.grid}>{items.map(renderCard)}</div>
      <div ref={sentinelRef} className={classes.loadMore}>
        {isLoading ? (
          <Loader size="sm" />
        ) : hasMore ? (
          <Button variant="subtle" size="xs" onClick={loadMore}>
            Load more
          </Button>
        ) : (
          items.length > PRESET_PAGE_SIZE && (
            <Text size="xs" c="dimmed">
              End of the list
            </Text>
          )
        )}
      </div>
    </>
  );
}

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: "Most played", value: "played" },
  { label: "Newest", value: "newest" },
];

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const filters = parseBrowseFilters(new URL(request.url).searchParams);
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

  const items = browseMaps(presets, filters);
  return {
    now,
    filters,
    total: presets.length,
    playerOptions: playerCountOptions(presets),
    // Ungrouped count of maps matching the filters, for the section header.
    matching: presets.filter((preset) => matchesFilters(preset, filters))
      .length,
    spotlight,
    newArrivals,
    firstPage: items.slice(0, PRESET_PAGE_SIZE),
    hasMore: items.length > PRESET_PAGE_SIZE,
  };
};

export default function MapPresets() {
  const {
    now,
    filters,
    total,
    playerOptions,
    matching,
    spotlight,
    newArrivals,
    firstPage,
    hasMore,
  } = useLoaderData<typeof loader>();
  const location = useLocation();
  const navigate = useNavigate();
  const [liked, setLiked] = useState<LikedMaps>({});

  const handleLike = async (id: string) => {
    const likes = await postPresetMapLike(id);
    if (likes != null) setLiked((prev) => ({ ...prev, [id]: likes }));
  };

  const renderCard = (preset: CardMap | PresetMapListing) => (
    <MapCard
      key={preset.id}
      preset={preset}
      liked={liked}
      onLike={handleLike}
      isNew={isNewMap(preset.createdAt, now)}
      filters={filters}
    />
  );

  const mapsLabel =
    filters.players != null ? `${filters.players}-player maps` : "maps";
  const gridTitle = filters.author
    ? `${filters.players != null ? mapsLabel : "Maps"} by ${filters.author}`
    : filters.players != null
      ? mapsLabel
      : "All maps";

  return (
    <MainAppShell>
      <Box className={classes.page}>
        <div className={classes.header}>
          <div className={classes.headerRow}>
            <h1 className={classes.title}>Community Maps</h1>
            <span className={classes.badge}>
              <IconMap size={12} />
              {total}
            </span>
          </div>
          <p className={classes.subtitle}>
            Maps built and shared by the community. Pick a player count to
            start.
          </p>
        </div>

        <PlayerPicker filters={filters} options={playerOptions} />

        {spotlight && (
          <div className={classes.reveal}>
            <Spotlight preset={spotlight} liked={liked} onLike={handleLike} />
          </div>
        )}

        {newArrivals.length > 0 && (
          <section className={classes.shelf}>
            <div className={classes.shelfHeader}>
              <span className={classes.shelfIcon}>
                <IconSparkles size={14} />
              </span>
              <h2 className={`${classes.sectionTitle} ${classes.shelfTitle}`}>
                New Arrivals
              </h2>
              <span className={classes.shelfSubtitle}>Hot off the forge</span>
              <div className={classes.shelfRule} />
            </div>
            <div className={classes.shelfRow}>
              {newArrivals.map((preset) => (
                <div key={preset.id} className={classes.shelfItem}>
                  {renderCard(preset)}
                </div>
              ))}
            </div>
          </section>
        )}

        <section className={classes.allMaps}>
          <div className={classes.allMapsHeader}>
            <div className={classes.allMapsHeading}>
              <h2 className={classes.sectionTitle}>{gridTitle}</h2>
              <span className={classes.allMapsCount}>{matching}</span>
              {filters.author && (
                <Button
                  component={Link}
                  to={browseHref(filters, { author: null })}
                  variant="subtle"
                  color="gray"
                  size="compact-xs"
                  leftSection={<IconX size={12} />}
                >
                  Show all authors
                </Button>
              )}
            </div>
            <SegmentedControl
              size="xs"
              value={filters.sort}
              onChange={(value) =>
                navigate(browseHref(filters, { sort: value as SortMode }), {
                  preventScrollReset: true,
                })
              }
              data={SORT_OPTIONS}
              className={classes.sortControl}
            />
          </div>
          {!filters.author && (
            <p className={classes.groupingNote}>
              Showing up to two maps per author. Follow “more by” on a card to
              see the rest.
            </p>
          )}
          {firstPage.length === 0 ? (
            <div className={classes.empty}>
              <Text size="sm">
                No {filters.players ? `${filters.players}-player ` : ""}maps
                yet.
              </Text>
              <Button
                component="a"
                href="/map-generator"
                variant="light"
                size="xs"
                leftSection={<IconSparkles size={12} />}
              >
                Build one in the map generator
              </Button>
            </div>
          ) : (
            <MapGrid
              key={location.search}
              query={location.search}
              firstPage={firstPage}
              initialHasMore={hasMore}
              renderCard={renderCard}
            />
          )}
        </section>
      </Box>
    </MainAppShell>
  );
}
