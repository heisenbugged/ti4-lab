import { requireAdmin } from "~/utils/adminAuth.server";
import {
  Button,
  Chip,
  Heading,
  IconButton,
  Modal,
  Pagination,
  Popover,
  Progress,
  Row,
  Segmented,
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
import {
  IconBraces,
  IconCalendar,
  IconChevronDown,
  IconChevronUp,
  IconSearch,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import classes from "./styles.module.css";

export const meta = () => [{ title: "Drafts - Admin - TI4 Lab" }];

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
  const [deleting, setDeleting] = useState<DraftRow | null>(null);
  const pageSize = Number(searchParams.get("pageSize") || 100);
  const confirmDelete = () => {
    if (!deleting) return;
    submit({ id: deleting.id }, { method: "delete" });
    setDeleting(null);
  };
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

  const hasActiveFilters = [
    "modeFilter",
    "typeFilter",
    "phaseFilter",
    "isCompleteFilter",
    "search",
    ...DATE_FILTERS.map((filter) => filter.param),
  ].some((param) => searchParams.has(param));
  const activePreset = QUICK_FILTERS.find(
    (f) =>
      Object.entries(f.updates).every(([k, v]) => searchParams.get(k) === v) &&
      ["modeFilter", "phaseFilter", "isCompleteFilter"].every(
        (k) => k in f.updates || !searchParams.has(k),
      ),
  )?.label;
  const datesSet = DATE_FILTERS.filter((f) => searchParams.get(f.param)).length;
  const status = searchParams.get("isCompleteFilter") ?? ALL;
  const inProgress = stats.scopedDrafts - stats.completedDrafts;

  const sortProps = (column: SortBy) => ({
    column,
    active: searchParams.get("sortBy") ?? "createdAt",
    order: searchParams.get("sortOrder") ?? "desc",
    onClick: handleSortChange,
  });

  return (
    <Stack gap={4}>
      <header className={classes.head}>
        <div>
          <Heading variant="title">Drafts</Heading>
          <Text size="sm" tone="muted">
            Every draft on the site. Search, filter, open or remove one.
          </Text>
        </div>
      </header>

      <dl className={classes.stats}>
        <div>
          <dt>All drafts</dt>
          <dd>{stats.allDrafts.toLocaleString()}</dd>
        </div>
        <div>
          <dt>{hasActiveFilters ? "Matching filters" : "In view"}</dt>
          <dd>{filteredTotal.toLocaleString()}</dd>
        </div>
        <div>
          <dt>In progress</dt>
          <dd>{inProgress.toLocaleString()}</dd>
        </div>
        <div className={classes.statWide}>
          <dt>Completed</dt>
          <dd>
            {stats.completedDrafts.toLocaleString()}
            <small>{stats.completionPercent.toFixed(1)}%</small>
          </dd>
          <Progress
            value={stats.completionPercent}
            tone="success"
            size="xs"
            label="Completion rate"
          />
        </div>
      </dl>

      <section className={classes.filters} aria-label="Filters">
        <div className={classes.filterTop}>
          <TextInput
            className={classes.search}
            placeholder="URL, ID, player name or JSON, then Enter"
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
          <Segmented
            size="sm"
            label="Status"
            value={status}
            onChange={(value) =>
              updateParams({
                isCompleteFilter: value === ALL ? undefined : value,
              })
            }
            options={[
              { value: ALL, label: "All" },
              { value: "false", label: "In progress" },
              { value: "true", label: "Completed" },
            ]}
          />
        </div>
        <div className={classes.filterRow}>
          <Select
            size="sm"
            className={classes.refine}
            aria-label="Mode"
            options={[{ value: ALL, label: "Any mode" }, ...modeOptions]}
            value={searchParams.get("modeFilter") || ALL}
            onChange={(value) =>
              updateParams({ modeFilter: value === ALL ? undefined : value })
            }
          />
          <Select
            size="sm"
            className={classes.refine}
            aria-label="Type"
            options={[{ value: ALL, label: "Any type" }, ...typeOptions]}
            value={searchParams.get("typeFilter") || ALL}
            onChange={(value) =>
              updateParams({ typeFilter: value === ALL ? undefined : value })
            }
          />
          <Select
            size="sm"
            className={classes.refine}
            aria-label="Phase"
            options={[{ value: ALL, label: "Any phase" }, ...phaseOptions]}
            value={searchParams.get("phaseFilter") || ALL}
            onChange={(value) =>
              updateParams({ phaseFilter: value === ALL ? undefined : value })
            }
          />
          <Popover
            side="bottom"
            align="start"
            width={320}
            title="Date range"
            trigger={
              <Button size="sm" icon={<IconCalendar size={15} />}>
                {datesSet ? `Dates (${datesSet})` : "Dates"}
              </Button>
            }
          >
            <div className={classes.dateGrid}>
              {DATE_FILTERS.map((filter) => (
                <TextInput
                  key={filter.param}
                  size="sm"
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
          </Popover>
          {hasActiveFilters && (
            <Button
              size="sm"
              variant="tertiary"
              icon={<IconX size={14} />}
              onClick={clearAllFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
        <div className={classes.presets}>
          <span>Shortcuts</span>
          {QUICK_FILTERS.map((filter) => (
            <Chip
              key={filter.label}
              pressed={activePreset === filter.label}
              onChange={(on) =>
                on
                  ? updateParams({
                      modeFilter: undefined,
                      phaseFilter: undefined,
                      isCompleteFilter: undefined,
                      ...filter.updates,
                    })
                  : updateParams({
                      modeFilter: undefined,
                      phaseFilter: undefined,
                      isCompleteFilter: undefined,
                    })
              }
            >
              {filter.label}
            </Chip>
          ))}
        </div>
      </section>

      {draftsData.length === 0 ? (
        <div className={classes.empty}>
          <IconSearch size={26} />
          <Text weight={600}>No drafts match these filters</Text>
          {hasActiveFilters && (
            <Button size="sm" onClick={clearAllFilters}>
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div className={classes.table}>
            <Table dense minWidth={940}>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Draft</Table.Th>
                  <SortTh {...sortProps("mode")} label="Format" />
                  <SortTh {...sortProps("progress")} label="Progress" />
                  <SortTh {...sortProps("players")} label="Players" />
                  <SortTh {...sortProps("updatedAt")} label="Last activity" />
                  <SortTh {...sortProps("createdAt")} label="Created" />
                  <Table.Th className={classes.actionsHead}>
                    <span className="visually-hidden">Actions</span>
                  </Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {draftsData.map((draft) => (
                  <Table.Tr key={draft.id}>
                    <Table.Td>
                      <DraftName draft={draft} />
                    </Table.Td>
                    <Table.Td>
                      <Format draft={draft} />
                    </Table.Td>
                    <Table.Td>
                      <DraftProgress draft={draft} />
                    </Table.Td>
                    <Table.Td>
                      <Players draft={draft} />
                    </Table.Td>
                    <Table.Td>
                      <time className={classes.when} dateTime={draft.updatedAt}>
                        {formatDateTime(draft.updatedAt)}
                      </time>
                    </Table.Td>
                    <Table.Td>
                      <time className={classes.when} dateTime={draft.createdAt}>
                        {formatDateTime(draft.createdAt)}
                      </time>
                    </Table.Td>
                    <Table.Td>
                      <Actions draft={draft} onDelete={setDeleting} />
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </div>

          {/* Phones: one card per draft instead of a sideways-scrolling table. */}
          <ul className={classes.cards}>
            {draftsData.map((draft) => (
              <li key={draft.id} className={classes.card}>
                <div className={classes.cardTop}>
                  <DraftName draft={draft} />
                  <Actions draft={draft} onDelete={setDeleting} />
                </div>
                <Format draft={draft} />
                <DraftProgress draft={draft} />
                <div className={classes.cardFoot}>
                  <Players draft={draft} />
                  <time className={classes.when} dateTime={draft.updatedAt}>
                    {formatDateTime(draft.updatedAt)}
                  </time>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      <footer className={classes.foot}>
        <Text size="sm" tone="muted">
          {draftsData.length > 0
            ? `${((currentPage - 1) * pageSize + 1).toLocaleString()}–${((currentPage - 1) * pageSize + draftsData.length).toLocaleString()} of ${filteredTotal.toLocaleString()}`
            : "0 results"}
        </Text>
        <div className={classes.footRight}>
          <Select
            size="sm"
            aria-label="Rows per page"
            options={["25", "50", "100", "250"].map((n) => ({
              value: n,
              label: `${n} per page`,
            }))}
            value={String(pageSize)}
            onChange={(value) => updateParams({ pageSize: value || "100" })}
          />
          <Pagination
            total={Math.max(totalPages, 1)}
            page={currentPage}
            onChange={(page) => updateParams({ page: page.toString() }, false)}
          />
        </div>
      </footer>

      <Modal
        opened={!!deleting}
        onClose={() => setDeleting(null)}
        size="sm"
        title="Delete this draft?"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setDeleting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              icon={<IconTrash size={15} />}
              onClick={confirmDelete}
            >
              Delete draft
            </Button>
          </>
        }
      >
        {deleting && (
          <Text size="sm" tone="muted">
            <b className={classes.strong}>
              {deleting.urlName ?? shortId(deleting.id)}
            </b>{" "}
            and all its picks are removed for everyone. This can&apos;t be
            undone.
          </Text>
        )}
      </Modal>
    </Stack>
  );
}

type DraftRow = ReturnType<
  typeof useLoaderData<typeof loader>
>["drafts"][number];

function DraftName({ draft }: { draft: DraftRow }) {
  return (
    <div className={classes.name}>
      <Link to={`/draft/${draft.urlName ?? draft.id}`} className={classes.url}>
        {draft.urlName ?? shortId(draft.id)}
      </Link>
      <span className={classes.id}>{shortId(draft.id)}</span>
    </div>
  );
}

function Format({ draft }: { draft: DraftRow }) {
  return (
    <div className={classes.format}>
      <Tag tone={MODE_TONES[draft.mode] ?? "neutral"}>
        {getModeLabel(draft.mode)}
      </Tag>
      <span>{draft.type ?? "unknown"}</span>
    </div>
  );
}

function DraftProgress({ draft }: { draft: DraftRow }) {
  const pct = Math.min(draft.progressPercent, 100);
  return (
    <div className={classes.progress}>
      <div className={classes.progressText}>
        <span className={cx(classes.state, draft.isComplete && classes.done)}>
          {draft.isComplete ? "Complete" : getPhaseLabel(draft.phase)}
        </span>
        <span className={classes.count}>
          {draft.selectionsCount}/{draft.pickOrderCount}
        </span>
      </div>
      <Progress
        value={pct}
        tone={draft.isComplete ? "success" : "ion"}
        size="xs"
        label="Picks made"
      />
    </div>
  );
}

function Players({ draft }: { draft: DraftRow }) {
  return (
    <div className={classes.players}>
      <b>{draft.playerCount}p</b>
      <span title={draft.playerNames || undefined}>
        {draft.playerNames || "No names"}
      </span>
    </div>
  );
}

function Actions({
  draft,
  onDelete,
}: {
  draft: DraftRow;
  onDelete: (d: DraftRow) => void;
}) {
  return (
    <Row gap={1} wrap={false} className={classes.actions}>
      <Tooltip label="Raw JSON">
        <a
          href={`/admin/drafts/${draft.urlName ?? draft.id}/raw`}
          className={classes.iconLink}
          aria-label="Raw JSON"
        >
          <IconBraces size={15} />
        </a>
      </Tooltip>
      <IconButton
        variant="danger"
        size="sm"
        label="Delete draft"
        onClick={() => onDelete(draft)}
      >
        <IconTrash size={15} />
      </IconButton>
    </Row>
  );
}

function SortTh({
  column,
  label,
  active,
  order,
  onClick,
}: {
  column: SortBy;
  label: string;
  active: string;
  order: string;
  onClick: (column: SortBy) => void;
}) {
  const isActive = active === column;
  const asc = order === "asc";
  return (
    <Table.Th
      aria-sort={isActive ? (asc ? "ascending" : "descending") : undefined}
    >
      <button
        type="button"
        className={cx(classes.sortBtn, isActive && classes.sortActive)}
        onClick={() => onClick(column)}
      >
        {label}
        {isActive &&
          (asc ? <IconChevronUp size={12} /> : <IconChevronDown size={12} />)}
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
