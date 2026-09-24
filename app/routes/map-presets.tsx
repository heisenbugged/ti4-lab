import {
  ActionIcon,
  Box,
  Button,
  Group,
  SegmentedControl,
  Text,
} from "@mantine/core";
import { Link, MetaFunction, useLoaderData } from "react-router";
import { listPresetMaps } from "~/drizzle/presetMap.server";
import classes from "./map-presets/styles.module.css";
import {
  IconArrowRight,
  IconDiamond,
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconMap,
  IconPlanet,
  IconSparkles,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { MainAppShell } from "~/components/MainAppShell";
import {
  LegendaryDisplay,
  TechSkipsDisplay,
} from "~/components/PresetMapBadges";
import type { PresetMapRecord } from "~/drizzle/presetMap.server";
import {
  hiddenGems,
  isNewMap,
  latestMaps,
  pickMapOfTheDay,
  sortMaps,
  SortMode,
} from "~/utils/presetDiscovery";

export const meta: MetaFunction = () => [
  { title: "Community Maps - TI4 Lab" },
  {
    name: "description",
    content: "Browse community-created preset maps for Twilight Imperium 4.",
  },
];

type CardStats = { likes: number; views: number; liked: boolean };

const presetImageUrl = (preset: PresetMapRecord) =>
  preset.imageUrl ?? `/map-preset/${preset.id}.png`;

function playerCountLabel(mapConfigId: string): string | null {
  const match = mapConfigId.match(/(\d+)p/i);
  return match ? `${match[1]}P` : null;
}

function MapCard({
  preset,
  stats,
  onLike,
  isNew,
}: {
  preset: PresetMapRecord;
  stats: CardStats | undefined;
  onLike: (id: string) => void;
  isNew: boolean;
}) {
  const players = playerCountLabel(preset.mapConfigId);
  return (
    <Link to={`/maps/${preset.slug}`} className={classes.cardLink}>
      <div className={classes.card}>
        <div className={classes.mapPreviewWrap}>
          <Box
            component="img"
            src={presetImageUrl(preset)}
            alt={preset.name}
            className={classes.mapPreview}
          />
          {players && <span className={classes.playerChip}>{players}</span>}
          {isNew && <span className={classes.newBadge}>New</span>}
        </div>
        <div className={classes.cardContent}>
          <div className={classes.name}>{preset.name}</div>
          <div className={classes.authorTag}>
            <span className={classes.authorDot}>
              {preset.author.charAt(0).toUpperCase()}
            </span>
            {preset.author}
          </div>
          <div className={classes.mapStats}>
            {preset.avgSliceValue != null && (
              <span className={classes.stat}>
                <span className={classes.statValue}>
                  {preset.avgSliceValue}
                </span>
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
          <Group gap="xs" className={classes.statGroup}>
            <IconEye size={14} />
            <Text size="xs">{stats?.views ?? preset.views ?? 0}</Text>
          </Group>
          <Group gap={6} className={classes.statGroup}>
            <ActionIcon
              variant="subtle"
              color={stats?.liked ? "red" : "gray"}
              size="xs"
              className={classes.heartButton}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onLike(preset.id);
              }}
            >
              {stats?.liked ? (
                <IconHeartFilled size={14} />
              ) : (
                <IconHeart size={14} />
              )}
            </ActionIcon>
            <Text size="xs">{stats?.likes ?? preset.likes ?? 0}</Text>
          </Group>
          <Button
            component="a"
            href={`/map-generator?map=${encodeURIComponent(preset.mapString)}`}
            variant="subtle"
            color="blue"
            size="compact-xs"
            leftSection={<IconSparkles size={11} />}
            className={classes.genButton}
            onClick={(event) => event.stopPropagation()}
          >
            Generator
          </Button>
        </div>
      </div>
    </Link>
  );
}

function Spotlight({
  preset,
  stats,
  onLike,
}: {
  preset: PresetMapRecord;
  stats: CardStats | undefined;
  onLike: (id: string) => void;
}) {
  const players = playerCountLabel(preset.mapConfigId);
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
          <span>Map of the Day</span>
        </div>
        <h2 className={classes.spotlightName}>{preset.name}</h2>
        <div className={classes.spotlightAuthorRow}>
          <span className={classes.authorTag}>
            <span className={classes.authorDot}>
              {preset.author.charAt(0).toUpperCase()}
            </span>
            {preset.author}
          </span>
          {players && (
            <span className={classes.spotlightPlayers}>{players}</span>
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
          {(preset.legendaries ?? 0) > 0 && (
            <div className={classes.spotlightStat}>
              <LegendaryDisplay count={preset.legendaries} />
              <span className={classes.spotlightStatLabel}>Legendary</span>
            </div>
          )}
          {preset.techSkips && (
            <div className={classes.spotlightStat}>
              <TechSkipsDisplay techSkips={preset.techSkips} />
              <span className={classes.spotlightStatLabel}>Tech Skips</span>
            </div>
          )}
          <div className={classes.spotlightEngagement}>
            <span className={classes.spotlightEngagementItem}>
              <IconEye size={14} />
              {stats?.views ?? preset.views ?? 0}
            </span>
            <ActionIcon
              variant="subtle"
              color={stats?.liked ? "red" : "gray"}
              size="sm"
              className={classes.heartButton}
              onClick={() => onLike(preset.id)}
            >
              {stats?.liked ? (
                <IconHeartFilled size={14} />
              ) : (
                <IconHeart size={14} />
              )}
            </ActionIcon>
            <span className={classes.spotlightEngagementItem}>
              {stats?.likes ?? preset.likes ?? 0}
            </span>
          </div>
        </div>
        <Group gap="sm" mt="auto" pt="md">
          <Button
            component={Link}
            to={`/maps/${preset.slug}`}
            rightSection={<IconArrowRight size={14} />}
          >
            View Map
          </Button>
          <Button
            component="a"
            href={`/map-generator?map=${encodeURIComponent(preset.mapString)}`}
            variant="light"
            color="blue"
            leftSection={<IconSparkles size={14} />}
          >
            Open in Generator
          </Button>
        </Group>
      </div>
    </section>
  );
}

function Shelf({
  icon,
  title,
  subtitle,
  accent,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  accent: "teal" | "violet";
  children: React.ReactNode;
}) {
  return (
    <section className={classes.shelf} data-accent={accent}>
      <div className={classes.shelfHeader}>
        <span className={classes.shelfIcon}>{icon}</span>
        <h2 className={classes.shelfTitle}>{title}</h2>
        {subtitle && <span className={classes.shelfSubtitle}>{subtitle}</span>}
        <div className={classes.shelfRule} />
      </div>
      <div className={classes.shelfRow}>{children}</div>
    </section>
  );
}

const SORT_OPTIONS: { label: string; value: SortMode }[] = [
  { label: "Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Most Viewed", value: "views" },
  { label: "Most Liked", value: "likes" },
];

export const loader = async () => {
  const presets = await listPresetMaps();
  return { presets, now: Date.now() };
};

export default function MapPresets() {
  const { presets, now } = useLoaderData<typeof loader>();
  const [statsById, setStatsById] = useState<Record<string, CardStats>>(() =>
    Object.fromEntries(
      presets.map((preset) => [
        preset.id,
        {
          likes: preset.likes ?? 0,
          views: preset.views ?? 0,
          liked: false,
        },
      ]),
    ),
  );
  const [sortMode, setSortMode] = useState<SortMode>("trending");

  const spotlight = useMemo(
    () => pickMapOfTheDay(presets, now),
    [presets, now],
  );
  const newArrivals = useMemo(() => latestMaps(presets, 6), [presets]);
  const gems = useMemo(() => {
    const excludeIds = new Set([
      ...(spotlight ? [spotlight.id] : []),
      ...newArrivals.map((preset) => preset.id),
    ]);
    return hiddenGems(presets, excludeIds, 6);
  }, [presets, spotlight, newArrivals]);
  const sortedPresets = useMemo(
    () => sortMaps(presets, sortMode, now),
    [presets, sortMode, now],
  );

  const handleLike = async (id: string) => {
    const response = await fetch(`/api/preset-maps/${id}/like`, {
      method: "POST",
    });
    const result = await response.json().catch(() => null);
    if (!result?.success) return;

    setStatsById((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] ?? { likes: 0, views: 0, liked: false }),
        likes: result.likes ?? prev[id]?.likes ?? 0,
        liked: result.liked ?? prev[id]?.liked ?? false,
      },
    }));
  };

  const renderCard = (preset: PresetMapRecord) => (
    <MapCard
      key={preset.id}
      preset={preset}
      stats={statsById[preset.id]}
      onLike={handleLike}
      isNew={isNewMap(preset.createdAt, now)}
    />
  );

  return (
    <MainAppShell>
      <Box className={classes.page}>
        <div className={classes.header}>
          <div className={classes.headerRow}>
            <h1 className={classes.title}>Community Maps</h1>
            <span className={classes.badge}>
              <IconMap size={12} />
              {presets.length}
            </span>
          </div>
          <p className={classes.subtitle}>
            Maps built and shared by the community — a new spotlight every day.
          </p>
        </div>

        {spotlight && (
          <div className={classes.reveal}>
            <Spotlight
              preset={spotlight}
              stats={statsById[spotlight.id]}
              onLike={handleLike}
            />
          </div>
        )}

        {newArrivals.length > 0 && (
          <div className={classes.reveal} style={{ animationDelay: "80ms" }}>
            <Shelf
              icon={<IconSparkles size={14} />}
              title="New Arrivals"
              subtitle="Hot off the forge"
              accent="teal"
            >
              {newArrivals.map((preset) => (
                <div key={preset.id} className={classes.shelfItem}>
                  {renderCard(preset)}
                </div>
              ))}
            </Shelf>
          </div>
        )}

        {gems.length > 0 && (
          <div className={classes.reveal} style={{ animationDelay: "160ms" }}>
            <Shelf
              icon={<IconDiamond size={14} />}
              title="Hidden Gems"
              subtitle="Loved by those who found them"
              accent="violet"
            >
              {gems.map((preset) => (
                <div key={preset.id} className={classes.shelfItem}>
                  {renderCard(preset)}
                </div>
              ))}
            </Shelf>
          </div>
        )}

        <section
          className={`${classes.allMaps} ${classes.reveal}`}
          style={{ animationDelay: "240ms" }}
        >
          <div className={classes.allMapsHeader}>
            <h2 className={classes.allMapsTitle}>All Maps</h2>
            <SegmentedControl
              size="xs"
              value={sortMode}
              onChange={(value) => setSortMode(value as SortMode)}
              data={SORT_OPTIONS}
              className={classes.sortControl}
            />
          </div>
          <div className={classes.grid}>{sortedPresets.map(renderCard)}</div>
        </section>
      </Box>
    </MainAppShell>
  );
}
