import { requireAdmin } from "~/utils/adminAuth.server";
import {
  Row,
  SectionHeader,
  Segmented,
  Stack,
  Switch,
  Table,
  Text,
  TextInput,
} from "~/ui";
import styles from "./styles.module.css";
import { IconSearch } from "@tabler/icons-react";
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

  return (
    <Stack gap={4}>
      <SectionHeader title="Community maps" meta={`${maps.length} maps`} />
      <Text size="sm" tone="muted">
        Hidden maps stay reachable by link but leave the community listing.
        Featured maps become the only candidates for map of the day.
      </Text>
      <Row gap={3}>
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
            { label: `All (${maps.length})`, value: "all" },
            { label: `Listed (${maps.length - hiddenCount})`, value: "listed" },
            { label: `Hidden (${hiddenCount})`, value: "hidden" },
            { label: `Featured (${featuredCount})`, value: "featured" },
          ]}
        />
      </Row>
      <Table striped dense minWidth={900}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th className={styles.num}>Players</Table.Th>
            <Table.Th className={styles.num}>Drafts</Table.Th>
            <Table.Th className={styles.num}>Views</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Hidden</Table.Th>
            <Table.Th>Featured</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {visible.map((map) => (
            <Table.Tr
              key={map.id}
              className={map.hidden ? styles.hiddenRow : undefined}
            >
              <Table.Td className={styles.nameCell}>
                <Link to={`/maps/${map.slug}`} className={styles.link}>
                  {map.name}
                </Link>
                {map.description && (
                  <Text size="xs" tone="muted" truncate>
                    {map.description}
                  </Text>
                )}
              </Table.Td>
              <Table.Td>{map.author}</Table.Td>
              <Table.Td numeric className={styles.num}>
                {map.playerCount}
              </Table.Td>
              <Table.Td numeric className={styles.num}>
                {map.draftCount}
              </Table.Td>
              <Table.Td numeric className={styles.num}>
                {map.views}
              </Table.Td>
              <Table.Td>{map.createdAt.slice(0, 10)}</Table.Td>
              <Table.Td>
                <FlagSwitch map={map} flag="hidden" label="Hide" />
              </Table.Td>
              <Table.Td>
                <FlagSwitch map={map} flag="featured" label="Feature" />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </Stack>
  );
}
