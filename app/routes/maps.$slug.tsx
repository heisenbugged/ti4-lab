import { ActionIcon, Box, Button, Stack, Text } from "@mantine/core";
import {
  LoaderFunctionArgs,
  MetaFunction,
  useLoaderData,
  useNavigate,
} from "react-router";
import {
  presetMapBySlug,
  incrementPresetMapViews,
} from "~/drizzle/presetMap.server";
import {
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconPlayerPlay,
  IconSparkles,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { buildPresetDraftState } from "~/mapgen/utils/presetDraft";
import { notifications } from "@mantine/notifications";
import { MainAppShell } from "~/components/MainAppShell";
import {
  LegendaryDisplay,
  TechSkipsDisplay,
} from "~/components/PresetMapBadges";
import {
  getAllSliceValues,
  getAllSliceStats,
  getAllSliceBreakdowns,
  getAllTileContributions,
} from "~/mapgen/utils/sliceScoring";
import classes from "./maps/styles.module.css";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const slug = params.slug;
  if (!slug) {
    throw new Response("Map slug required", { status: 400 });
  }

  const preset = await presetMapBySlug(slug);
  if (!preset) {
    throw new Response("Map not found", { status: 404 });
  }

  // Increment views
  const views = await incrementPresetMapViews(preset.id);

  // Get client IP for like status (simplified - in production use proper IP detection)
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("cf-connecting-ip") ??
    "unknown";

  return {
    preset: { ...preset, views },
    ip,
  };
};

type LoaderData = {
  preset: {
    id: string;
    slug: string;
    name: string;
    description: string;
    author: string;
    imageUrl: string | null;
  };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  const typed = data as LoaderData | undefined;
  if (!typed) return [];

  const { preset } = typed;
  const title = `${preset.name} - TI4 Lab`;
  const description = preset.description
    ? `${preset.description} — by ${preset.author}`
    : `Map by ${preset.author}`;
  const imageUrl =
    preset.imageUrl ?? `https://tidraft.com/map-preset/${preset.id}.png`;
  const url = `https://tidraft.com/maps/${preset.slug}`;

  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:image", content: imageUrl },
    { property: "og:url", content: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "TI4 Lab" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: imageUrl },
  ];
};

export default function MapDetail() {
  const { preset, ip } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    likes: preset.likes,
    views: preset.views,
    liked: false,
  });

  const decoded = useMemo(() => {
    return decodeMapString(preset.mapString);
  }, [preset.mapString]);

  // Compute slice stats for the map
  const sliceValues = useMemo(
    () => (decoded ? getAllSliceValues(decoded.map) : {}),
    [decoded],
  );
  const sliceStats = useMemo(
    () => (decoded ? getAllSliceStats(decoded.map) : {}),
    [decoded],
  );
  const sliceBreakdowns = useMemo(
    () => (decoded ? getAllSliceBreakdowns(decoded.map) : {}),
    [decoded],
  );
  const tileContributions = useMemo(
    () => (decoded ? getAllTileContributions(decoded.map) : {}),
    [decoded],
  );
  const handleLike = async () => {
    const response = await fetch(`/api/preset-maps/${preset.id}/like`, {
      method: "POST",
    });
    const result = await response.json().catch(() => null);
    if (!result?.success) return;

    setStats((prev) => ({
      ...prev,
      likes: result.likes ?? prev.likes,
      liked: result.liked ?? prev.liked,
    }));
  };

  const handleStartDraft = () => {
    if (!decoded) {
      notifications.show({
        title: "Invalid map",
        message: "Unable to load the map data.",
        color: "red",
      });
      return;
    }

    const playerCount = decoded.map.filter(
      (tile) => tile.type === "HOME",
    ).length;

    const result = buildPresetDraftState({
      map: decoded.map,
      mapConfigId: preset.mapConfigId,
      gameSets: decoded.gameSets,
      playerCount,
    });

    if (!result.ok) {
      const isMissingPlayers = result.error.includes("home systems");
      notifications.show({
        title: isMissingPlayers ? "Missing players" : "Unsupported",
        message: result.error,
        color: isMissingPlayers ? "yellow" : "red",
      });
      return;
    }

    navigate("/draft/new", {
      state: {
        draftSettings: result.value.settings,
        players: result.value.players,
        discordData: undefined,
      },
    });
  };

  if (!decoded) {
    return (
      <MainAppShell>
        <Box p="xl">
          <Text c="red">Failed to decode map data.</Text>
        </Box>
      </MainAppShell>
    );
  }

  return (
    <MainAppShell>
      <Box className={classes.page}>
        <div className={classes.grid}>
          <div className={classes.mapColumn}>
            <Box className={classes.mapContainer}>
              <Map
                id="map-detail"
                modifiableMapTiles={[]}
                map={decoded.map}
                disabled
                interactions={MAP_INTERACTIONS.readonly}
                sliceValues={sliceValues}
                sliceStats={sliceStats}
                sliceBreakdowns={sliceBreakdowns}
                tileContributions={tileContributions}
              />
            </Box>
          </div>
          <div className={classes.sidebarColumn}>
            <Stack gap="lg">
              <Button
                variant="subtle"
                color="gray"
                size="sm"
                leftSection={<IconArrowLeft size={14} />}
                onClick={() => navigate("/map-presets")}
                className={classes.backButton}
              >
                Back to Maps
              </Button>

              <Stack gap={4}>
                <h1 className={classes.title}>{preset.name}</h1>
                <span className={classes.author}>By {preset.author}</span>
              </Stack>

              {preset.description && (
                <p className={classes.description}>{preset.description}</p>
              )}

              {/* Map Stats */}
              <div className={classes.mapStatsRow}>
                {preset.avgSliceValue != null && (
                  <div className={classes.mapStatItem}>
                    <Text size="lg" fw={700} c="white">
                      {preset.avgSliceValue}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Avg Slice
                    </Text>
                  </div>
                )}
                {preset.totalResources != null &&
                  preset.totalInfluence != null && (
                    <div className={classes.mapStatItem}>
                      <Text size="lg" fw={700} c="white">
                        {preset.totalResources}/{preset.totalInfluence}
                      </Text>
                      <Text size="xs" c="dimmed">
                        R/I
                      </Text>
                    </div>
                  )}
                {(preset.legendaries ?? 0) > 0 && (
                  <div className={classes.mapStatItem}>
                    <LegendaryDisplay count={preset.legendaries} size="md" />
                    <Text size="xs" c="dimmed">
                      Legendary
                    </Text>
                  </div>
                )}
                {preset.techSkips && (
                  <div className={classes.mapStatItem}>
                    <TechSkipsDisplay techSkips={preset.techSkips} size="md" />
                    <Text size="xs" c="dimmed">
                      Tech Skips
                    </Text>
                  </div>
                )}
              </div>

              <div className={classes.statsRow}>
                <div className={classes.statItem}>
                  <IconEye size={16} style={{ opacity: 0.6 }} />
                  <Text size="sm" fw={500}>
                    {stats.views}
                  </Text>
                  <Text size="xs" c="dimmed">
                    views
                  </Text>
                </div>
                <div className={classes.statItem}>
                  <ActionIcon
                    variant="subtle"
                    color={stats.liked ? "red" : "gray"}
                    className={classes.heartButton}
                    onClick={handleLike}
                  >
                    {stats.liked ? (
                      <IconHeartFilled size={16} />
                    ) : (
                      <IconHeart size={16} />
                    )}
                  </ActionIcon>
                  <Text size="sm" fw={500}>
                    {stats.likes}
                  </Text>
                  <Text size="xs" c="dimmed">
                    likes
                  </Text>
                </div>
              </div>

              <Stack gap="sm" mt="md">
                <Button
                  onClick={handleStartDraft}
                  size="lg"
                  fullWidth
                  leftSection={<IconPlayerPlay size={18} />}
                >
                  Start Draft
                </Button>

                <Button
                  component="a"
                  href={`/map-generator?map=${encodeURIComponent(
                    preset.mapString,
                  )}`}
                  variant="light"
                  color="blue"
                  size="sm"
                  fullWidth
                  leftSection={<IconSparkles size={14} />}
                >
                  Open in Map Generator
                </Button>
              </Stack>
            </Stack>
          </div>
        </div>
      </Box>
    </MainAppShell>
  );
}
