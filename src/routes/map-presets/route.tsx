import {
  infiniteQueryOptions,
  useSuspenseInfiniteQuery,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { PresetMapListing } from "~/drizzle/presetMap.server";
import {
  getPresetMapsOverview,
  getPresetMapsPage,
} from "~/server/presetMaps.functions";
import classes from "./styles.module.css";
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
import { postPresetMapLike, presetImageUrl } from "~/utils/presetMapClient";
import {
  BrowseFilters,
  browseSearch,
  GroupedMap,
  isNewMap,
  parseBrowseFilters,
  PRESET_PAGE_SIZE,
  SortMode,
} from "~/utils/presetDiscovery";
import {
  Button,
  ButtonLink,
  Heading,
  Segmented,
  Spinner,
  Tag,
  Text,
  cx,
} from "~/ui";

/** The paged grid for a set of filters; pages append as you scroll. */
const presetMapsQuery = (filters: BrowseFilters) =>
  infiniteQueryOptions({
    queryKey: ["preset-maps", filters],
    queryFn: ({ pageParam }) =>
      getPresetMapsPage({ data: { ...filters, offset: pageParam } }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) =>
      lastPage.hasMore
        ? pages.reduce((count, page) => count + page.items.length, 0)
        : undefined,
    staleTime: 60_000,
  });

export const Route = createFileRoute("/map-presets")({
  validateSearch: (search) => browseSearch(parseBrowseFilters(search)),
  loaderDeps: ({ search: { sort, players, author } }) => ({
    filters: parseBrowseFilters({ sort, players, author }),
  }),
  loader: async ({ deps: { filters }, context: { queryClient } }) => {
    const [overview] = await Promise.all([
      getPresetMapsOverview({ data: filters }),
      queryClient.ensureInfiniteQueryData(presetMapsQuery(filters)),
    ]);
    return { ...overview, filters };
  },
  head: () => ({
    meta: [
      { title: "Community Maps - TI4 Lab" },
      {
        name: "description",
        content: "Browse community-created preset maps for Twilight Imperium 4.",
      },
    ],
  }),
  component: MapPresets,
});

type CardMap = GroupedMap<PresetMapListing>;
/** Like totals for maps liked this visit, by id. */
type LikedMaps = Record<string, number>;

/** Listing search params from the current filters with some overridden. */
function withFilters(filters: BrowseFilters, changes: Partial<BrowseFilters>) {
  return browseSearch({ ...filters, ...changes });
}

function DraftCount({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className={classes.drafts}>
      <IconPlayerPlay size={14} />
      <b>{count}</b>
      {count === 1 ? "draft" : "drafts"}
    </span>
  );
}

function AuthorTag({ author }: { author: string }) {
  return (
    <span className={classes.author}>
      <i aria-hidden>{author.charAt(0).toUpperCase()}</i>
      <span className={classes.authorName}>{author}</span>
    </span>
  );
}

function LikeButton({
  preset,
  liked,
  onLike,
}: {
  preset: PresetMapListing;
  liked: LikedMaps;
  onLike: (id: string) => void;
}) {
  const isLiked = preset.id in liked;
  return (
    <button
      type="button"
      className={cx(classes.like, isLiked && classes.liked)}
      aria-label={isLiked ? "Liked" : `Like ${preset.name}`}
      aria-pressed={isLiked}
      onClick={() => onLike(preset.id)}
    >
      {isLiked ? <IconHeartFilled /> : <IconHeart />}
      <span>{liked[preset.id] ?? preset.likes}</span>
    </button>
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
      <div className={classes.cardImg}>
        <img src={presetImageUrl(preset)} alt="" loading="lazy" />
        {preset.playerCount > 0 && (
          <Tag className={classes.cardPlayers}>{preset.playerCount}P</Tag>
        )}
        {isNew && (
          <Tag tone="ion" className={classes.cardNew}>
            New
          </Tag>
        )}
      </div>
      <div className={classes.cardBody}>
        {/* Stretched over the whole card; other controls sit above it. */}
        <Link
          to="/maps/$slug"
          params={{ slug: preset.slug }}
          className={classes.cardTitle}
        >
          {preset.name}
        </Link>
        <AuthorTag author={preset.author} />
        <div className={classes.cardStats}>
          {preset.avgSliceValue != null && (
            <span>
              <b>{preset.avgSliceValue}</b> avg
            </span>
          )}
          {preset.totalResources != null && preset.totalInfluence != null && (
            <span>
              <b>
                {preset.totalResources}/{preset.totalInfluence}
              </b>{" "}
              R/I
            </span>
          )}
          <LegendaryDisplay count={preset.legendaries} />
          <TechSkipsDisplay techSkips={preset.techSkips} />
        </div>
        {preset.description && (
          <p className={classes.cardDesc}>{preset.description}</p>
        )}
      </div>
      <div className={classes.cardFoot}>
        <DraftCount count={preset.draftCount} />
        <LikeButton preset={preset} liked={liked} onLike={onLike} />
        <ButtonLink
          to="/map-generator"
          search={{ map: preset.mapString }}
          variant="tertiary"
          size="sm"
          icon={<IconSparkles size={14} />}
          className={classes.cardGen}
        >
          Generator
        </ButtonLink>
      </div>
      {moreByAuthor > 0 && (
        <Link
          to="/map-presets"
          search={withFilters(filters, { author: preset.author })}
          className={classes.cardMore}
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
  const techSkips = parseTechSkips(preset.techSkips);
  return (
    <section className={classes.hero} aria-labelledby="map-of-the-day">
      <Link
        to="/maps/$slug"
        params={{ slug: preset.slug }}
        className={classes.heroMap}
        tabIndex={-1}
      >
        <img src={presetImageUrl(preset)} alt={preset.name} />
      </Link>
      <div className={classes.heroInfo}>
        <p className={classes.heroKicker}>
          <IconPlanet size={16} />
          Map of the day
        </p>
        <Heading variant="title" as="h2" id="map-of-the-day">
          {preset.name}
        </Heading>
        <div className={classes.heroBy}>
          <AuthorTag author={preset.author} />
          {preset.playerCount > 0 && <Tag>{preset.playerCount}P</Tag>}
        </div>
        {preset.description && (
          <p className={classes.heroDesc}>{preset.description}</p>
        )}
        <div className={classes.heroStats}>
          {preset.avgSliceValue != null && (
            <div>
              <b className={classes.statValue}>{preset.avgSliceValue}</b>
              <span className={classes.statLabel}>Avg slice</span>
            </div>
          )}
          {preset.totalResources != null && preset.totalInfluence != null && (
            <div>
              <b className={classes.statValue}>
                {preset.totalResources}/{preset.totalInfluence}
              </b>
              <span className={classes.statLabel}>R/I</span>
            </div>
          )}
          {!!preset.legendaries && (
            <div>
              <span className={classes.heroGlyphs}>
                <LegendaryDisplay count={preset.legendaries} size="md" />
              </span>
              <span className={classes.statLabel}>Legendary</span>
            </div>
          )}
          {techSkips && (
            <div>
              <span className={classes.heroGlyphs}>
                <TechSkipsDisplay techSkips={preset.techSkips} size="md" />
              </span>
              <span className={classes.statLabel}>Tech skips</span>
            </div>
          )}
        </div>
        <div className={classes.heroEng}>
          <DraftCount count={preset.draftCount} />
          <LikeButton preset={preset} liked={liked} onLike={onLike} />
        </div>
        <div className={classes.heroActions}>
          <ButtonLink
            to="/maps/$slug"
            params={{ slug: preset.slug }}
            variant="primary"
            iconRight={<IconArrowRight size={16} />}
          >
            View map
          </ButtonLink>
          <ButtonLink
            to="/map-generator"
            search={{ map: preset.mapString }}
            icon={<IconSparkles size={16} />}
          >
            Open in generator
          </ButtonLink>
        </div>
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
  const navigate = Route.useNavigate();
  return (
    <div className={classes.filter}>
      <Text as="span" size="sm" tone="muted" weight={600}>
        Players
      </Text>
      <Segmented
        label="Number of players"
        value={filters.players == null ? "any" : String(filters.players)}
        onChange={(value) =>
          navigate({
            search: withFilters(filters, {
              players: value === "any" ? null : Number(value),
            }),
            resetScroll: false,
          })
        }
        options={[
          { label: "Any", value: "any" },
          ...options.map((players) => ({
            label: String(players),
            value: String(players),
          })),
        ]}
        className={classes.playerSeg}
      />
    </div>
  );
}

/** The paged grid; loads the next page as the end of the list nears. */
function MapGrid({
  filters,
  renderCard,
}: {
  filters: BrowseFilters;
  renderCard: (preset: CardMap) => React.ReactNode;
}) {
  const { data, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useSuspenseInfiniteQuery(presetMapsQuery(filters));
  const items = data.pages.flatMap((page) => page.items);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Re-observed whenever the list grows so a sentinel that is still on screen
  // after a page lands (tall viewports) triggers the next page immediately.
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) fetchNextPage();
      },
      { rootMargin: "800px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [items.length, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (items.length === 0) {
    return (
      <div className={classes.empty}>
        <IconMap size={28} className={classes.emptyIcon} />
        <Text size="md" weight={600}>
          No {filters.players ? `${filters.players}-player ` : ""}maps yet.
        </Text>
        <ButtonLink to="/map-generator" icon={<IconSparkles size={16} />}>
          Build one in the map generator
        </ButtonLink>
      </div>
    );
  }

  return (
    <>
      <div className={classes.grid}>{items.map(renderCard)}</div>
      <div ref={sentinelRef} className={classes.loadMore}>
        {isFetchingNextPage ? (
          <Spinner size={18} />
        ) : hasNextPage ? (
          <>
            <Button size="sm" onClick={() => fetchNextPage()}>
              Load more
            </Button>
            <Text as="span" size="xs" tone="muted">
              Loads on its own as you scroll
            </Text>
          </>
        ) : (
          items.length > PRESET_PAGE_SIZE && (
            <Text size="xs" tone="muted">
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

function MapPresets() {
  const {
    now,
    filters,
    total,
    playerOptions,
    matching,
    spotlight,
    newArrivals,
  } = Route.useLoaderData();
  const navigate = Route.useNavigate();
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
      ? `${filters.players}-player maps`
      : "All maps";

  return (
    <MainAppShell>
      <div className={classes.page}>
        <header className={classes.head}>
          <div className={classes.titleRow}>
            <Heading variant="title" as="h1">
              Community maps
            </Heading>
            <Tag icon={<IconMap />} title={`${total} maps`}>
              {total}
            </Tag>
          </div>
          <Text size="sm" tone="muted">
            Maps built and shared by the community. Pick a player count to
            start.
          </Text>
          <PlayerPicker filters={filters} options={playerOptions} />
        </header>

        {spotlight && (
          <div className={classes.reveal}>
            <Spotlight preset={spotlight} liked={liked} onLike={handleLike} />
          </div>
        )}

        {newArrivals.length > 0 && (
          <section className={classes.shelf} aria-labelledby="new-arrivals">
            <div className={classes.sectionHead}>
              <span className={classes.shelfIcon} aria-hidden>
                <IconSparkles size={14} />
              </span>
              <Heading variant="section" as="h2" id="new-arrivals">
                New arrivals
              </Heading>
              <Text as="span" size="xs" tone="muted">
                Hot off the forge
              </Text>
            </div>
            <div className={classes.shelfRow}>
              {newArrivals.map((preset) => renderCard(preset))}
            </div>
          </section>
        )}

        <section className={classes.allMaps} aria-labelledby="all-maps">
          <div className={classes.sectionHead}>
            <Heading variant="section" as="h2" id="all-maps">
              {gridTitle}
            </Heading>
            <Text as="span" size="xs" tone="muted" numeric>
              {matching}
            </Text>
            {filters.author && (
              <ButtonLink
                to="/map-presets"
                search={withFilters(filters, { author: null })}
                variant="tertiary"
                size="sm"
                icon={<IconX size={14} />}
              >
                Show all authors
              </ButtonLink>
            )}
            <Segmented
              size="sm"
              label="Sort maps"
              value={filters.sort}
              onChange={(value) =>
                navigate({
                  search: withFilters(filters, { sort: value as SortMode }),
                  resetScroll: false,
                })
              }
              options={SORT_OPTIONS}
              className={classes.sortSeg}
            />
          </div>
          {!filters.author && (
            <Text size="xs" tone="muted">
              Showing up to two maps per author. Follow “more by” on a card to
              see the rest.
            </Text>
          )}
          <MapGrid filters={filters} renderCard={renderCard} />
        </section>
      </div>
    </MainAppShell>
  );
}
