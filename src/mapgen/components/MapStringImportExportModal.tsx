import { IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import { useState } from "react";
import {
  Button,
  Divider,
  Modal,
  Segmented,
  Textarea,
  useClipboard,
} from "~/ui";
import type { ExternalMapStringFormat } from "../utils/externalMapStringCodec";
import classes from "./MapGenerator.module.css";

type Props = {
  exportStrings: Record<ExternalMapStringFormat, string>;
  opened: boolean;
  onClose: () => void;
  onImport: (mapString: string, format: ExternalMapStringFormat) => boolean;
};

const FORMAT_OPTIONS: { label: string; value: ExternalMapStringFormat }[] = [
  { label: "TTPG", value: "ttpg" },
  { label: "Async", value: "async" },
];

const formatLabel = (format: ExternalMapStringFormat) =>
  format === "ttpg" ? "TTPG" : "Async";

export function MapStringImportExportModal({
  exportStrings,
  opened,
  onClose,
  onImport,
}: Props) {
  const [exportFormat, setExportFormat] =
    useState<ExternalMapStringFormat>("ttpg");
  const [importFormat, setImportFormat] =
    useState<ExternalMapStringFormat>("ttpg");
  const [importString, setImportString] = useState("");
  const { copied, copy } = useClipboard();

  const exportString = exportStrings[exportFormat];

  const resetAndClose = () => {
    setExportFormat("ttpg");
    setImportFormat("ttpg");
    setImportString("");
    onClose();
  };

  const handleImport = () => {
    if (onImport(importString, importFormat)) resetAndClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={resetAndClose}
      size="lg"
      title="Map string import and export"
      footer={
        <>
          <Button variant="tertiary" onClick={resetAndClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<IconDownload size={16} />}
            onClick={handleImport}
            disabled={!importString.trim()}
          >
            Import {formatLabel(importFormat)} map
          </Button>
        </>
      }
    >
      <div className={classes.stringBlock}>
        <div className={classes.stringHead}>
          <label htmlFor="map-string-export">Export for</label>
          <Segmented
            size="sm"
            label="Export format"
            options={FORMAT_OPTIONS}
            value={exportFormat}
            onChange={setExportFormat}
          />
        </div>
        <Textarea
          id="map-string-export"
          mono
          readOnly
          rows={3}
          value={exportString || "No map data to export"}
          onFocus={(e) => e.currentTarget.select()}
        />
        <Button
          size="sm"
          className={classes.selfStart}
          disabled={!exportString}
          onClick={() => copy(exportString)}
          icon={copied ? <IconCheck size={15} /> : <IconCopy size={15} />}
        >
          {copied ? "Copied" : `Copy ${formatLabel(exportFormat)} string`}
        </Button>
      </div>

      <Divider />

      <div className={classes.stringBlock}>
        <div className={classes.stringHead}>
          <label htmlFor="map-string-import">Import from</label>
          <Segmented
            size="sm"
            label="Import format"
            options={FORMAT_OPTIONS}
            value={importFormat}
            onChange={setImportFormat}
          />
        </div>
        <Textarea
          id="map-string-import"
          mono
          rows={3}
          placeholder={
            importFormat === "ttpg"
              ? "Paste a TTPG map string…"
              : "Paste an Async map string…"
          }
          value={importString}
          onChange={(event) => setImportString(event.currentTarget.value)}
        />
      </div>
    </Modal>
  );
}
