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
import {
  Button,
  ButtonAnchor,
  ButtonLink,
  Heading,
  Segmented,
  Spinner,
  Tag,
  Text,
  cx,
} from "~/ui";

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
        <Link to={`/maps/${preset.slug}`} className={classes.cardTitle}>
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
        <ButtonAnchor
          href={mapGeneratorHref(preset.mapString)}
          variant="tertiary"
          size="sm"
          icon={<IconSparkles size={14} />}
          className={classes.cardGen}
        >
          Generator
        </ButtonAnchor>
      </div>
      {moreByAuthor > 0 && (
        <Link
          to={browseHref(filters, { author: preset.author })}
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
        to={`/maps/${preset.slug}`}
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
            to={`/maps/${preset.slug}`}
            variant="primary"
            iconRight={<IconArrowRight size={16} />}
          >
            View map
          </ButtonLink>
          <ButtonAnchor
            href={mapGeneratorHref(preset.mapString)}
            icon={<IconSparkles size={16} />}
          >
            Open in generator
          </ButtonAnchor>
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
  const navigate = useNavigate();
  return (
    <div className={classes.filter}>
      <Text as="span" size="sm" tone="muted" weight={600}>
        Players
      </Text>
      <Segmented
        label="Number of players"
        value={filters.players == null ? "any" : String(filters.players)}
        onChange={(value) =>
          navigate(
            browseHref(filters, {
              players: value === "any" ? null : Number(value),
            }),
            { preventScrollReset: true },
          )
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

  // Append each page once as it lands.
  const [appendedPage, setAppendedPage] = useState(fetcher.data);
  if (fetcher.data && fetcher.data !== appendedPage) {
    const page = fetcher.data;
    setAppendedPage(page);
    setHasMore(page.hasMore);
    const seen = new Set(items.map((preset) => preset.id));
    setItems([
      ...items,
      ...page.items.filter((preset) => !seen.has(preset.id)),
    ]);
  }

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
          <Spinner size={18} />
        ) : hasMore ? (
          <>
            <Button size="sm" onClick={loadMore}>
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
                to={browseHref(filters, { author: null })}
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
                navigate(browseHref(filters, { sort: value as SortMode }), {
                  preventScrollReset: true,
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
          {firstPage.length === 0 ? (
            <div className={classes.empty}>
              <IconMap size={28} className={classes.emptyIcon} />
              <Text size="md" weight={600}>
                No {filters.players ? `${filters.players}-player ` : ""}maps
                yet.
              </Text>
              <ButtonAnchor
                href="/map-generator"
                icon={<IconSparkles size={16} />}
              >
                Build one in the map generator
              </ButtonAnchor>
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
      </div>
    </MainAppShell>
  );
}
