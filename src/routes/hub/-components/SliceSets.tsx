import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { IconPlayerPlay, IconSearch } from "@tabler/icons-react";
import "~/routes/draft/new/-handoff";
import { SliceMap } from "~/components/Slice/SliceMap";
import { SliceFeatures } from "~/components/Slice/SliceFeatures";
import { draftConfig } from "~/draft";
import { loadDraftPreset } from "~/server/draftPresets.functions";
import { editHubSliceSet, type HubSliceSet, type HubSliceSetsPage } from "~/server/hub.functions";
import { SLICE_SET_PAGE_SIZE } from "~/utils/hubPagination";
import type { DraftType } from "~/types";
import { Button, Modal, Segmented, TextInput, ValuePill, notify } from "~/ui";
import { formatName, formatValue, summarizeSlices } from "../-utils";
import { HubPager, RenameModal, useHubList } from "./HubList";
import { SliceSetCard } from "./SliceSetCard";
import classes from "../hub.module.css";

export function SliceSets({ page, isOwner }: { page: HubSliceSetsPage; isOwner: boolean }) {
  const { search, navigate, listTop, query, setQuery, goToPage } = useHubList(
    { q: "setsQ", cursor: "setsCursor" },
    page.pageCursors,
  );
  const [viewing, setViewing] = useState<HubSliceSet>();
  const [renaming, setRenaming] = useState<HubSliceSet>();
  const showArchived = search.sets === "archived";
  const { start, starting } = useStartFromSliceSet();

  const setView = (view: "hub" | "archived") =>
    navigate({
      search: (prev) => ({ ...prev, sets: view === "archived" ? "archived" : undefined, setsCursor: undefined }),
      resetScroll: false,
    });

  const hubIsEmpty = page.hubTotal === 0 && page.counts.archived === 0 && !search.setsQ;

  return (
    <section className={classes.column} aria-labelledby="hub-slices">
      <div className={classes.toolbar} ref={listTop}>
        <TextInput
          aria-label="Search slice sets"
          className={classes.search}
          placeholder={page.hubTotal > 0 ? `Search ${page.hubTotal} slice ${page.hubTotal === 1 ? "set" : "sets"} by name, format or 6p` : "Search slice sets"}
          leftIcon={<IconSearch />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          disabled={hubIsEmpty}
          size="sm"
        />
        {isOwner && (page.counts.archived > 0 || showArchived) && (
          <Segmented<"hub" | "archived">
            label="Show"
            size="sm"
            value={showArchived ? "archived" : "hub"}
            onChange={setView}
            options={[
              { value: "hub", label: `On hub ${page.counts.active}` },
              { value: "archived", label: `Archived ${page.counts.archived}` },
            ]}
          />
        )}
      </div>

      {hubIsEmpty ? (
        <div className={classes.empty}>
          <p>
            {isOwner
              ? "In the draft builder, choose Save to hub to keep a set of slices here under a name. Start a new draft from it in one click, or with the Discord bot."
              : "No slice sets here yet."}
          </p>
        </div>
      ) : page.sliceSets.length === 0 ? (
        <div className={classes.empty}>
          <p>
            {search.setsQ
              ? `No slice sets match “${search.setsQ}”.`
              : showArchived
                ? "Nothing is archived."
                : "No slice sets on the hub. Restore one from Archived, or save new slices from the draft builder."}
          </p>
        </div>
      ) : (
        <>
          <div className={classes.sets}>
            {page.sliceSets.map((set) => (
              <SliceSetCard
                key={set.id}
                set={set}
                isOwner={isOwner}
                starting={starting === set.id}
                onStart={() => start(set)}
                onView={() => setViewing(set)}
                onRename={() => setRenaming(set)}
              />
            ))}
          </div>
          <HubPager page={page} pageSize={SLICE_SET_PAGE_SIZE} shown={page.sliceSets.length} onChange={goToPage} />
        </>
      )}

      <SliceSetModal set={viewing} onClose={() => setViewing(undefined)} />
      <RenameModal
        itemId={renaming?.id}
        initialValue={renaming?.title ?? ""}
        title="Rename slice set"
        label="Name"
        hint="The Discord preset name stays the same."
        required
        onSave={async (title) => {
          if (!renaming) return;
          await editHubSliceSet({ data: { sliceSetId: renaming.id, title } });
          notify({ tone: "success", title: "Slice set renamed", message: title.trim() });
        }}
        onClose={() => setRenaming(undefined)}
      />
    </section>
  );
}

function useStartFromSliceSet() {
  const navigate = useNavigate();
  const [starting, setStarting] = useState<string>();

  const start = async (set: HubSliceSet) => {
    setStarting(set.id);
    try {
      const result = await loadDraftPreset({ data: set.presetName });
      if (!result.success) {
        notify({ tone: "danger", title: "Could not start a draft", message: result.error });
        return;
      }
      const { preset } = result;
      navigate({
        to: "/draft/new",
        state: {
          newDraft: {
            savedDraftState: {
              ...preset.data,
              integrations: {},
              players: Array.from({ length: preset.playerCount }, (_, id) => ({ id, name: "" })),
              selections: [],
              pickOrder: [],
            },
          },
        },
      });
    } catch {
      notify({ tone: "danger", title: "Could not start a draft", message: "Something went wrong. Try again." });
    } finally {
      setStarting(undefined);
    }
  };

  return { start, starting };
}

function SliceSetModal({ set, onClose }: { set?: HubSliceSet; onClose: () => void }) {
  const { start, starting } = useStartFromSliceSet();
  const config = set ? draftConfig[set.data.settings.type as DraftType] : undefined;
  const summaries = set ? summarizeSlices(set) : [];

  return (
    <Modal
      opened={!!set}
      onClose={onClose}
      title={set?.title}
      description={set ? `${formatName(set.data.settings)}, ${set.playerCount} players` : undefined}
      size="xl"
      footer={
        set && (
          <>
            <Button variant="tertiary" onClick={onClose}>
              Close
            </Button>
            <Button variant="primary" icon={<IconPlayerPlay />} onClick={() => start(set)} loading={starting === set.id}>
              Start draft
            </Button>
          </>
        )
      }
    >
      <div className={classes.sliceGrid}>
        {summaries.map(({ slice, value, r, i, f }, idx) => (
          <div key={idx} className={classes.sliceCard}>
            <div className={classes.sliceCardHead}>
              <span className={classes.sliceName} title={slice.name}>
                {slice.name}
              </span>
              <span className={classes.sv}>
                SV <b>{formatValue(value)}</b>
              </span>
            </div>
            {config && (
              <div className={classes.sliceMap}>
                <SliceMap
                  id={`hub-${set!.id}-${idx}`}
                  tiles={slice.tiles}
                  sliceHeight={config.sliceHeight}
                  sliceConcentricCircles={config.sliceConcentricCircles}
                  wOffsetMultiplier={config.wOffsetMultiplier}
                />
              </div>
            )}
            <ValuePill size="sm" r={r} i={i} f={f} total={r + i + f} />
            <SliceFeatures slice={slice} />
          </div>
        ))}
      </div>
    </Modal>
  );
}
