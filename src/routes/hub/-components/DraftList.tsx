import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import {
  IconArchive,
  IconArchiveOff,
  IconDots,
  IconLink,
  IconPencil,
  IconPlayerTrackNext,
  IconSearch,
} from "@tabler/icons-react";
import { factions } from "~/data/factionData";
import { editHubDraft, type HubDraft, type HubDraftsPage, type HubSearch } from "~/server/hub.functions";
import { HUB_PAGE_SIZE } from "~/utils/hubPagination";
import { ButtonLink, IconButton, Menu, MenuItem, MenuSeparator, Segmented, TextInput, cx, notify } from "~/ui";
import {
  draftFormatName,
  draftProgress,
  draftStatus,
  draftTitle,
  formatDay,
  SOURCE_LABEL,
} from "../-utils";
import { HubPager, RenameModal, useHubList } from "./HubList";
import classes from "../hub.module.css";

type Status = NonNullable<HubSearch["status"]>;

export function DraftList({ page, isOwner }: { page: HubDraftsPage; isOwner: boolean }) {
  const { search, navigate, listTop, query, setQuery, goToPage } = useHubList(
    { q: "q", cursor: "cursor" },
    page.pageCursors,
  );
  const [renaming, setRenaming] = useState<HubDraft>();
  const status: Status = search.status ?? "all";

  const setStatus = (next: Status) =>
    navigate({
      search: (prev) => ({ ...prev, status: next === "all" ? undefined : next, cursor: undefined }),
      resetScroll: false,
    });

  const { counts } = page;
  const statusOptions: { value: Status; label: string }[] = [
    { value: "all", label: `All ${counts.all}` },
    { value: "live", label: `Unfinished ${counts.live}` },
    { value: "done", label: `Finished ${counts.done}` },
  ];
  if (isOwner && (counts.archived > 0 || status === "archived")) {
    statusOptions.push({ value: "archived", label: `Archived ${counts.archived}` });
  }

  const hubIsEmpty = counts.all === 0 && counts.archived === 0 && !search.q;

  return (
    <section className={classes.column} aria-labelledby="hub-drafts">
      <div className={classes.toolbar} ref={listTop}>
        <TextInput
          aria-label="Search drafts"
          className={classes.search}
          placeholder="Search drafts and players"
          leftIcon={<IconSearch />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          size="sm"
        />
        <Segmented<Status> label="Show" size="sm" value={status} onChange={setStatus} options={statusOptions} />
      </div>

      {hubIsEmpty ? (
        <div className={classes.empty}>
          <p>
            {isOwner
              ? "Drafts you create while signed in show up here, along with drafts started from your slice sets with the Discord bot. Played some before? Paste their links into Import past drafts."
              : "No drafts here yet."}
          </p>
          {isOwner && <ButtonLink to="/draft/prechoice">Set up a draft</ButtonLink>}
        </div>
      ) : page.drafts.length === 0 ? (
        <div className={classes.empty}>
          <p>{status === "archived" && !search.q ? "Nothing is archived." : "No drafts match. Try another name or filter."}</p>
        </div>
      ) : (
        <>
          <div className={classes.list}>
            {page.drafts.map((draft) => (
              <DraftRow key={draft.draftId} draft={draft} isOwner={isOwner} onRename={() => setRenaming(draft)} />
            ))}
          </div>
          <HubPager page={page} pageSize={HUB_PAGE_SIZE} shown={page.drafts.length} onChange={goToPage} />
        </>
      )}

      <RenameModal
        itemId={renaming?.draftId}
        initialValue={renaming?.label ?? ""}
        title="Rename draft"
        label="Name on your hub"
        hint={`Leave empty to show ${renaming?.urlName ?? "the draft link name"}.`}
        placeholder="Week 3, finals table"
        onSave={async (label) => {
          if (!renaming) return;
          await editHubDraft({ data: { draftId: renaming.draftId, label } });
          notify({ tone: "success", title: "Draft renamed", message: label.trim() || renaming.urlName });
        }}
        onClose={() => setRenaming(undefined)}
      />
    </section>
  );
}

function DraftRow({ draft, isOwner, onRename }: { draft: HubDraft; isOwner: boolean; onRename: () => void }) {
  const router = useRouter();
  const status = draftStatus(draft);
  const progress = draftProgress(draft);
  const href = `/draft/${draft.urlName}`;

  const setArchived = async (archived: boolean) => {
    await editHubDraft({ data: { draftId: draft.draftId, archived } });
    notify({ tone: "success", title: archived ? "Draft archived" : "Draft restored", message: draftTitle(draft) });
    router.invalidate();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
    notify({ tone: "success", title: "Link copied", message: draftTitle(draft) });
  };

  return (
    <article className={cx(classes.draft, draft.archived && classes.archivedRow)}>
      <a href={href} className={classes.thumb} tabIndex={-1} aria-hidden>
        {draft.imageUrl ? <img src={draft.imageUrl} alt="" loading="lazy" /> : <i className={classes.thumbEmpty} />}
      </a>

      <div className={classes.draftMain}>
        <div className={classes.draftTitleRow}>
          <a href={href} className={classes.draftTitle}>
            {draftTitle(draft)}
          </a>
          {draft.label && <span className={classes.urlName}>{draft.urlName}</span>}
        </div>
        <div className={classes.meta}>
          <span>{draftFormatName(draft)}</span>
          <span>{draft.players.length} players</span>
          <span>{formatDay(draft.createdAt)}</span>
          {isOwner && <span>{SOURCE_LABEL[draft.source] ?? draft.source}</span>}
        </div>
        {draft.players.length > 0 && (
          <div className={classes.players}>
            {draft.players.map((player, idx) => (
              <span key={idx} className={classes.player} title={player.factionId ? `${player.name}, ${factions[player.factionId]?.name}` : player.name}>
                {player.factionId && factions[player.factionId] ? (
                  <img src={factions[player.factionId].iconPath} alt="" />
                ) : (
                  <i className={classes.playerDot} />
                )}
                <span>{player.name}</span>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className={classes.draftEnd}>
        <span className={cx(classes.status, draft.isComplete ? classes.statusDone : draft.picks > 0 ? classes.statusLive : classes.statusIdle)}>
          {draft.isComplete ? status : `${status}, ${draft.picks} of ${draft.totalPicks}`}
        </span>
        {!draft.isComplete && (
          <span className={classes.bar} aria-hidden>
            <i style={{ width: `${Math.round(progress * 100)}%` }} />
          </span>
        )}
        <div className={classes.draftActions}>
          {draft.isComplete && (
            <ButtonLink to="/draft/$id/replay" params={{ id: draft.urlName }} size="sm" variant="tertiary" icon={<IconPlayerTrackNext />}>
              Replay
            </ButtonLink>
          )}
          {isOwner && (
            <Menu
              width={220}
              trigger={
                <IconButton label={`Actions for ${draftTitle(draft)}`} size="sm">
                  <IconDots />
                </IconButton>
              }
            >
              <MenuItem icon={<IconPencil />} onClick={onRename}>
                Rename
              </MenuItem>
              <MenuItem icon={<IconLink />} onClick={copyLink}>
                Copy draft link
              </MenuItem>
              <MenuSeparator />
              {draft.archived ? (
                <MenuItem icon={<IconArchiveOff />} onClick={() => setArchived(false)}>
                  Restore
                </MenuItem>
              ) : (
                <MenuItem icon={<IconArchive />} description="Hidden from your hub and its visitors" onClick={() => setArchived(true)}>
                  Archive
                </MenuItem>
              )}
            </Menu>
          )}
        </div>
      </div>
    </article>
  );
}
