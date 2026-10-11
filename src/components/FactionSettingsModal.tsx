import { IconCheck, IconLock, IconLockOpen } from "@tabler/icons-react";
import { useState } from "react";
import { factions } from "~/data/factionData";
import { FactionId, FactionStratification, GameSet } from "~/types";
import { FactionIcon } from "~/components/icons/FactionIcon";
import { Button, Modal, NumberStepper, cx, notify } from "~/ui";
import classes from "./FactionSettingsModal.module.css";

const gameSetLabel: Record<GameSet, string> = {
  base: "Base",
  pok: "Prophecy of Kings",
  te: "Thunder's Edge",
  discordant: "Discordant Stars",
  discordantexp: "Discordant Expansion",
  drahn: "Drahn",
  unchartedstars: "Uncharted Stars",
  twilightsFall: "Twilight's Fall",
};

type Props = {
  opened: boolean;
  buttonText: string;

  savedAllowedFactions: FactionId[] | undefined;
  savedRequiredFactions: FactionId[] | undefined;
  savedStratifiedConfig: FactionStratification | undefined;

  numPlayers: number;
  factionPool: FactionId[];
  factionGameSets: GameSet[];

  onSave: (
    allowedFactions: FactionId[],
    requiredFactions: FactionId[],
    stratifiedConfig: FactionStratification | undefined,
  ) => void;
  onClose: () => void;
};

export function FactionSettingsModal({
  opened,
  buttonText,
  savedAllowedFactions,
  savedRequiredFactions,
  savedStratifiedConfig,
  numPlayers,
  factionPool,
  factionGameSets,
  onSave,
  onClose,
}: Props) {
  const setsKey = (sets: GameSet[]) =>
    sets
      .filter((s) => factionGameSets.includes(s))
      .join("|") as keyof FactionStratification;
  const BASE_POK_KEY = setsKey(["base", "pok"]);
  const DISCORDANT_KEY = setsKey(["discordant", "discordantexp"]);

  const [stratifiedConfig, setStratifiedConfig] = useState<
    FactionStratification | undefined
  >(savedStratifiedConfig);

  const [requiredFactions, setRequiredFactions] = useState<FactionId[]>(
    savedRequiredFactions ?? [],
  );
  const [allowedFactions, setAllowedFactions] = useState<FactionId[]>(
    savedAllowedFactions ?? factionPool,
  );

  // Start from the saved settings each time the modal opens.
  const [wasOpened, setWasOpened] = useState(opened);
  if (opened !== wasOpened) {
    setWasOpened(opened);
    if (opened) {
      setAllowedFactions(savedAllowedFactions ?? factionPool);
      setRequiredFactions(savedRequiredFactions ?? []);
      setStratifiedConfig(savedStratifiedConfig);
    }
  }

  const handleSave = () => {
    // Drop sets left at 0
    const nonZero = Object.fromEntries(
      Object.entries(stratifiedConfig ?? {}).filter(([, value]) => value > 0),
    ) as FactionStratification;
    const config = Object.keys(nonZero).length > 0 ? nonZero : undefined;

    if (!validateStratifiedConfig(config, numPlayers)) {
      notify({
        title: "Invalid configuration",
        message: "Not enough factions selected for all players.",
        tone: "danger",
      });
      return;
    }

    onSave(allowedFactions, requiredFactions, config);
  };

  const handleStratifiedDecrease = (key: keyof FactionStratification) => {
    if (!stratifiedConfig) return;
    setStratifiedConfig({
      ...stratifiedConfig,
      [key]: Math.max((stratifiedConfig[key] ?? 0) - 1, 0),
    });
  };

  const handleStratifiedIncrease = (
    key: keyof FactionStratification,
    maxValue: number,
  ) => {
    const currentCount = stratifiedConfig?.[key] ?? 0;
    setStratifiedConfig({
      ...(stratifiedConfig ?? {}),
      [key]: Math.min(currentCount + 1, maxValue),
    });
  };

  const grouped: Partial<Record<GameSet, FactionId[]>> = {};
  for (const factionId of factionPool) {
    (grouped[factions[factionId].set] ??= []).push(factionId);
  }
  const sortedFactionPool = Object.entries(grouped).map(
    ([gameSet, factionIds]) => ({
      gameSet: gameSet as GameSet,
      factionIds: factionIds.sort((a, b) =>
        factions[a].name.localeCompare(factions[b].name),
      ),
    }),
  );

  const hasBasePok =
    factionGameSets.includes("base") || factionGameSets.includes("pok");
  const hasTE = factionGameSets.includes("te");
  const hasDiscordant =
    factionGameSets.includes("discordant") ||
    factionGameSets.includes("discordantexp");

  const showStratification = hasBasePok && (hasTE || hasDiscordant);

  const toggleAllowed = (factionId: FactionId) => {
    if (requiredFactions.includes(factionId)) return;
    if (allowedFactions.includes(factionId)) {
      setAllowedFactions((f) => f.filter((id) => id !== factionId));
    } else {
      setAllowedFactions((f) => [...f, factionId]);
    }
  };

  const toggleRequired = (factionId: FactionId) => {
    if (requiredFactions.includes(factionId)) {
      setRequiredFactions((f) => f.filter((id) => id !== factionId));
    } else {
      setRequiredFactions((f) => [...f, factionId]);
      // Also ensure it's in allowed
      if (!allowedFactions.includes(factionId)) {
        setAllowedFactions((f) => [...f, factionId]);
      }
    }
  };

  const allowGroup = (factionIds: FactionId[]) =>
    setAllowedFactions((f) => [
      ...f,
      ...factionIds.filter((id) => !f.includes(id)),
    ]);

  // Forced factions stay in; they're unlocked first.
  const clearGroup = (factionIds: FactionId[]) =>
    setAllowedFactions((f) =>
      f.filter((id) => !factionIds.includes(id) || requiredFactions.includes(id)),
    );

  const stratRows: {
    key: keyof FactionStratification;
    label: string;
    max: number;
    show: boolean;
  }[] = [
    { key: BASE_POK_KEY, label: "Base and PoK", max: 25, show: hasBasePok },
    { key: "te", label: "Thunder's Edge", max: 10, show: hasTE },
    {
      key: DISCORDANT_KEY,
      label: "Discordant",
      max: 35,
      show: hasDiscordant,
    },
  ];

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="full"
      className={classes.modal}
      title="Faction pool"
      description="Choose which factions can be rolled. Lock one to make sure it's always offered."
      footer={
        <>
          <span className={classes.count}>
            {allowedFactions.length} allowed / {requiredFactions.length} forced
          </span>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            icon={<IconCheck size={16} />}
            onClick={handleSave}
          >
            {buttonText}
          </Button>
        </>
      }
    >
      <div className={classes.summary}>
        <div>
          <b>{allowedFactions.length}</b>
          <span>can be rolled</span>
        </div>
        <div>
          <b className={classes.gold}>{requiredFactions.length}</b>
          <span>always in</span>
        </div>
        <div>
          <b>{numPlayers}</b>
          <span>players</span>
        </div>
        {showStratification && (
          <div className={classes.strat}>
            <span className={classes.stratTitle}>
              Stratify by set <small>Guarantee a share from each set</small>
            </span>
            <div className={classes.stratRow}>
              {stratRows
                .filter((r) => r.show)
                .map(({ key, label, max }) => {
                  const value = stratifiedConfig?.[key] ?? 0;
                  return (
                    <span key={key} className={classes.stratItem}>
                      {label}
                      <NumberStepper
                        size="sm"
                        value={value}
                        label={`${label} minimum`}
                        decrease={() => handleStratifiedDecrease(key)}
                        increase={() => handleStratifiedIncrease(key, max)}
                        decreaseDisabled={
                          stratifiedConfig?.[key] === undefined ||
                          stratifiedConfig?.[key] === 0
                        }
                        increaseDisabled={stratifiedConfig?.[key] === max}
                      />
                    </span>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      <div className={classes.groups}>
        {sortedFactionPool.map(({ gameSet, factionIds }) => {
          const inCount = factionIds.filter(
            (id) => allowedFactions.includes(id) || requiredFactions.includes(id),
          ).length;
          return (
            <section key={gameSet} className={classes.group}>
              <header className={classes.groupHead}>
                <h5>{gameSetLabel[gameSet]}</h5>
                <span className={classes.bar} aria-hidden>
                  <i style={{ width: `${(inCount / factionIds.length) * 100}%` }} />
                </span>
                <span className={classes.of}>
                  {inCount} of {factionIds.length}
                </span>
                <span className={classes.quick}>
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => allowGroup(factionIds)}
                    aria-label={`Allow all ${gameSetLabel[gameSet]} factions`}
                  >
                    All
                  </Button>
                  <Button
                    size="sm"
                    variant="tertiary"
                    onClick={() => clearGroup(factionIds)}
                    aria-label={`Allow no ${gameSetLabel[gameSet]} factions`}
                  >
                    None
                  </Button>
                </span>
              </header>
              <div className={classes.grid}>
                {factionIds.map((factionId) => {
                  const required = requiredFactions.includes(factionId);
                  const allowed = allowedFactions.includes(factionId);
                  const name = factions[factionId].name;

                  return (
                    <div
                      key={factionId}
                      className={cx(
                        classes.fp,
                        !allowed && !required && classes.out,
                        required && classes.forced,
                      )}
                    >
                      <button
                        type="button"
                        className={classes.main}
                        aria-pressed={allowed || required}
                        aria-disabled={required || undefined}
                        aria-label={`${name}, ${
                          required
                            ? "always in"
                            : allowed
                              ? "can be rolled"
                              : "left out"
                        }`}
                        onClick={() => toggleAllowed(factionId)}
                      >
                        <FactionIcon faction={factionId} style={{ width: 26, height: 26, flex: "none" }} />
                        <span>{name}</span>
                      </button>
                      <button
                        type="button"
                        className={classes.lock}
                        aria-pressed={required}
                        aria-label={required ? "Remove from required" : "Force include"}
                        title={required ? "Remove from required" : "Force include"}
                        onMouseDown={(e) => {
                          if (e.button === 0) toggleRequired(factionId);
                        }}
                        onClick={(e) => {
                          if (e.detail === 0) toggleRequired(factionId);
                        }}
                      >
                        {required ? <IconLock size={14} /> : <IconLockOpen size={14} />}
                        {required && <span>Always in</span>}
                      </button>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </Modal>
  );
}

const validateStratifiedConfig = (
  config: FactionStratification | undefined,
  numPlayers: number,
) => {
  // no config is a valid state
  if (!config) return true;
  const numFactions = Object.values(config).reduce(
    (acc, curr) => acc + curr,
    0,
  );
  return numFactions >= numPlayers;
};
