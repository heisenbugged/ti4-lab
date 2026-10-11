import { createFileRoute } from "@tanstack/react-router";
import { getPresetMap, recordPresetView } from "~/server/presetMaps.functions";
import type { PresetMapRecord } from "~/drizzle/presetMap.server";
import "~/routes/draft/new/-handoff";
import {
  IconEye,
  IconHeart,
  IconHeartFilled,
  IconPlayerPlay,
  IconSparkles,
  IconArrowLeft,
} from "@tabler/icons-react";
import { useEffect, useMemo, useState } from "react";
import { decodeMapString } from "~/mapgen/utils/mapStringCodec";
import { Map, MAP_INTERACTIONS } from "~/components/Map";
import { buildPresetDraftState } from "~/mapgen/utils/presetDraft";
import { MainAppShell } from "~/components/MainAppShell";
import {
  LegendaryDisplay,
  parseTechSkips,
  TechSkipsDisplay,
} from "~/components/PresetMapBadges";
import { playerCountFromMapString } from "~/utils/presetFingerprint";
import { postPresetMapLike, presetImageUrl } from "~/utils/presetMapClient";
import {
  getAllSliceValues,
  getAllSliceStats,
  getAllSliceBreakdowns,
  getAllTileContributions,
} from "~/mapgen/utils/sliceScoring";
import classes from "./styles.module.css";
import {
  Button,
  ButtonLink,
  Heading,
  Text,
  cx,
  notify,
} from "~/ui";

export const Route = createFileRoute("/maps/$slug")({
  loader: async ({ params }) => ({
    preset: await getPresetMap({ data: params.slug }),
  }),
  head: ({ loaderData }) => ({
    meta: loaderData ? presetMeta(loaderData.preset) : [],
  }),
  component: MapDetail,
});

function presetMeta(preset: PresetMapRecord) {
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
}

function MapDetail() {
  const { preset } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  const [likes, setLikes] = useState(preset.likes);
  const [views, setViews] = useState(preset.views);

  useEffect(() => {
    recordPresetView({ data: preset.id }).then(setViews, () => {});
  }, [preset.id]);
  const [liked, setLiked] = useState(false);

  const decoded = useMemo(
    () => decodeMapString(preset.mapString),
    [preset.mapString],
  );
  const scoring = useMemo(
    () =>
      decoded && {
        sliceValues: getAllSliceValues(decoded.map),
        sliceStats: getAllSliceStats(decoded.map),
        sliceBreakdowns: getAllSliceBreakdowns(decoded.map),
        tileContributions: getAllTileContributions(decoded.map),
      },
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
      notify({
        title: "Invalid map",
        message: "Unable to load the map data.",
        tone: "danger",
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
      notify({
        title: isMissingPlayers ? "Missing players" : "Unsupported",
        message: result.error,
        tone: isMissingPlayers ? "warning" : "danger",
      });
      return;
    }

    navigate({
      to: "/draft/new",
      state: {
        newDraft: {
          draftSettings: result.value.settings,
          players: result.value.players,
        },
      },
    });
  };

  if (!decoded || !scoring) {
    return (
      <MainAppShell>
        <Text tone="danger">Failed to decode map data.</Text>
      </MainAppShell>
    );
  }

  const techSkips = parseTechSkips(preset.techSkips);

  return (
    <MainAppShell>
      <div className={classes.page}>
        <div className={classes.mapWell}>
          <div className={classes.mapBox}>
            <Map
              id="map-detail"
              modifiableMapTiles={[]}
              map={decoded.map}
              disabled
              interactions={MAP_INTERACTIONS.readonly}
              {...scoring}
            />
          </div>
        </div>
        <aside className={classes.side}>
          <ButtonLink
            to="/map-presets"
            variant="tertiary"
            size="sm"
            icon={<IconArrowLeft size={14} />}
            className={classes.back}
          >
            Back to maps
          </ButtonLink>

          <div className={classes.titleBlock}>
            <Heading variant="title" as="h1">
              {preset.name}
            </Heading>
            <Text size="sm" tone="muted">
              By {preset.author}
            </Text>
          </div>

          {preset.description && (
            <Text className={classes.description}>{preset.description}</Text>
          )}

          <div className={classes.tiles}>
            {preset.avgSliceValue != null && (
              <div>
                <b className={classes.tileValue}>{preset.avgSliceValue}</b>
                <span className={classes.tileLabel}>Avg slice</span>
              </div>
            )}
            {preset.totalResources != null && preset.totalInfluence != null && (
              <div>
                <b className={classes.tileValue}>
                  {preset.totalResources}/{preset.totalInfluence}
                </b>
                <span className={classes.tileLabel}>R/I</span>
              </div>
            )}
            {!!preset.legendaries && (
              <div>
                <span className={classes.tileGlyphs}>
                  <LegendaryDisplay count={preset.legendaries} size="md" />
                </span>
                <span className={classes.tileLabel}>Legendary</span>
              </div>
            )}
            {techSkips && (
              <div>
                <span className={classes.tileGlyphs}>
                  <TechSkipsDisplay techSkips={preset.techSkips} size="md" />
                </span>
                <span className={classes.tileLabel}>Tech skips</span>
              </div>
            )}
          </div>

          <div className={classes.engagement}>
            <span>
              <IconPlayerPlay />
              <b>{preset.draftCount}</b>
              {preset.draftCount === 1 ? "draft" : "drafts"}
            </span>
            <span>
              <IconEye />
              <b>{views}</b>
              views
            </span>
            <button
              type="button"
              className={cx(classes.like, liked && classes.liked)}
              onClick={handleLike}
              aria-pressed={liked}
              aria-label={liked ? "Liked" : `Like ${preset.name}`}
            >
              {liked ? <IconHeartFilled /> : <IconHeart />}
              <b>{likes}</b>
              likes
            </button>
          </div>

          <div className={classes.actions}>
            <Button
              variant="primary"
              size="lg"
              block
              onClick={handleStartDraft}
              icon={<IconPlayerPlay size={18} />}
            >
              Start draft
            </Button>
            <ButtonLink
              to="/map-generator"
              search={{ map: preset.mapString }}
              block
              icon={<IconSparkles size={16} />}
            >
              Open in map generator
            </ButtonLink>
          </div>
          <Text size="xs" tone="muted">
            Home systems show each seat&apos;s slice value, optimal R/I and tech
            skips.
          </Text>
        </aside>
      </div>
    </MainAppShell>
  );
}
