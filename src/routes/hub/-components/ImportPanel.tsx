import { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { IconAlertTriangle, IconCheck, IconFileImport, IconMinus } from "@tabler/icons-react";
import { importToHub, type ImportResult } from "~/server/hub.functions";
import { Button, Panel, Text, Textarea, notify } from "~/ui";
import classes from "../hub.module.css";

const STATUS_TEXT: Record<ImportResult["status"], string> = {
  added: "Added",
  already: "Already on your hub",
  notFound: "No draft or preset with that name",
  invalid: "Not a draft link",
};

/** Paste old draft links (comma, space or line separated) to bring them onto the hub. */
export function ImportPanel({ defaultOpen }: { defaultOpen: boolean }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ImportResult[]>();

  const runImport = async () => {
    if (!text.trim()) return;
    setImporting(true);
    try {
      const { results } = await importToHub({ data: { text } });
      setResults(results);
      const added = results.filter((r) => r.status === "added").length;
      const failed = results.filter((r) => r.status === "notFound" || r.status === "invalid").length;
      notify({
        tone: failed > 0 && added === 0 ? "danger" : "success",
        title: added > 0 ? `Imported ${added} ${added === 1 ? "item" : "items"}` : "Nothing new to import",
        message: failed > 0 ? `${failed} ${failed === 1 ? "link" : "links"} couldn't be found. See the list below.` : undefined,
      });
      if (added > 0) {
        setText("");
        router.invalidate();
      }
    } catch {
      notify({ tone: "danger", title: "Import failed", message: "Something went wrong. Try again." });
    } finally {
      setImporting(false);
    }
  };

  return (
    <Panel title="Import past drafts" icon={<IconFileImport />} collapsible defaultOpen={defaultOpen} summary="Bring in games from before your hub">
      <div className={classes.import}>
        <Text size="sm" tone="muted">
          Paste draft links separated by commas or new lines. Full links (tidraft.com/draft/brave-red-fox) and bare names (brave-red-fox) both work, and so do multidraft links and preset names.
        </Text>
        <Textarea
          aria-label="Draft links"
          mono
          rows={4}
          placeholder={"https://tidraft.com/draft/brave-red-fox,\nquiet-amber-moon, https://tidraft.com/multidraft/calm-blue-sky"}
          value={text}
          onChange={(e) => setText(e.currentTarget.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) runImport();
          }}
        />
        <div className={classes.importRow}>
          <Button icon={<IconFileImport />} onClick={runImport} loading={importing} disabled={!text.trim()}>
            Import
          </Button>
          {results && (
            <Text size="sm" tone="muted">
              {results.filter((r) => r.status === "added").length} added, {results.filter((r) => r.status === "already").length} already here,{" "}
              {results.filter((r) => r.status === "notFound" || r.status === "invalid").length} not found
            </Text>
          )}
        </div>
        {results && results.length > 0 && (
          <ul className={classes.results}>
            {results.map((result, idx) => (
              <li key={idx} className={classes.result}>
                {result.status === "added" ? (
                  <IconCheck className={classes.resultAdded} />
                ) : result.status === "already" ? (
                  <IconMinus className={classes.resultAlready} />
                ) : (
                  <IconAlertTriangle className={classes.resultFailed} />
                )}
                <span className={classes.resultInput} title={result.input}>
                  {result.name && result.name !== result.input ? `${result.input} (${result.name})` : result.input}
                </span>
                <span className={result.status === "added" ? classes.resultAdded : result.status === "already" ? classes.resultAlready : classes.resultFailed}>
                  {result.status === "added" && result.kind === "sliceSet" ? "Added as a slice set" : STATUS_TEXT[result.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Panel>
  );
}
