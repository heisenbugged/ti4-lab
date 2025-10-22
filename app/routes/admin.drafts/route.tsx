import {
  Button,
  Card,
  Grid,
  Group,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { ActionFunctionArgs, json, LoaderFunctionArgs } from "@remix-run/node";
import {
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "@remix-run/react";
import { findDrafts } from "~/drizzle/draft.server";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { FormEvent, useMemo } from "react";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  SortingState,
  ColumnFiltersState,
} from "@tanstack/react-table";

type DraftRow = {
  id: string;
  urlName: string | null;
  type: string | null;
  isComplete: boolean;
  currentPick: number;
  players: string;
  createdAt: string;
};

export default function AdminDraftsIndex() {
  const { drafts: draftsData, totalPages, currentPage, stats } =
    useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();

  const data: DraftRow[] = useMemo(
    () =>
      draftsData.map((d) => ({
        id: d.id,
        urlName: d.urlName,
        type: d.type,
        isComplete: !!d.isComplete,
        currentPick: d.data.selections?.length || 0,
        players: d.data.players?.map((p) => p.name).join(", ") || "",
        createdAt: d.createdAt,
      })),
    [draftsData],
  );

  const columnHelper = createColumnHelper<DraftRow>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("id", {
        header: "Draft ID",
        cell: (info) => info.getValue().substring(0, 8),
      }),
      columnHelper.accessor("urlName", {
        header: "URL Name",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => info.getValue() || "-",
      }),
      columnHelper.accessor("isComplete", {
        header: "Complete",
        cell: (info) => (info.getValue() ? "Yes" : "No"),
      }),
      columnHelper.accessor("currentPick", {
        header: "Current Pick",
        cell: (info) => info.getValue(),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (props) => {
          const draft = draftsData[props.row.index];
          const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const result = confirm("Are you sure you want to delete this draft?");
            if (result) {
              submit(new FormData(e.currentTarget), { method: "delete" });
            }
          };

          return (
            <Group gap={4}>
              <Link to={`/draft/${draft.urlName ?? draft.id}`}>
                <Button size="compact-sm">View</Button>
              </Link>
              <a href={`/admin/drafts/${draft.urlName ?? draft.id}/raw`}>
                <Button size="compact-sm" variant="filled" color="gray">
                  Data
                </Button>
              </a>
              <Form method="delete" onSubmit={handleSubmit}>
                <input type="hidden" value={draft.id} name="id" />
                <Button type="submit" size="compact-sm" color="red" variant="filled">
                  Delete
                </Button>
              </Form>
            </Group>
          );
        },
      }),
    ],
    [draftsData, submit],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    manualFiltering: true,
  });

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", newPage.toString());
    setSearchParams(params);
  };

  const handleSortChange = (column: string) => {
    const params = new URLSearchParams(searchParams);
    const currentSort = params.get("sortBy");
    const currentOrder = params.get("sortOrder");

    if (currentSort === column) {
      params.set("sortOrder", currentOrder === "asc" ? "desc" : "asc");
    } else {
      params.set("sortBy", column);
      params.set("sortOrder", "desc");
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set("page", "1");
    setSearchParams(params);
  };

  const draftTypeOptions = Object.keys(stats.draftsByType).map((type) => ({
    value: type,
    label: `${type} (${stats.draftsByType[type]})`,
  }));

  return (
    <Stack gap="lg">
      <Title order={2}>Drafts Admin Dashboard</Title>

      {/* Stats Cards */}
      <Grid>
        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Stack gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                Total Drafts
              </Text>
              <Text size="xl" fw={700}>
                {stats.totalDrafts.toLocaleString()}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Stack gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                Completed Drafts
              </Text>
              <Text size="xl" fw={700}>
                {stats.completedDrafts.toLocaleString()}
              </Text>
              <Text size="xs" c="dimmed">
                {stats.completionPercent.toFixed(1)}% completion rate
              </Text>
            </Stack>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 12, lg: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder h="100%">
            <Stack gap="xs">
              <Text size="sm" c="dimmed" fw={500}>
                Drafts by Type
              </Text>
              <Grid>
                {Object.entries(stats.draftsByType)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => (
                    <Grid.Col key={type} span={6}>
                      <Group justify="space-between">
                        <Text size="sm">{type}</Text>
                        <Text size="sm" fw={600}>
                          {count}
                        </Text>
                      </Group>
                    </Grid.Col>
                  ))}
              </Grid>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Filters */}
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Grid>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Draft Type"
              placeholder="All types"
              data={draftTypeOptions}
              value={searchParams.get("typeFilter") || ""}
              onChange={(value) => handleFilterChange("typeFilter", value || "")}
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <Select
              label="Completion Status"
              placeholder="All"
              data={[
                { value: "true", label: "Completed" },
                { value: "false", label: "In Progress" },
              ]}
              value={searchParams.get("isCompleteFilter") || ""}
              onChange={(value) =>
                handleFilterChange("isCompleteFilter", value || "")
              }
              clearable
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, md: 4 }}>
            <TextInput
              label="Created After"
              type="date"
              value={searchParams.get("createdAfter") || ""}
              onChange={(e) =>
                handleFilterChange("createdAfter", e.currentTarget.value)
              }
            />
          </Grid.Col>
        </Grid>
      </Card>

      {/* Table */}
      <Card shadow="sm" padding="md" radius="md" withBorder>
        <Table striped highlightOnHover>
          <Table.Thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    onClick={
                      header.column.id !== "actions"
                        ? () => handleSortChange(header.column.id)
                        : undefined
                    }
                    style={
                      header.column.id !== "actions"
                        ? { cursor: "pointer" }
                        : undefined
                    }
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {searchParams.get("sortBy") === header.column.id && (
                      <span>
                        {searchParams.get("sortOrder") === "asc" ? " ↑" : " ↓"}
                      </span>
                    )}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.map((row) => (
              <Table.Tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Group mt="md" justify="space-between">
          <Text size="sm" c="dimmed">
            Showing {draftsData.length} of {stats.totalDrafts} drafts
          </Text>
          <Group gap="xs">
            <Button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1}
              variant="default"
              size="sm"
            >
              Previous
            </Button>

            <Text size="sm">
              Page {currentPage} of {totalPages}
            </Text>

            <Button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages}
              variant="default"
              size="sm"
            >
              Next
            </Button>
          </Group>
        </Group>
      </Card>
    </Stack>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  const body = await request.formData();
  const id = body.get("id")!;
  await db.delete(drafts).where(eq(drafts.id, id.toString()));
  return json({ ok: true });
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1");
  const sortBy = (url.searchParams.get("sortBy") ||
    "createdAt") as "createdAt" | "updatedAt" | "type" | "isComplete";
  const sortOrder = (url.searchParams.get("sortOrder") || "desc") as "asc" | "desc";
  const typeFilter = url.searchParams.get("typeFilter") || undefined;
  const isCompleteFilter = url.searchParams.get("isCompleteFilter")
    ? url.searchParams.get("isCompleteFilter") === "true"
    : undefined;
  const createdAfter = url.searchParams.get("createdAfter") || undefined;
  const createdBefore = url.searchParams.get("createdBefore") || undefined;

  const draftsData = await findDrafts({
    page,
    sortBy,
    sortOrder,
    typeFilter,
    isCompleteFilter,
    createdAfter,
    createdBefore,
  });

  return json(draftsData);
};
