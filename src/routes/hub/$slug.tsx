import { createFileRoute } from "@tanstack/react-router";
import { IconPencil, IconPlus } from "@tabler/icons-react";
import { Avatar } from "~/components/Account/AccountButton";
import { getHub, type HubSearch } from "~/server/hub.functions";
import { ButtonLink, CopyButton, Button, SectionHeader, cx, useDisclosure } from "~/ui";
import { CampaignRecord } from "./-components/CampaignRecord";
import { DraftList } from "./-components/DraftList";
import { EditHubModal } from "./-components/EditHubModal";
import { ImportPanel } from "./-components/ImportPanel";
import { SliceSets } from "./-components/SliceSets";
import { formatMonthYear } from "./-utils";
import classes from "./hub.module.css";

const STATUSES = ["all", "live", "done", "archived"] as const;

export const Route = createFileRoute("/hub/$slug")({
  validateSearch: (search): HubSearch => ({
    status: STATUSES.find((s) => s === search.status && s !== "all"),
    q: typeof search.q === "string" && search.q.trim() ? search.q : undefined,
    cursor: typeof search.cursor === "string" && search.cursor ? search.cursor : undefined,
    sets: search.sets === "archived" ? "archived" : undefined,
    setsQ: typeof search.setsQ === "string" && search.setsQ.trim() ? search.setsQ : undefined,
    setsCursor: typeof search.setsCursor === "string" && search.setsCursor ? search.setsCursor : undefined,
  }),
  loaderDeps: ({ search: { status, q, cursor, sets, setsQ, setsCursor } }) => ({ status, q, cursor, sets, setsQ, setsCursor }),
  loader: ({ params, deps }) => getHub({ data: { slug: params.slug, ...deps } }),
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const title = `${loaderData.hub.name} - TI4 Lab`;
    const description =
      loaderData.hub.description ||
      `${loaderData.record.total} TI4 drafts and ${loaderData.sliceSetsPage.hubTotal} slice sets.`;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:site_name", content: "TI4 Lab" },
      ],
    };
  },
  component: HubPage,
});

function initials(name: string) {
  const words = name.replace(/['’]s\b/g, "").split(/\s+/).filter(Boolean);
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase();
}

function HubPage() {
  const { hub, owner, isOwner, record, draftsPage, sliceSetsPage } = Route.useLoaderData();
  const [editOpened, { open: openEdit, close: closeEdit }] = useDisclosure(false);
  const shareUrl = `${typeof window === "undefined" ? "https://tidraft.com" : window.location.origin}/hub/${hub.slug}`;

  return (
    <div className={classes.page}>
      <header className={classes.plate}>
        <div className={classes.plateTop}>
          <div className={classes.emblem} aria-hidden>
            <span>{initials(hub.name)}</span>
          </div>
          <div className={classes.identity}>
            <h1 className={classes.hubName}>{hub.name}</h1>
            {hub.description && <p className={classes.hubDesc}>{hub.description}</p>}
            {owner && (
              <span className={classes.runBy}>
                <Avatar name={owner.name} url={owner.avatarUrl} size={20} />
                <span>
                  Run by <b>{owner.name}</b> since {formatMonthYear(hub.createdAt)}
                </span>
              </span>
            )}
          </div>
          <div className={classes.plateActions}>
            <CopyButton value={shareUrl} label="Copy share link" size="md" />
            {isOwner && (
              <>
                <Button icon={<IconPencil />} onClick={openEdit}>
                  Edit hub
                </Button>
                <ButtonLink to="/draft/prechoice" variant="primary" icon={<IconPlus />}>
                  New draft
                </ButtonLink>
              </>
            )}
          </div>
        </div>
        <CampaignRecord record={record} />
      </header>

      <div className={classes.columns}>
        <div className={classes.column}>
          <SectionHeader title={<span id="hub-drafts">Drafts</span>} meta={`${record.total}`} />
          <DraftList page={draftsPage} isOwner={isOwner} />
          {isOwner && <ImportPanel defaultOpen={record.total === 0 && draftsPage.counts.archived === 0} />}
        </div>
        <div className={cx(classes.column, classes.sideColumn)}>
          <SectionHeader title={<span id="hub-slices">Slice sets</span>} meta={`${sliceSetsPage.hubTotal}`} />
          <SliceSets page={sliceSetsPage} isOwner={isOwner} />
        </div>
      </div>

      {isOwner && <EditHubModal key={hub.slug} hub={hub} opened={editOpened} onClose={closeEdit} />}
    </div>
  );
}
