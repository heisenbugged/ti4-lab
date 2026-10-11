import { useState, type ReactNode } from "react";
import { IconArrowBackUp } from "@tabler/icons-react";
import {
  Button,
  Modal,
  NumberField,
  NumberStepper,
  Tooltip,
  cx,
} from "~/ui";
import {
  DEFAULT_SLICE_SETTINGS,
  type SliceGenerationSettings,
  type SliceSettingsFormatType,
} from "~/draft/sliceSettings";
import classes from "./SliceSettingsModal.module.css";

// Fields to disable (hide) per format type
const DISABLED_FIELDS: Record<
  SliceSettingsFormatType,
  (keyof SliceGenerationSettings)[]
> = {
  milty: [],
  miltyeq: [],
  heisen: [
    // Slice Quality - nucleus has different generation
    "safePathToMecatol",
    "centerTileNotEmpty",
    "highQualityAdjacent",
    // Wormholes & Legendaries - nucleus uses weighted distribution
    "minAlphaWormholes",
    "minBetaWormholes",
    "minLegendaries",
    "maxLegendaries",
  ],
};

const FORMAT_NAMES: Record<SliceSettingsFormatType, string> = {
  milty: "Milty",
  miltyeq: "Milty EQ",
  heisen: "Nucleus",
};

type Props = {
  opened: boolean;
  formatType: SliceSettingsFormatType;
  settings: SliceGenerationSettings;
  onClose: () => void;
  onSave: (newSettings: SliceGenerationSettings) => void;
};

type CountKey = keyof SliceGenerationSettings;

type CountProps = {
  label: string;
  property: CountKey;
  value: number | undefined;
  onChange: (property: CountKey, value: number | undefined) => void;
  defaultValue?: number;
  /** Stepping below 1 switches the limit off. */
  allowUndefined?: boolean;
  minValue?: number;
};

/** Small whole-number stepper; "off" when the limit is switched off. */
function Count({
  label,
  property,
  value,
  onChange,
  defaultValue,
  allowUndefined = false,
  minValue,
}: CountProps) {
  const handleDecrease = () => {
    if (value === undefined) return;

    if (minValue !== undefined) {
      onChange(property, Math.max(minValue, value - 1));
      return;
    }

    const newValue = value - 1;
    if (newValue <= 0 && allowUndefined) {
      onChange(property, undefined);
    } else {
      onChange(property, Math.max(0, newValue));
    }
  };

  const handleIncrease = () => {
    if (value === undefined) {
      onChange(property, defaultValue ?? minValue ?? 0);
    } else {
      onChange(property, value + 1);
    }
  };

  const decreaseDisabled =
    value === undefined ||
    (minValue !== undefined && value <= minValue) ||
    (!allowUndefined && value <= 0);

  return (
    <NumberStepper
      size="sm"
      label={label}
      value={value}
      display={value === undefined ? <i>off</i> : undefined}
      decrease={handleDecrease}
      increase={handleIncrease}
      decreaseDisabled={decreaseDisabled}
    />
  );
}

/** Signed decimal weight with free entry. */
function Weight({
  label,
  value,
  onChange,
  step = 0.5,
  min,
  max,
  multiplier,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  multiplier?: boolean;
}) {
  return (
    <span
      className={cx(
        classes.weight,
        !multiplier && value > 0 && classes.pos,
        !multiplier && value < 0 && classes.neg,
      )}
    >
      <NumberField
        size="sm"
        aria-label={label}
        value={value}
        onChange={(val) => onChange(typeof val === "number" ? val : 0)}
        step={step}
        min={min}
        max={max}
        format={{
          maximumFractionDigits: 2,
          signDisplay: multiplier ? "auto" : "exceptZero",
        }}
      />
    </span>
  );
}

function WeightRow({
  art,
  title,
  hint,
  tooltip,
  children,
}: {
  art: ReactNode;
  title: string;
  hint?: string;
  tooltip?: string;
  children: ReactNode;
}) {
  const label = <b className={tooltip ? classes.help : undefined}>{title}</b>;
  return (
    <div className={classes.wrow}>
      <span className={classes.wart} aria-hidden>
        {art}
      </span>
      <span className={classes.wtxt}>
        {tooltip ? <Tooltip label={tooltip}>{label}</Tooltip> : label}
        {hint && <small>{hint}</small>}
      </span>
      {children}
    </div>
  );
}

const fmt = (n: number) =>
  `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toFixed(1)}`;

/** Where the slice value range sits on a 0 to 20 scale. */
function ValueTrack({ min, max }: { min?: number; max?: number }) {
  const scale = 20;
  const pct = (v: number) => `${(Math.min(Math.max(v, 0), scale) / scale) * 100}%`;
  const left = min !== undefined ? pct(min) : "0%";
  const right = max !== undefined ? pct(max) : "100%";
  return (
    <div className={classes.track} aria-hidden>
      <div className={classes.rail}>
        <span
          className={classes.band}
          style={{ left, right: `calc(100% - ${right})` }}
        />
        {min !== undefined && <span className={classes.knob} style={{ left }} />}
        {max !== undefined && (
          <span className={classes.knob} style={{ left: right }} />
        )}
      </div>
      <div className={classes.ticks}>
        {[0, 5, 10, 15, 20].map((t) => (
          <span key={t}>{t}</span>
        ))}
      </div>
    </div>
  );
}

export function SliceSettingsModal({
  opened,
  formatType,
  onClose,
  settings,
  onSave,
}: Props) {
  const [localSettings, setLocalSettings] =
    useState<SliceGenerationSettings>(settings);

  // Start over from the saved settings when they (or the format) change.
  const [source, setSource] = useState({ settings, formatType });
  if (source.settings !== settings || source.formatType !== formatType) {
    setSource({ settings, formatType });
    setLocalSettings(settings);
  }

  const defaults = DEFAULT_SLICE_SETTINGS[formatType];
  const disabledFields = DISABLED_FIELDS[formatType];
  const isDisabled = (field: keyof SliceGenerationSettings) =>
    disabledFields.includes(field);

  const handleSettingChange = (
    property: keyof SliceGenerationSettings,
    value: number | undefined,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [property]: value,
    }));
  };

  const handleMinLegendariesChange = (
    property: keyof SliceGenerationSettings,
    value: number | undefined,
  ) => {
    handleSettingChange(property, value);
    if (
      value !== undefined &&
      localSettings.maxLegendaries !== undefined &&
      localSettings.maxLegendaries < value
    ) {
      handleSettingChange("maxLegendaries", value);
    }
  };

  const handleMaxLegendariesChange = (
    property: keyof SliceGenerationSettings,
    value: number | undefined,
  ) => {
    const constrainedValue =
      value !== undefined && value < localSettings.minLegendaries
        ? localSettings.minLegendaries
        : value;
    handleSettingChange(property, constrainedValue);
  };

  const handleReset = () => {
    setLocalSettings(defaults);
  };

  const name = FORMAT_NAMES[formatType];
  const s = localSettings;
  const exampleTech = 2 * s.techValue;
  const exampleTotal = 12 + exampleTech + s.nebulaOnPathPenalty;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={`${name} slice settings`}
      description="The rules every generated slice must meet, and how a slice's value is counted."
      footer={
        <>
          <Button
            variant="tertiary"
            icon={<IconArrowBackUp size={16} />}
            onClick={handleReset}
            className={classes.reset}
          >
            Reset to {name} defaults
          </Button>
          <Button
            variant="tertiary"
            onClick={() => {
              setLocalSettings(settings);
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onSave(localSettings);
              onClose();
            }}
          >
            Save settings
          </Button>
        </>
      }
    >
      <div className={classes.body}>
        <section className={classes.card}>
          <h4>Balance</h4>
          <div className={classes.field}>
            <div className={classes.lbl}>
              <b>Slice value</b>
              <small>Every slice lands in this range</small>
            </div>
            <div className={classes.range}>
              <Count
                label="Min slice value"
                property="minSliceValue"
                value={s.minSliceValue}
                onChange={handleSettingChange}
                allowUndefined
                defaultValue={defaults.minSliceValue}
              />
              <span className={classes.to}>to</span>
              <Count
                label="Max slice value"
                property="maxSliceValue"
                value={s.maxSliceValue}
                onChange={handleSettingChange}
                allowUndefined
                defaultValue={defaults.maxSliceValue}
              />
            </div>
          </div>
          <ValueTrack min={s.minSliceValue} max={s.maxSliceValue} />
          <div className={classes.field}>
            <div className={classes.lbl}>
              <b>Minimum optimal</b>
              <small>Per slice, before features</small>
            </div>
            <div className={classes.range}>
              <span className={cx(classes.ri, classes.r)}>R</span>
              <Count
                label="Min optimal resources"
                property="minOptimalResources"
                value={s.minOptimalResources}
                onChange={handleSettingChange}
                allowUndefined
                defaultValue={defaults.minOptimalResources}
              />
              <span className={cx(classes.ri, classes.i)}>I</span>
              <Count
                label="Min optimal influence"
                property="minOptimalInfluence"
                value={s.minOptimalInfluence}
                onChange={handleSettingChange}
                allowUndefined
                defaultValue={defaults.minOptimalInfluence}
              />
            </div>
          </div>
          <p className={classes.note}>
            Step a limit below 1 to switch it off.
          </p>

          {!isDisabled("minAlphaWormholes") && (
            <>
              <h4>On the map</h4>
              <div className={classes.mapGrid}>
                <div className={classes.mini}>
                  <span
                    className={classes.wh}
                    style={{ "--wh": "var(--wormhole-alpha)" } as React.CSSProperties}
                  >
                    α
                  </span>
                  <b>Alpha wormholes</b>
                  <small>at least</small>
                  <Count
                    label="Min alpha wormholes"
                    property="minAlphaWormholes"
                    value={s.minAlphaWormholes}
                    onChange={handleSettingChange}
                  />
                </div>
                <div className={classes.mini}>
                  <span
                    className={classes.wh}
                    style={{ "--wh": "var(--wormhole-beta)" } as React.CSSProperties}
                  >
                    β
                  </span>
                  <b>Beta wormholes</b>
                  <small>at least</small>
                  <Count
                    label="Min beta wormholes"
                    property="minBetaWormholes"
                    value={s.minBetaWormholes}
                    onChange={handleSettingChange}
                  />
                </div>
                <div className={cx(classes.mini, classes.miniWide)}>
                  <img src="/legendary.webp" alt="" />
                  <b>Legendary planets</b>
                  <span className={classes.between}>
                    <small>between</small>
                    <Count
                      label="Min legendary planets"
                      property="minLegendaries"
                      value={s.minLegendaries}
                      onChange={handleMinLegendariesChange}
                    />
                    <small>and</small>
                    <Count
                      label="Max legendary planets"
                      property="maxLegendaries"
                      value={s.maxLegendaries}
                      onChange={handleMaxLegendariesChange}
                      allowUndefined
                      defaultValue={defaults.maxLegendaries}
                      minValue={s.minLegendaries}
                    />
                  </span>
                </div>
              </div>
            </>
          )}

          {!isDisabled("safePathToMecatol") && (
            <>
              <h4>
                Slice quality <small>How many slices must have</small>
              </h4>
              <div className={classes.wlist}>
                <div className={cx(classes.wrow, classes.qrow)}>
                  <span className={classes.wtxt}>
                    <b>Safe path to Mecatol</b>
                    <small>Slices with clear path to center</small>
                  </span>
                  <Count
                    label="Safe path to Mecatol"
                    property="safePathToMecatol"
                    value={s.safePathToMecatol}
                    onChange={handleSettingChange}
                  />
                </div>
                <div className={cx(classes.wrow, classes.qrow)}>
                  <span className={classes.wtxt}>
                    <b>High-quality adjacent</b>
                    <small>Slices with good tiles adjacent to home</small>
                  </span>
                  <Count
                    label="High-quality adjacent"
                    property="highQualityAdjacent"
                    value={s.highQualityAdjacent}
                    onChange={handleSettingChange}
                  />
                </div>
                <div className={cx(classes.wrow, classes.qrow)}>
                  <span className={classes.wtxt}>
                    <b>Safe center tile</b>
                    <small>Slices with no empty/anomaly center</small>
                  </span>
                  <Count
                    label="Safe center tile"
                    property="centerTileNotEmpty"
                    value={s.centerTileNotEmpty}
                    onChange={handleSettingChange}
                  />
                </div>
              </div>
            </>
          )}
        </section>

        <section className={classes.card}>
          <h4>
            What a slice is worth <small>Added to optimal R + I + F</small>
          </h4>
          <div className={classes.wlist}>
            <WeightRow
              art={
                <>
                  <img src="/biotic.webp" alt="" />
                  <img src="/warfare.webp" alt="" />
                </>
              }
              title="Tech skip"
              hint="Each skip on a planet"
              tooltip="Bonus value added for each tech specialty (red/blue/green/yellow skip) on a planet"
            >
              <Weight
                label="Tech skip"
                value={s.techValue}
                onChange={(v) => handleSettingChange("techValue", v)}
                step={0.25}
              />
            </WeightRow>
            <WeightRow
              art={<img src="/tradestation.png" alt="" />}
              title="Trade station"
              tooltip="Bonus value added for trade station planets"
            >
              <Weight
                label="Trade station"
                value={s.tradeStationValue}
                onChange={(v) => handleSettingChange("tradeStationValue", v)}
              />
            </WeightRow>
            <WeightRow
              art={<img className={classes.wtile} src="/entropic.png" alt="" />}
              title="Entropic scar"
              hint="Systems with the anomaly"
              tooltip="Bonus value added for systems with the Entropic Scar anomaly"
            >
              <Weight
                label="Entropic scar"
                value={s.entropicScarValue}
                onChange={(v) => handleSettingChange("entropicScarValue", v)}
              />
            </WeightRow>
            <WeightRow
              art={<span className={classes.wnum}>×</span>}
              title="Equidistant penalty"
              hint="Multiplier, 0 to 1"
              tooltip="Multiplier applied to equidistant tiles (tiles equally close to multiple home systems). Lower values penalize these tiles more."
            >
              <Weight
                label="Equidistant penalty"
                value={s.equidistantMultiplier}
                onChange={(v) => handleSettingChange("equidistantMultiplier", v)}
                step={0.1}
                min={0}
                max={1}
                multiplier
              />
            </WeightRow>
          </div>

          <h5>Legendaries</h5>
          <div className={classes.wlist}>
            <WeightRow
              art={<img className={classes.wtile} src="/tiles/ST_66.png" alt="" />}
              title="Hope's End"
            >
              <Weight
                label="Hope's End"
                value={s.hopesEndValue}
                onChange={(v) => handleSettingChange("hopesEndValue", v)}
              />
            </WeightRow>
            <WeightRow art={<img src="/legendary.webp" alt="" />} title="Emelpar">
              <Weight
                label="Emelpar"
                value={s.emelparValue}
                onChange={(v) => handleSettingChange("emelparValue", v)}
              />
            </WeightRow>
            <WeightRow art={<img src="/legendary.webp" alt="" />} title="Industrex">
              <Weight
                label="Industrex"
                value={s.industrexValue}
                onChange={(v) => handleSettingChange("industrexValue", v)}
              />
            </WeightRow>
            <WeightRow
              art={<img src="/legendary.webp" alt="" />}
              title="Other legendary"
            >
              <Weight
                label="Other legendary"
                value={s.otherLegendaryValue}
                onChange={(v) => handleSettingChange("otherLegendaryValue", v)}
              />
            </WeightRow>
          </div>

          <h5>On the path to Mecatol</h5>
          <div className={classes.wlist}>
            <WeightRow
              art={<img className={classes.wtile} src="/tiles/ST_43.png" alt="" />}
              title="Supernova"
              hint="Blocks the direct path"
              tooltip="Penalty applied when a supernova blocks the direct path to Mecatol Rex"
            >
              <Weight
                label="Supernova"
                value={s.supernovaOnPathPenalty}
                onChange={(v) => handleSettingChange("supernovaOnPathPenalty", v)}
              />
            </WeightRow>
            <WeightRow
              art={<img className={classes.wtile} src="/tiles/ST_42.png" alt="" />}
              title="Nebula"
              hint="On the direct path"
              tooltip="Penalty applied when a nebula is on the direct path to Mecatol Rex"
            >
              <Weight
                label="Nebula"
                value={s.nebulaOnPathPenalty}
                onChange={(v) => handleSettingChange("nebulaOnPathPenalty", v)}
              />
            </WeightRow>
          </div>

          <div className={classes.example}>
            <span>Worked example</span>
            <p>
              Optimal 7 + 5 + 0 = <b>12.0</b>, two tech skips{" "}
              <b className={classes.posText}>{fmt(exampleTech)}</b>, a nebula
              on the path{" "}
              <b className={s.nebulaOnPathPenalty < 0 ? classes.negText : classes.posText}>
                {fmt(s.nebulaOnPathPenalty)}
              </b>
              . Slice value <b>{exampleTotal.toFixed(1)}</b>.
            </p>
          </div>
        </section>
      </div>
    </Modal>
  );
}
