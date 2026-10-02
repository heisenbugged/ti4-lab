import { ActionIcon, Box, Button, Stack, Text } from "@mantine/core";
import {
  LoaderFunctionArgs,
  MetaFunction,
  useLoaderData,
  useNavigate,
} from "react-router";
import {
  presetMapBySlug,
  recordPresetMapView,
} from "~/drizzle/presetMap.server";
import { getRequestIp, isNonHumanRequest } from "~/utils/request.server";
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
  parseTechSkips,
  TechSkipsDisplay,
} from "~/components/PresetMapBadges";
import { playerCountFromMapString } from "~/utils/presetFingerprint";
import {
  mapGeneratorHref,
  postPresetMapLike,
  presetImageUrl,
} from "~/utils/presetMapClient";
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

  const views = isNonHumanRequest(request)
    ? preset.views
    : recordPresetMapView(preset.id, getRequestIp(request));

  return { preset: { ...preset, views } };
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) return [];

  const { preset } = data;
  const title = `${preset.name} - TI4 Lab`;
  const description = preset.description
    ? `${preset.description} — by ${preset.author}`
    : `Map by ${preset.author}`;
  const imageUrl = presetImageUrl(preset, "https://tidraft.com");
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
  const { preset } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const [likes, setLikes] = useState(preset.likes);
  const [liked, setLiked] = useState(false);

  const decoded = useMemo(() => {
    return decodeMapString(preset.mapString);
  }, [preset.mapString]);

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
    const total = await postPresetMapLike(preset.id);
    if (total == null) return;
    setLikes(total);
    setLiked(true);
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

    const playerCount = playerCountFromMapString(preset.mapString);

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
                {!!preset.legendaries && (
                  <div className={classes.mapStatItem}>
                    <LegendaryDisplay count={preset.legendaries} size="md" />
                    <Text size="xs" c="dimmed">
                      Legendary
                    </Text>
                  </div>
                )}
                {parseTechSkips(preset.techSkips) && (
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
                  <IconPlayerPlay size={16} style={{ opacity: 0.6 }} />
                  <Text size="sm" fw={500}>
                    {preset.draftCount}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {preset.draftCount === 1 ? "draft" : "drafts"}
                  </Text>
                </div>
                <div className={classes.statItem}>
                  <IconEye size={16} style={{ opacity: 0.6 }} />
                  <Text size="sm" fw={500}>
                    {preset.views}
                  </Text>
                  <Text size="xs" c="dimmed">
                    views
                  </Text>
                </div>
                <div className={classes.statItem}>
                  <ActionIcon
                    variant="subtle"
                    color={liked ? "red" : "gray"}
                    className={classes.heartButton}
                    onClick={handleLike}
                  >
                    {liked ? (
                      <IconHeartFilled size={16} />
                    ) : (
                      <IconHeart size={16} />
                    )}
                  </ActionIcon>
                  <Text size="sm" fw={500}>
                    {likes}
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
                  href={mapGeneratorHref(preset.mapString)}
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
