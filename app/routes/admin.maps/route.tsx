import {
  Anchor,
  Box,
  Group,
  SegmentedControl,
  Switch,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import {
  ActionFunctionArgs,
  data,
  Link,
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

export const loader = async () => {
  const maps = await listPresetMaps({ includeHidden: true });
  return { maps: sortMaps(maps, "played") };
};

export async function action({ request }: ActionFunctionArgs) {
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
      size="xs"
      checked={checked}
      aria-label={`${label} ${map.name}`}
      onChange={(event) =>
        fetcher.submit(
          { id: map.id, flag, value: String(event.currentTarget.checked) },
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
    <Box p="md">
      <Title order={2} mb="xs">
        Community maps
      </Title>
      <Text size="sm" c="dimmed" mb="md">
        Hidden maps stay reachable by link but leave the community listing.
        Featured maps become the only candidates for map of the day.
      </Text>
      <Group mb="md" gap="sm">
        <TextInput
          placeholder="Search name or author"
          leftSection={<IconSearch size={14} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
          w={280}
        />
        <SegmentedControl
          size="xs"
          value={view}
          onChange={(value) => setView(value as View)}
          data={[
            { label: `All (${maps.length})`, value: "all" },
            { label: `Listed (${maps.length - hiddenCount})`, value: "listed" },
            { label: `Hidden (${hiddenCount})`, value: "hidden" },
            { label: `Featured (${featuredCount})`, value: "featured" },
          ]}
        />
      </Group>
      <Table striped highlightOnHover verticalSpacing={4} fz="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Author</Table.Th>
            <Table.Th ta="right">Players</Table.Th>
            <Table.Th ta="right">Drafts</Table.Th>
            <Table.Th ta="right">Views</Table.Th>
            <Table.Th>Created</Table.Th>
            <Table.Th>Hidden</Table.Th>
            <Table.Th>Featured</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {visible.map((map) => (
            <Table.Tr key={map.id} opacity={map.hidden ? 0.55 : 1}>
              <Table.Td maw={320}>
                <Anchor component={Link} to={`/maps/${map.slug}`} size="sm">
                  {map.name}
                </Anchor>
                {map.description && (
                  <Text size="xs" c="dimmed" lineClamp={1}>
                    {map.description}
                  </Text>
                )}
              </Table.Td>
              <Table.Td>{map.author}</Table.Td>
              <Table.Td ta="right">{map.playerCount}</Table.Td>
              <Table.Td ta="right">{map.draftCount}</Table.Td>
              <Table.Td ta="right">{map.views}</Table.Td>
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
    </Box>
  );
}
