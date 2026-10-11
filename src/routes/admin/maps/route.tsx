import { Heading, Segmented, Stack, Switch, Tag, Text, TextInput } from "~/ui";
import styles from "./styles.module.css";
import { IconSearch, IconStarFilled } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import {
  listPresetMaps,
  PresetMapListing,
  setPresetMapFlags,
} from "~/drizzle/presetMap.server";
import { requireAdmin } from "~/server/admin.functions";
import { expectRecord, expectString } from "~/server/validate";
import { sortMaps } from "~/utils/presetDiscovery";

type Flag = "hidden" | "featured";
type View = "all" | "listed" | Flag;

const getAdminMaps = createServerFn()
  .middleware([requireAdmin])
  .handler(async () => {
    const maps = await listPresetMaps({ includeHidden: true });
    return { maps: sortMaps(maps, "played") };
  });

const setMapFlag = createServerFn({ method: "POST" })
  .middleware([requireAdmin])
  .validator((input: { id: string; flag: Flag; value: boolean }) => {
    expectRecord(input);
    if (input.flag !== "hidden" && input.flag !== "featured") {
      throw new Error("Unknown flag");
    }
    return {
      id: expectString(input.id, "Map ID"),
      flag: input.flag,
      value: input.value === true,
    };
  })
  .handler(async ({ data: { id, flag, value } }) => {
    await setPresetMapFlags(id, { [flag]: value });
  });

export const Route = createFileRoute("/admin/maps")({
  loader: () => getAdminMaps(),
  head: () => ({ meta: [{ title: "Maps - Admin - TI4 Lab" }] }),
  component: AdminMaps,
});

function FlagSwitch({
  map,
  flag,
  label,
}: {
  map: PresetMapListing;
  flag: Flag;
  label: string;
}) {
  const router = useRouter();
  const toggle = useMutation({
    mutationFn: (value: boolean) =>
      setMapFlag({ data: { id: map.id, flag, value } }),
    onSettled: () => router.invalidate(),
  });
  // Optimistic while the toggle is in flight.
  const checked = toggle.isPending ? toggle.variables : map[flag];
  return (
    <Switch
      checked={checked}
      aria-label={`${label} ${map.name}`}
      onChange={(next) => toggle.mutate(next)}
    />
  );
}

function AdminMaps() {
  const { maps } = Route.useLoaderData();
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
                  <Link to="/maps/$slug" params={{ slug: map.slug }} className={styles.link}>
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
