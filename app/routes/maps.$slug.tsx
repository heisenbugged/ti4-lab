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
import {
  Button,
  ButtonAnchor,
  ButtonLink,
  Heading,
  Text,
  cx,
  notify,
} from "~/ui";

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

    navigate("/draft/new", {
      state: {
        draftSettings: result.value.settings,
        players: result.value.players,
        discordData: undefined,
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
              <b>{preset.views}</b>
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
            <ButtonAnchor
              href={mapGeneratorHref(preset.mapString)}
              block
              icon={<IconSparkles size={16} />}
            >
              Open in map generator
            </ButtonAnchor>
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
