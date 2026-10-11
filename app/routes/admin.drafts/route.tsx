import { requireAdmin } from "~/utils/adminAuth.server";
import {
  Accordion,
  Button,
  IconButton,
  Pagination,
  Panel,
  Progress,
  Row,
  SectionHeader,
  Select,
  Stack,
  Table,
  Tag,
  Text,
  TextInput,
  Tooltip,
  cx,
} from "~/ui";
import type { TagTone } from "~/ui";
import {
  ActionFunctionArgs,
  data,
  LoaderFunctionArgs,
  Form,
  Link,
  useLoaderData,
  useSearchParams,
  useSubmit,
} from "react-router";
import { DraftMode, DraftPhase, findDrafts } from "~/drizzle/draft.server";
import { db } from "~/drizzle/config.server";
import { drafts } from "~/drizzle/schema.server";
import { eq } from "drizzle-orm";
import { useState } from "react";
import type { FormEvent, ReactNode } from "react";
import {
  IconChevronDown,
  IconChevronUp,
  IconDatabase,
  IconEye,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import classes from "./styles.module.css";

type SortBy =
  | "createdAt"
  | "updatedAt"
  | "type"
  | "isComplete"
  | "mode"
  | "phase"
  | "progress"
  | "players";

const MODE_LABELS: Record<DraftMode, string> = {
  base: "Base",
  twilightsFall: "Twilight's Fall",
  texasStyle: "Texas style",
  presetMap: "Preset map",
};

const PHASE_LABELS: Record<DraftPhase, string> = {
  ban: "Ban",
  priorityValue: "Priority value",
  homeSystem: "Home system",
  texasFaction: "Texas faction",
  texasBlueKeep1: "Texas blue keep 1",
  texasBlueKeep2: "Texas blue keep 2",
  texasRedKeep: "Texas red keep",
  texasMapBuild: "Texas map build",
  standardPick: "Standard pick",
  complete: "Complete",
};

const MODE_TONES: Record<string, TagTone> = {
  base: "ion",
  twilightsFall: "neutral",
  texasStyle: "warning",
  presetMap: "success",
};

const MODE_FILTER_OPTIONS = Object.keys(MODE_LABELS).map((mode) => ({
  value: mode,
  label: getModeLabel(mode),
}));

const PHASE_FILTER_OPTIONS = Object.keys(PHASE_LABELS).map((phase) => ({
  value: phase,
  label: getPhaseLabel(phase),
}));

/** Select value for "no filter". */
const ALL = "__all";

const QUICK_FILTERS: Array<{
  label: string;
  updates: Record<string, string>;
}> = [
  { label: "In progress", updates: { isCompleteFilter: "false" } },
  {
    label: "Texas active",
    updates: { modeFilter: "texasStyle", isCompleteFilter: "false" },
  },
  {
    label: "Twilight active",
    updates: { modeFilter: "twilightsFall", isCompleteFilter: "false" },
  },
  {
    label: "Ban phase",
    updates: { phaseFilter: "ban", isCompleteFilter: "false" },
  },
  { label: "Completed", updates: { isCompleteFilter: "true" } },
];

const SORT_COLUMNS: Array<{ column: SortBy; label: string }> = [
  { column: "mode", label: "Mode" },
  { column: "type", label: "Type" },
  { column: "isComplete", label: "Status" },
  { column: "phase", label: "Phase" },
  { column: "progress", label: "Progress" },
  { column: "players", label: "Players" },
  { column: "createdAt", label: "Created" },
  { column: "updatedAt", label: "Updated" },
];

const DATE_FILTERS = [
  { label: "Created after", param: "createdAfter" },
  { label: "Created before", param: "createdBefore" },
  { label: "Updated after", param: "updatedAfter" },
  { label: "Updated before", param: "updatedBefore" },
];

function getModeLabel(mode: string): string {
  return MODE_LABELS[mode as DraftMode] ?? mode;
}

function getPhaseLabel(phase: string): string {
  return PHASE_LABELS[phase as DraftPhase] ?? phase;
}

function withCounts(
  options: Array<{ value: string; label: string }>,
  counts: Record<string, number>,
) {
  return options.map((option) => {
    const count = counts[option.value];
    return {
      ...option,
      label: count === undefined ? option.label : `${option.label} (${count})`,
    };
  });
}

function shortId(id: string): string {
  return id.substring(0, 8);
}

function formatDateTime(value: string): string {
  const d = new Date(value);
  const date = d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const time = d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return `${date} ${time}`;
}

function clampPageSize(value: number): number {
  if (!Number.isFinite(value)) return 100;
  if (value < 25) return 25;
  if (value > 250) return 250;
  return value;
}

function progressTone(pct: number): "ion" | "gold" | "success" {
  if (pct >= 100) return "success";
  if (pct >= 25) return "ion";
  return "gold";
}

export default function AdminDraftsIndex() {
  const {
    drafts: draftsData,
    totalPages,
    currentPage,
    filteredTotal,
    stats,
  } = useLoaderData<typeof loader>();
  const [searchParams, setSearchParams] = useSearchParams();
  const submit = useSubmit();
  // The box follows the URL (back/forward, clear all) but edits stay local until Enter.
  const searchParam = searchParams.get("search") || "";
  const [searchValue, setSearchValue] = useState(searchParam);
  const [syncedSearch, setSyncedSearch] = useState(searchParam);
  if (searchParam !== syncedSearch) {
    setSyncedSearch(searchParam);
    setSearchValue(searchParam);
  }

  const updateParams = (
    updates: Record<string, string | undefined>,
    resetPage = true,
  ) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });
    if (resetPage) {
      params.set("page", "1");
    }
    setSearchParams(params);
  };

  const handleSortChange = (column: SortBy) => {
    const currentSort = searchParams.get("sortBy");
    const currentOrder = searchParams.get("sortOrder");
    if (currentSort === column) {
      updateParams(
        { sortOrder: currentOrder === "asc" ? "desc" : "asc" },
        false,
      );
    } else {
      updateParams({ sortBy: column, sortOrder: "desc" }, false);
    }
  };

  const clearAllFilters = () => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("pageSize", searchParams.get("pageSize") || "100");
    params.set("sortBy", searchParams.get("sortBy") || "createdAt");
    params.set("sortOrder", searchParams.get("sortOrder") || "desc");
    setSearchParams(params);
    setSearchValue("");
  };

  const typeOptions = Object.entries(stats.draftsByType)
    .sort(([, a], [, b]) => b - a)
    .map(([type, count]) => ({ value: type, label: `${type} (${count})` }));
  const modeOptions = withCounts(MODE_FILTER_OPTIONS, stats.draftsByMode);
  const phaseOptions = withCounts(PHASE_FILTER_OPTIONS, stats.draftsByPhase);

  const renderSortIcon = (column: SortBy) => {
    if (searchParams.get("sortBy") !== column) return null;
    const isAsc = searchParams.get("sortOrder") === "asc";
    return isAsc ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />;
  };

  const handleDeleteSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const result = confirm("Are you sure you want to delete this draft?");
    if (result) {
      submit(new FormData(e.currentTarget), { method: "delete" });
    }
  };

  const hasActiveFilters = [
    "modeFilter",
    "typeFilter",
    "phaseFilter",
    "isCompleteFilter",
    "search",
    ...DATE_FILTERS.map((filter) => filter.param),
  ].some((param) => searchParams.has(param));

  return (
    <Stack gap={5}>
      <SectionHeader
        title="Drafts"
        meta={`Admin registry · ${stats.allDrafts.toLocaleString()} total records`}
      />

      <div className={classes.statsGrid}>
        <StatPanel label="Total" value={stats.allDrafts.toLocaleString()} />
        <StatPanel
          label="In scope"
          value={stats.scopedDrafts.toLocaleString()}
          detail="After filters"
        />
        <StatPanel
          label="Filtered"
          value={filteredTotal.toLocaleString()}
          detail="Current results"
        />
        <StatPanel
          label="Completion"
          value={`${stats.completionPercent.toFixed(1)}%`}
          detail={`${stats.completedDrafts.toLocaleString()} completed`}
        />
      </div>

      <Panel title="Filters">
        <Stack gap={3}>
          <Row gap={2}>
            {QUICK_FILTERS.map((filter) => (
              <Button
                key={filter.label}
                size="sm"
                onClick={() => updateParams(filter.updates)}
              >
                {filter.label}
              </Button>
            ))}
            {hasActiveFilters && (
              <Button
                size="sm"
                variant="tertiary"
                icon={<IconX size={14} />}
                onClick={clearAllFilters}
              >
                Clear all
              </Button>
            )}
          </Row>

          <TextInput
            placeholder="Search by URL, ID, player, or JSON..."
            aria-label="Search drafts"
            leftIcon={<IconSearch size={14} />}
            value={searchValue}
            onChange={(e) => setSearchValue(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateParams({ search: searchValue || undefined });
              }
            }}
          />

          <div className={classes.filtersGrid}>
            <Select
              label="Mode"
              options={[{ value: ALL, label: "All modes" }, ...modeOptions]}
              value={searchParams.get("modeFilter") || ALL}
              onChange={(value) =>
                updateParams({ modeFilter: value === ALL ? undefined : value })
              }
            />
            <Select
              label="Type"
              options={[{ value: ALL, label: "All types" }, ...typeOptions]}
              value={searchParams.get("typeFilter") || ALL}
              onChange={(value) =>
                updateParams({ typeFilter: value === ALL ? undefined : value })
              }
            />
            <Select
              label="Status"
              options={[
                { value: ALL, label: "All" },
                { value: "true", label: "Completed" },
                { value: "false", label: "In progress" },
              ]}
              value={searchParams.get("isCompleteFilter") || ALL}
              onChange={(value) =>
                updateParams({
                  isCompleteFilter: value === ALL ? undefined : value,
                })
              }
            />
            <Select
              label="Phase"
              options={[{ value: ALL, label: "All phases" }, ...phaseOptions]}
              value={searchParams.get("phaseFilter") || ALL}
              onChange={(value) =>
                updateParams({ phaseFilter: value === ALL ? undefined : value })
              }
            />
            <Select
              label="Page size"
              options={[
                { value: "25", label: "25" },
                { value: "50", label: "50" },
                { value: "100", label: "100" },
                { value: "250", label: "250" },
              ]}
              value={searchParams.get("pageSize") || "100"}
              onChange={(value) => updateParams({ pageSize: value || "100" })}
            />
          </div>

          <Accordion
            items={[
              {
                value: "dates",
                title: "Date range",
                content: (
                  <div className={classes.dateGrid}>
                    {DATE_FILTERS.map((filter) => (
                      <TextInput
                        key={filter.param}
                        label={filter.label}
                        type="date"
                        value={searchParams.get(filter.param) || ""}
                        onChange={(e) =>
                          updateParams({
                            [filter.param]: e.currentTarget.value || undefined,
                          })
                        }
                      />
                    ))}
                  </div>
                ),
              },
            ]}
          />
        </Stack>
      </Panel>

      <Stack gap={2}>
        <Text size="sm" weight={600}>
          {filteredTotal.toLocaleString()} results
        </Text>

        <Table striped dense minWidth={1000}>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Draft</Table.Th>
              {SORT_COLUMNS.map(({ column, label }) => (
                <SortTh
                  key={column}
                  column={column}
                  label={label}
                  active={searchParams.get("sortBy")}
                  icon={renderSortIcon(column)}
                  onClick={handleSortChange}
                />
              ))}
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {draftsData.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={10}>
                  <Stack gap={2} align="center" className={classes.empty}>
                    <IconSearch size={28} />
                    <Text size="sm" tone="muted">
                      No records match current parameters
                    </Text>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )}

            {draftsData.map((draft) => (
              <Table.Tr key={draft.id}>
                <Table.Td>
                  <Text size="sm" weight={600} className={classes.mono}>
                    {shortId(draft.id)}
                  </Text>
                  <Text size="xs" tone="muted">
                    {draft.urlName ?? "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Tag tone={MODE_TONES[draft.mode] ?? "neutral"}>
                    {getModeLabel(draft.mode)}
                  </Tag>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" tone="muted">
                    {draft.type ?? "unknown"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Tag tone={draft.isComplete ? "success" : "gold"}>
                    {draft.isComplete ? "Complete" : "Active"}
                  </Tag>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" tone="muted">
                    {getPhaseLabel(draft.phase)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <div className={classes.progress}>
                    <Text size="xs" tone="muted" className={classes.mono}>
                      {draft.selectionsCount}/{draft.pickOrderCount} (
                      {draft.progressPercent.toFixed(0)}%)
                    </Text>
                    <Progress
                      value={Math.min(draft.progressPercent, 100)}
                      tone={progressTone(draft.progressPercent)}
                      size="xs"
                    />
                  </div>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" weight={600}>
                    {draft.playerCount}p
                  </Text>
                  <Text
                    size="xs"
                    tone="muted"
                    truncate
                    className={classes.players}
                  >
                    {draft.playerNames || "—"}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" tone="muted" className={classes.mono}>
                    {formatDateTime(draft.createdAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Text size="xs" tone="muted" className={classes.mono}>
                    {formatDateTime(draft.updatedAt)}
                  </Text>
                </Table.Td>
                <Table.Td>
                  <Row gap={1} wrap={false}>
                    <Tooltip label="Open draft">
                      <Link
                        to={`/draft/${draft.urlName ?? draft.id}`}
                        className={classes.iconLink}
                        aria-label="Open draft"
                      >
                        <IconEye size={15} />
                      </Link>
                    </Tooltip>
                    <Tooltip label="Raw JSON">
                      <a
                        href={`/admin/drafts/${draft.urlName ?? draft.id}/raw`}
                        className={classes.iconLink}
                        aria-label="Raw JSON"
                      >
                        <IconDatabase size={15} />
                      </a>
                    </Tooltip>
                    <Form method="delete" onSubmit={handleDeleteSubmit}>
                      <input type="hidden" value={draft.id} name="id" />
                      <IconButton
                        type="submit"
                        variant="danger"
                        size="sm"
                        label="Delete draft"
                      >
                        <IconTrash size={15} />
                      </IconButton>
                    </Form>
                  </Row>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Stack>

      <Row justify="between" gap={3}>
        <Text size="xs" tone="muted">
          Showing {draftsData.length} of {filteredTotal.toLocaleString()}{" "}
          filtered &middot; {stats.scopedDrafts.toLocaleString()} in scope
          &middot; {stats.allDrafts.toLocaleString()} total
        </Text>
        <Pagination
          total={Math.max(totalPages, 1)}
          page={currentPage}
          onChange={(page) => updateParams({ page: page.toString() }, false)}
        />
      </Row>
    </Stack>
  );
}

function StatPanel({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className={classes.stat}>
      <Text size="xs" tone="muted" weight={600}>
        {label}
      </Text>
      <span className={classes.statValue}>{value}</span>
      {detail && (
        <Text size="xs" tone="muted">
          {detail}
        </Text>
      )}
    </div>
  );
}

function SortTh({
  column,
  label,
  active,
  icon,
  onClick,
}: {
  column: SortBy;
  label: string;
  active: string | null;
  icon: ReactNode;
  onClick: (column: SortBy) => void;
}) {
  const isActive = active === column;
  return (
    <Table.Th aria-sort={isActive ? "other" : undefined}>
      <button
        type="button"
        className={cx(classes.sortBtn, isActive && classes.sortActive)}
        onClick={() => onClick(column)}
      >
        {label}
        {icon}
      </button>
    </Table.Th>
  );
}

export async function action({ request }: ActionFunctionArgs) {
  await requireAdmin(request);
  const body = await request.formData();
  const id = body.get("id");
  if (!id) return data({ ok: false }, { status: 400 });

  await db.delete(drafts).where(eq(drafts.id, id.toString()));
  return data({ ok: true });
}

function parseMode(value: string | null): DraftMode | undefined {
  return value && Object.hasOwn(MODE_LABELS, value)
    ? (value as DraftMode)
    : undefined;
}

function parsePhase(value: string | null): DraftPhase | undefined {
  return value && Object.hasOwn(PHASE_LABELS, value)
    ? (value as DraftPhase)
    : undefined;
}

function parseSortBy(value: string | null): SortBy {
  return SORT_COLUMNS.some(({ column }) => column === value)
    ? (value as SortBy)
    : "createdAt";
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await requireAdmin(request);
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page") || "1", 10);
  const pageSize = clampPageSize(
    parseInt(url.searchParams.get("pageSize") || "100", 10),
  );
  const sortBy = parseSortBy(url.searchParams.get("sortBy"));
  const sortOrder = (url.searchParams.get("sortOrder") || "desc") as
    | "asc"
    | "desc";
  const typeFilter = url.searchParams.get("typeFilter") || undefined;
  const modeFilter = parseMode(url.searchParams.get("modeFilter"));
  const phaseFilter = parsePhase(url.searchParams.get("phaseFilter"));
  const isCompleteFilter = url.searchParams.get("isCompleteFilter")
    ? url.searchParams.get("isCompleteFilter") === "true"
    : undefined;
  const search = url.searchParams.get("search") || undefined;
  const createdAfter = url.searchParams.get("createdAfter") || undefined;
  const createdBefore = url.searchParams.get("createdBefore") || undefined;
  const updatedAfter = url.searchParams.get("updatedAfter") || undefined;
  const updatedBefore = url.searchParams.get("updatedBefore") || undefined;

  const draftsData = await findDrafts({
    page: Number.isNaN(page) ? 1 : Math.max(page, 1),
    pageSize,
    sortBy,
    sortOrder: sortOrder === "asc" ? "asc" : "desc",
    typeFilter,
    modeFilter,
    phaseFilter,
    isCompleteFilter,
    search,
    createdAfter,
    createdBefore,
    updatedAfter,
    updatedBefore,
  });

  return data(draftsData);
};
