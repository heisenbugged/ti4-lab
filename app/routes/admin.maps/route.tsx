import { requireAdmin } from "~/utils/adminAuth.server";
import { Heading, Segmented, Stack, Switch, Tag, Text, TextInput } from "~/ui";
import styles from "./styles.module.css";
import { IconSearch, IconStarFilled } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  ActionFunctionArgs,
  data,
  Link,
  LoaderFunctionArgs,
  MetaFunction,
  useFetcher,
  useLoaderData,
} from "react-router";
import {
  listPresetMaps,
  PresetMapListing,
  setPresetMapFlags,
} from "~/drizzle/presetMap.server";
import { sortMaps } from "~/utils/presetDiscovery";

export const meta: MetaFunction = () => [{ title: "Maps - Admin - TI4 Lab" }];

type Flag = "hidden" | "featured";
type View = "all" | "listed" | Flag;

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);
  const maps = await listPresetMaps({ includeHidden: true });
  return { maps: sortMaps(maps, "played") };
};

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const form = await request.formData();
  const id = form.get("id")?.toString();
  const flag = form.get("flag")?.toString();
  const value = form.get("value") === "true";
  if (!id || (flag !== "hidden" && flag !== "featured")) {
    return data({ ok: false }, { status: 400 });
  }
  await setPresetMapFlags(id, { [flag]: value });
  return data({ ok: true });
}

function FlagSwitch({
  map,
  flag,
  label,
}: {
  map: PresetMapListing;
  flag: Flag;
  label: string;
}) {
  const fetcher = useFetcher();
  // Optimistic while the toggle is in flight.
  const pending = fetcher.formData?.get("value");
  const checked = pending != null ? pending === "true" : map[flag];
  return (
    <Switch
      checked={checked}
      aria-label={`${label} ${map.name}`}
      onChange={(next) =>
        fetcher.submit(
          { id: map.id, flag, value: String(next) },
          { method: "post" },
        )
      }
    />
  );
}

export default function AdminMaps() {
  const { maps } = useLoaderData<typeof loader>();
  const [search, setSearch] = useState("");
  const [view, setView] = useState<View>("all");

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return maps.filter((map) => {
      if (view === "listed" && map.hidden) return false;
      if (view === "hidden" && !map.hidden) return false;
      if (view === "featured" && !map.featured) return false;
      if (!needle) return true;
      return (
        map.name.toLowerCase().includes(needle) ||
        map.author.toLowerCase().includes(needle)
      );
    });
  }, [maps, search, view]);

  const hiddenCount = maps.filter((map) => map.hidden).length;
  const featuredCount = maps.filter((map) => map.featured).length;
  const totalDrafts = maps.reduce((sum, map) => sum + map.draftCount, 0);

  return (
    <Stack gap={4}>
      <header>
        <Heading variant="title">Community maps</Heading>
        <Text size="sm" tone="muted" className={styles.lede}>
          Hidden maps stay reachable by link but leave the public listing. When
          any map is featured, map of the day only picks from featured maps.
        </Text>
      </header>

      <dl className={styles.stats}>
        <div>
          <dt>Maps</dt>
          <dd>{maps.length}</dd>
        </div>
        <div>
          <dt>Listed</dt>
          <dd>{maps.length - hiddenCount}</dd>
        </div>
        <div>
          <dt>Hidden</dt>
          <dd>{hiddenCount}</dd>
        </div>
        <div>
          <dt>Featured</dt>
          <dd>{featuredCount}</dd>
        </div>
        <div>
          <dt>Drafts played on them</dt>
          <dd>{totalDrafts.toLocaleString()}</dd>
        </div>
      </dl>

      <div className={styles.toolbar}>
        <TextInput
          placeholder="Search name or author"
          aria-label="Search name or author"
          leftIcon={<IconSearch size={14} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          className={styles.search}
        />
        <Segmented
          label="Filter maps"
          size="sm"
          value={view}
          onChange={(value) => setView(value as View)}
          options={[
            { label: "All", value: "all" },
            { label: "Listed", value: "listed" },
            { label: "Hidden", value: "hidden" },
            { label: "Featured", value: "featured" },
          ]}
        />
        <Text size="sm" tone="muted" className={styles.showing}>
          {visible.length} of {maps.length}
        </Text>
      </div>

      {visible.length === 0 ? (
        <div className={styles.empty}>
          <IconSearch size={24} />
          <Text weight={600}>No maps match</Text>
        </div>
      ) : (
        <ul className={styles.list}>
          <li className={styles.headRow} aria-hidden>
            <span>Map</span>
            <span className={styles.num}>Players</span>
            <span className={styles.num}>Drafts</span>
            <span className={styles.num}>Views</span>
            <span>Created</span>
            <span>Hidden</span>
            <span>Featured</span>
          </li>
          {visible.map((map) => (
            <li key={map.id} className={styles.row}>
              <div className={styles.mapCell}>
                <div className={styles.titleLine}>
                  <Link to={`/maps/${map.slug}`} className={styles.link}>
                    {map.name}
                  </Link>
                  {map.hidden && <Tag>Hidden</Tag>}
                  {map.featured && (
                    <Tag tone="gold" icon={<IconStarFilled size={11} />}>
                      Featured
                    </Tag>
                  )}
                </div>
                <span className={styles.author}>by {map.author}</span>
                {map.description && (
                  <span className={styles.desc}>{map.description}</span>
                )}
              </div>
              <span className={styles.num} data-label="Players">
                {map.playerCount}P
              </span>
              <span className={styles.num} data-label="Drafts">
                {map.draftCount}
              </span>
              <span className={styles.num} data-label="Views">
                {map.views}
              </span>
              <span className={styles.date} data-label="Created">
                {formatDate(map.createdAt)}
              </span>
              <span className={styles.flag}>
                <FlagSwitch map={map} flag="hidden" label="Hide" />
                <small>Hidden</small>
              </span>
              <span className={styles.flag}>
                <FlagSwitch map={map} flag="featured" label="Feature" />
                <small>Featured</small>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Stack>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
