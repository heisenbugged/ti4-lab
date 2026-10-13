import { useEffect, useRef, useState } from "react";
import { useNavigate, useRouter, useSearch } from "@tanstack/react-router";
import type { PageInfo } from "~/utils/hubPagination";
import { Button, Modal, Pagination, TextInput } from "~/ui";
import classes from "../hub.module.css";

type ListParams = { q: "q" | "setsQ"; cursor: "cursor" | "setsCursor" };

/**
 * Search box and paging for one of the hub's lists. Both live in the url so
 * the server does the work; the search box pushes once typing pauses.
 */
export function useHubList({ q, cursor }: ListParams, pageCursors: (string | null)[]) {
  const search = useSearch({ from: "/hub/$slug" });
  const navigate = useNavigate({ from: "/hub/$slug" });
  const listTop = useRef<HTMLDivElement>(null);
  const urlQuery = search[q] ?? "";
  const [query, setQuery] = useState(urlQuery);

  useEffect(() => {
    if (query.trim() === urlQuery) return;
    const timer = setTimeout(() => {
      navigate({
        search: (prev) => ({ ...prev, [q]: query.trim() || undefined, [cursor]: undefined }),
        replace: true,
        resetScroll: false,
      });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, urlQuery, navigate, q, cursor]);

  const goToPage = (n: number) => {
    navigate({
      search: (prev) => ({ ...prev, [cursor]: pageCursors[n - 1] ?? undefined }),
      resetScroll: false,
    });
    listTop.current?.scrollIntoView({ block: "start", behavior: "smooth" });
  };

  return { search, navigate, listTop, query, setQuery, goToPage };
}

export function HubPager({
  page,
  pageSize,
  shown,
  onChange,
}: {
  page: PageInfo;
  pageSize: number;
  shown: number;
  onChange: (page: number) => void;
}) {
  if (page.pageCount <= 1) return null;
  const first = (page.page - 1) * pageSize + 1;
  return (
    <div className={classes.pager}>
      <span className={classes.pagerRange}>
        {first}–{first + shown - 1} of {page.total}
      </span>
      <Pagination page={page.page} total={page.pageCount} onChange={onChange} />
    </div>
  );
}

type RenameModalProps = {
  /** Identifies the item being renamed; undefined closes the modal. */
  itemId: string | undefined;
  initialValue: string;
  title: string;
  label: string;
  hint?: string;
  placeholder?: string;
  /** Disallow saving an empty name. */
  required?: boolean;
  onSave: (value: string) => Promise<void>;
  onClose: () => void;
};

export function RenameModal({ itemId, initialValue, title, label, hint, placeholder, required, onSave, onClose }: RenameModalProps) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastId, setLastId] = useState<string>();

  if (itemId && lastId !== itemId) {
    setLastId(itemId);
    setValue(initialValue);
  }

  const valid = !required || value.trim().length > 0;
  const save = async () => {
    if (!itemId || !valid) return;
    setSaving(true);
    await onSave(value);
    setSaving(false);
    onClose();
    router.invalidate();
  };

  return (
    <Modal
      opened={!!itemId}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={saving} disabled={!valid}>
            Save name
          </Button>
        </>
      }
    >
      <TextInput
        label={label}
        hint={hint}
        placeholder={placeholder}
        value={value}
        maxLength={80}
        onChange={(e) => setValue(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") save();
        }}
        // The field is the whole dialog.
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
      />
    </Modal>
  );
}
