import type { KeyboardEvent, MouseEvent, ReactNode } from "react";
import {
  IconAdjustmentsHorizontal,
  IconAlien,
  IconDice,
  IconHexagons,
  IconUser,
  IconUsers,
  IconUsersGroup,
} from "@tabler/icons-react";
import { FactionSettingsModal } from "~/components/FactionSettingsModal";
import { getFactionPool } from "~/utils/factions";
import { factions } from "~/data/factionData";
import { FactionId, FactionStratification } from "~/types";
import {
  Button,
  ListRow,
  NumberStepper,
  Panel,
  Rows,
  Switch,
  cx,
  useDisclosure,
} from "~/ui";
import { useDraftSetup } from "../store";
import { isMiltyVariant, isMiltyEqVariant } from "../maps";
import { ContentPacksSection } from "./ContentPacksSection";
import layout from "../prechoice.module.css";
import classes from "./DraftConfigurationPanel.module.css";

type Props = {
  maxSlices: number;
};

/** Clicks on the switch or a stepper inside a card shouldn't toggle the card too. */
const fromControl = (e: MouseEvent) =>
  !!(e.target as HTMLElement).closest("button, label, input, [role='switch']");

type RuleCardProps = {
  title: string;
  description: string;
  art: ReactNode;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
  disabledReason?: string;
  /** Shown under the description while the rule is on. */
  extra?: ReactNode;
};

function RuleCard({
  title,
  description,
  art,
  checked,
  onToggle,
  disabled,
  disabledReason,
  extra,
}: RuleCardProps) {
  return (
    // The whole card is a mouse target; the switch inside is the keyboard control.
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
    <div
      className={cx(
        classes.rule,
        checked && classes.ruleOn,
        disabled && classes.ruleDisabled,
      )}
      onClick={(e) => {
        if (disabled || fromControl(e)) return;
        onToggle();
      }}
    >
      <span className={classes.art} aria-hidden>
        {art}
      </span>
      <span className={classes.ruleTxt}>
        <b>{title}</b>
        <small>{disabled && disabledReason ? disabledReason : description}</small>
        {checked && extra && <span className={classes.extra}>{extra}</span>}
      </span>
      <Switch
        aria-label={title}
        checked={checked}
        onChange={() => onToggle()}
        disabled={disabled}
      />
    </div>
  );
}

type ModeCardProps = {
  title: string;
  description: string;
  icon: ReactNode;
  checked: boolean;
  onSelect: () => void;
  children?: ReactNode;
};

function ModeCard({
  title,
  description,
  icon,
  checked,
  onSelect,
  children,
}: ModeCardProps) {
  return (
    <div
      role="radio"
      aria-checked={checked}
      tabIndex={checked ? 0 : -1}
      className={cx(classes.mode, checked && classes.modeOn)}
      onMouseDown={(e) => {
        if (e.button !== 0 || fromControl(e)) return;
        onSelect();
      }}
      onKeyDown={(e: KeyboardEvent) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          onSelect();
        }
      }}
    >
      {icon}
      <b>{title}</b>
      <span>{description}</span>
      {children}
    </div>
  );
}

const factionArt = (id: FactionId) => (
  <img src={factions[id].iconPath} alt="" />
);

export function DraftConfigurationPanel({ maxSlices }: Props) {
  const faction = useDraftSetup((state) => state.faction);
  const slices = useDraftSetup((state) => state.slices);
  const format = useDraftSetup((state) => state.format);
  const content = useDraftSetup((state) => state.content);
  const multidraft = useDraftSetup((state) => state.multidraft);
  const playerCount = useDraftSetup((state) => state.player.players.length);
  const mapType = useDraftSetup((state) => state.map.selectedMapType);

  const factionGameSets = useDraftSetup((state) =>
    state.content.getFactionGameSets(),
  );
  const factionConstraints = faction.getFactionConstraints();

  const [
    factionSettingsOpened,
    { open: openFactionSettings, close: closeFactionSettings },
  ] = useDisclosure(false);

  const handleSaveFactionSettings = (
    allowedFactionsParam: FactionId[],
    requiredFactionsParam: FactionId[],
    stratifiedConfigParam: FactionStratification | undefined,
  ) => {
    faction.setStratification(
      allowedFactionsParam,
      requiredFactionsParam,
      stratifiedConfigParam,
    );
    closeFactionSettings();
  };

  const { withDrahn } = content.flags;

  const showMinorFactions =
    isMiltyVariant(mapType) || isMiltyEqVariant(mapType);
  const sharedMinorPool = faction.minorFactionsMode?.mode === "sharedPool";
  const sharedPoolReason = "Not available with a shared minor faction pool.";
  const bagsOn = Number(faction.preassignedFactions) > 0;

  const moreOptions = [
    { label: "Multidraft", on: multidraft.isMultidraft },
    { label: "Home planets", on: format.allowHomePlanetSearch },
    { label: "Monuments", on: format.showMonumentImagesInFactionInfo },
    { label: "Drahn", on: withDrahn },
  ];
  const moreOn = moreOptions.filter((o) => o.on);
  const moreSummary = moreOn.length
    ? `${moreOn.map((o) => o.label).join(", ")} on`
    : "Multidraft, home planets, monuments, Drahn";

  return (
    <>
      <FactionSettingsModal
        buttonText="Save pool"
        opened={factionSettingsOpened}
        numPlayers={playerCount}
        factionPool={getFactionPool(factionGameSets)}
        factionGameSets={factionGameSets}
        savedAllowedFactions={faction.allowedFactions}
        savedRequiredFactions={faction.requiredFactions}
        savedStratifiedConfig={faction.stratifiedConfig}
        onClose={closeFactionSettings}
        onSave={handleSaveFactionSettings}
      />

      {/* Factions and slices side by side */}
      <div className={layout.two}>
        <Panel
          title="Factions"
          icon={<IconAlien />}
          iconTint="var(--legendary)"
        >
          <div className={classes.panelBody}>
            <ListRow label="In pool">
              <NumberStepper
                value={faction.numFactions}
                label="factions in pool"
                decrease={faction.decrementNumFactions}
                increase={faction.incrementNumFactions}
                decreaseDisabled={
                  !!faction.preassignedFactions ||
                  faction.numFactions <= factionConstraints.minNumFactions
                }
                increaseDisabled={
                  !!faction.preassignedFactions ||
                  faction.numFactions >= factionConstraints.maxNumFactions
                }
              />
            </ListRow>
            <Button
              size="sm"
              block
              icon={<IconAdjustmentsHorizontal size={16} />}
              onClick={openFactionSettings}
            >
              Configure pool
            </Button>
          </div>
        </Panel>

        <Panel
          title="Slices"
          icon={<IconHexagons />}
          iconTint="var(--legendary)"
        >
          <ListRow
            label="In pool"
            hint={`Up to ${maxSlices} with current tiles`}
          >
            <NumberStepper
              value={slices.numSlices}
              label="slices in pool"
              decrease={() => slices.setNumSlices(slices.numSlices - 1)}
              increase={() => slices.setNumSlices(slices.numSlices + 1)}
              decreaseDisabled={slices.numSlices <= playerCount}
              increaseDisabled={slices.numSlices >= maxSlices}
            />
          </ListRow>
        </Panel>
      </div>

      <ContentPacksSection />

      <Panel
        title="Draft rules"
        icon={<IconAdjustmentsHorizontal />}
        iconTint="var(--gold)"
        action={<span className={classes.optional}>Optional</span>}
      >
        <div className={classes.rules}>
          <RuleCard
            title="Draft speaker order"
            description="Separate speaker order from seat selection"
            art={
              <span className={classes.nums}>
                <span>1</span>
                <span>2</span>
                <span>3</span>
              </span>
            }
            checked={format.draftSpeaker}
            onToggle={() => format.setDraftSpeaker(!format.draftSpeaker)}
          />
          <RuleCard
            title="Faction ban phase"
            description="Players ban one faction each before rolling"
            art={<span className={classes.ban}>{factionArt("nekro")}</span>}
            checked={format.banFactions}
            onToggle={() => format.setBanFactions(!format.banFactions)}
            disabled={sharedMinorPool}
            disabledReason={sharedPoolReason}
          />
          <RuleCard
            title="Draft player colors"
            description="Choose in-game color via draft"
            art={
              <>
                <i style={{ background: "var(--player-red)" }} />
                <i style={{ background: "var(--player-orange)" }} />
                <i style={{ background: "var(--player-blue)" }} />
              </>
            }
            checked={format.draftPlayerColors}
            onToggle={() =>
              format.setDraftPlayerColors(!format.draftPlayerColors)
            }
          />
          <RuleCard
            title="Faction bags"
            description="Pre-assign faction choices to each player"
            art={
              <span className={classes.bag}>
                {factionArt("hacan")}
                {factionArt("sol")}
              </span>
            }
            checked={bagsOn}
            onToggle={faction.togglePreassignedFactions}
            disabled={sharedMinorPool}
            disabledReason={sharedPoolReason}
            extra={
              faction.preassignedFactions !== undefined && (
                <span className={classes.inline}>
                  Factions per player
                  <NumberStepper
                    size="sm"
                    value={faction.preassignedFactions}
                    label="factions per player"
                    decrease={() => faction.decrementPreassignedFactions()}
                    increase={() => faction.incrementPreassignedFactions()}
                    decreaseDisabled={
                      faction.preassignedFactions <=
                      factionConstraints.minPreassignedFactions
                    }
                    increaseDisabled={
                      faction.preassignedFactions >=
                      factionConstraints.maxPreassignedFactions
                    }
                  />
                </span>
              )
            }
          />
        </div>
      </Panel>

      {/* Minor factions - only for Milty variants */}
      {showMinorFactions && (
        <Panel
          title="Minor factions"
          icon={<IconUsers />}
          iconTint="var(--success)"
        >
          <div className={classes.panelBody}>
            <ListRow label="Enable minor factions">
              <Switch
                aria-label="Enable minor factions"
                checked={!!faction.minorFactionsMode}
                onChange={faction.toggleMinorFactions}
              />
            </ListRow>
            {faction.minorFactionsMode && isMiltyEqVariant(mapType) && (
              <div
                className={classes.modes}
                role="radiogroup"
                aria-label="Minor faction mode"
              >
                <small>Mode</small>
                <ModeCard
                  title="Random"
                  icon={<IconDice size={16} />}
                  description="Random placement"
                  checked={faction.minorFactionsMode.mode === "random"}
                  onSelect={() => faction.setMinorFactionsMode("random")}
                />
                <ModeCard
                  title="Shared"
                  icon={<IconUsersGroup size={16} />}
                  description="Same pool as majors"
                  checked={faction.minorFactionsMode.mode === "sharedPool"}
                  onSelect={() => faction.setMinorFactionsMode("shared")}
                />
                <ModeCard
                  title="Separate"
                  icon={<IconUser size={16} />}
                  description="Own faction pool"
                  checked={faction.minorFactionsMode.mode === "separatePool"}
                  onSelect={() => faction.setMinorFactionsMode("separate")}
                >
                  {faction.minorFactionsMode.mode === "separatePool" && (
                    <span className={classes.modeStep}>
                      <NumberStepper
                        size="sm"
                        value={faction.minorFactionsMode.numMinorFactions}
                        label="minor factions"
                        decrease={(e) => {
                          e.stopPropagation();
                          faction.decrementMinorFactions();
                        }}
                        increase={(e) => {
                          e.stopPropagation();
                          faction.incrementMinorFactions();
                        }}
                        decreaseDisabled={
                          faction.minorFactionsMode.numMinorFactions <=
                          factionConstraints.minMinorFactions
                        }
                        increaseDisabled={
                          faction.minorFactionsMode.numMinorFactions >=
                          factionConstraints.maxMinorFactions
                        }
                      />
                    </span>
                  )}
                </ModeCard>
              </div>
            )}
            {faction.minorFactionsMode && !isMiltyEqVariant(mapType) && (
              <p className={classes.note}>
                Placed at random in each slice&apos;s left equidistant. Shared
                and separate pools need a Milty EQ style.
              </p>
            )}
          </div>
        </Panel>
      )}

      <Panel
        title="More options"
        collapsible
        defaultOpen={false}
        summary={moreSummary}
      >
        <Rows>
          <ListRow
            label="Multidraft"
            hint="Create multiple drafts with same settings"
          >
            {multidraft.isMultidraft && (
              <NumberStepper
                value={multidraft.numDrafts}
                label="drafts"
                decrease={() =>
                  multidraft.setNumDrafts(Math.max(2, multidraft.numDrafts - 1))
                }
                increase={() =>
                  multidraft.setNumDrafts(multidraft.numDrafts + 1)
                }
                decreaseDisabled={multidraft.numDrafts <= 2}
                increaseDisabled={multidraft.numDrafts >= 9}
              />
            )}
            <Switch
              aria-label="Multidraft"
              checked={multidraft.isMultidraft}
              onChange={multidraft.setIsMultidraft}
            />
          </ListRow>
          <ListRow
            label="Allow home planets"
            hint="Enable placing home planets on map"
          >
            <Switch
              aria-label="Allow home planets"
              checked={format.allowHomePlanetSearch}
              onChange={format.setAllowHomePlanetSearch}
            />
          </ListRow>
          <ListRow
            label="Show monument cards"
            hint="Display faction monument cards beside the faction card in Info modals"
          >
            <Switch
              aria-label="Show monument cards"
              checked={format.showMonumentImagesInFactionInfo}
              onChange={format.setShowMonumentImagesInFactionInfo}
            />
          </ListRow>
          <ListRow
            label="Drahn variant"
            hint="Adds the Drahn Consortium to the faction pool"
          >
            <Switch
              aria-label="Drahn variant"
              checked={withDrahn}
              onChange={content.setWithDrahn}
            />
          </ListRow>
        </Rows>
      </Panel>
    </>
  );
}
