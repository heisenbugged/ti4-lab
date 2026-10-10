import {
  Fragment,
  useEffect,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { IconHexagon, IconSearch, IconX } from "@tabler/icons-react";
import {
  getSystemGameSet,
  searchableSystemData,
  systemData,
  systemGameSetLabels,
} from "~/data/systemData";
import { FactionId, System, SystemId } from "~/types";
import { TechIcon } from "~/components/icons/TechIcon";
import { LegendaryIcon } from "~/components/icons/LegendaryIcon";
import { RawSystemTile } from "~/components/tiles/SystemTile";
import { factions } from "~/data/factionData";
import { useUsedSystemIds } from "~/hooks/useUsedSystemIds";
import {
  Button,
  Chip,
  Kbd,
  Modal,
  Tag,
  Text,
  TextInput,
  ValuePill,
  cx,
} from "~/ui";
import { FILTER_CATEGORIES } from "./filterCategories";
import styles from "./PlanetFinder.module.css";

export type PlanetFinderBaseProps = {
  opened: boolean;
  onClose: () => void;
  onSystemSelected: (system: System) => void;
  availableSystemIds: SystemId[];
  factionPool?: FactionId[];
  allowHomePlanetSearch?: boolean;
};

const WORMHOLE_GLYPH: Record<string, { letter: string; color: string }> = {
  alpha: { letter: "α", color: "var(--wormhole-alpha)" },
  beta: { letter: "β", color: "var(--wormhole-beta)" },
  gamma: { letter: "γ", color: "var(--wormhole-gamma)" },
  delta: { letter: "δ", color: "var(--wormhole-delta)" },
};

const TRAIT_COLOR: Record<string, string> = {
  cultural: "var(--influence)",
  hazardous: "var(--tech-warfare)",
  industrial: "var(--tech-biotic)",
};

const ANY_LABEL: Record<string, string> = {
  Wormholes: "Any wormhole",
  Anomalies: "Any anomaly",
  Hyperlanes: "Any hyperlane",
};

function Dot({ color }: { color: string }) {
  return <i className={styles.dot} style={{ background: color }} />;
}

function WormholeGlyph({ type }: { type: string }) {
  const glyph = WORMHOLE_GLYPH[type.toLowerCase()];
  if (!glyph) return null;
  return (
    <i className={styles.wh} style={{ borderColor: glyph.color }}>
      {glyph.letter}
    </i>
  );
}

/** A small picture for the chips that have one. */
function filterIcon(id: string): ReactNode {
  if (TRAIT_COLOR[id]) return <Dot color={TRAIT_COLOR[id]} />;
  if (["biotic", "propulsion", "cybernetic", "warfare"].includes(id))
    return <TechIcon techSpecialty={id.toUpperCase() as "BIOTIC"} size={14} />;
  if (id === "legendary") return <LegendaryIcon size={14} />;
  if (WORMHOLE_GLYPH[id]) return <WormholeGlyph type={id} />;
  return null;
}

export function PlanetFinderBase({
  opened,
  onClose,
  onSystemSelected,
  availableSystemIds,
  factionPool = [],
  allowHomePlanetSearch = false,
}: PlanetFinderBaseProps) {
  const usedSystemIds = useUsedSystemIds();

  const [searchString, setSearchString] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const clearFilters = () => {
    setActiveFilters([]);
    setSearchString("");
  };

  const toggleFilter = (id: string, on: boolean) =>
    setActiveFilters((prev) =>
      on ? [...prev, id] : prev.filter((f) => f !== id),
    );

  const combinedSearchTerms = useMemo(() => {
    const terms: string[] = [];

    for (const category of FILTER_CATEGORIES) {
      for (const filter of category.filters) {
        if (activeFilters.includes(filter.id)) {
          terms.push(filter.searchTerm);
        }
      }
    }

    if (searchString.trim()) {
      terms.push(searchString.trim());
    }

    return terms;
  }, [activeFilters, searchString]);

  const isValidSystem = (system: System) => {
    return (
      availableSystemIds.includes(system.id) ||
      system.type === "HYPERLANE" ||
      (allowHomePlanetSearch &&
        system.faction &&
        system.type === "GREEN" &&
        factionPool.includes(system.faction))
    );
  };

  const systems = useMemo(() => {
    if (combinedSearchTerms.length === 0) return [];

    return searchableSystemData
      .filter(([name, id]) => {
        const nameLower = name.toLowerCase();
        const allTermsMatch = combinedSearchTerms.every((term) =>
          nameLower.includes(term.toLowerCase()),
        );
        return allTermsMatch && isValidSystem(systemData[id]);
      })
      .map(([, system]) => {
        const data = systemData[system];
        if (!data.hyperlanes) return data;

        const rotations = [];
        for (let i = 0; i < 300; i += 60) {
          rotations.push({ ...data, rotation: i });
        }
        return rotations;
      })
      .flat(1)
      .sort((a, b) => {
        if (usedSystemIds.includes(a.id) && !usedSystemIds.includes(b.id))
          return 1;
        if (!usedSystemIds.includes(a.id) && usedSystemIds.includes(b.id))
          return -1;
        return 0;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedSearchTerms, availableSystemIds, usedSystemIds]);

  // Keyboard: index 0 is the search box, 1..n the result cards.
  // Handled on the modal itself; the dialog keeps key events from reaching window.
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [cursor, setCursor] = useState(0);
  const focusItem = (idx: number) => {
    setCursor(idx);
    itemRefs.current[idx]?.focus();
  };
  const resetFocus = () => setCursor(0);
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      focusItem(Math.min(cursor + 1, systems.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      focusItem(Math.max(cursor - 1, 0));
    } else if (e.key === "Enter" && cursor > 0 && systems[cursor - 1]) {
      e.preventDefault();
      onSystemSelected(systems[cursor - 1]);
    }
  };

  useEffect(() => {
    if (opened) {
      setCursor(0);
      setSearchString("");
      setActiveFilters([]);
      setTimeout(() => {
        itemRefs.current[0]?.focus();
      }, 150);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened]);

  const hasActiveFilters = activeFilters.length > 0 || searchString.length > 0;
  const allFilters = FILTER_CATEGORIES.flatMap((c) =>
    c.filters.map((f) => ({ ...f, category: c.label })),
  );

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      flush
      title="System database"
      description="Search by ID, planet, resources or influence, or narrow it down with the filters."
    >
      <div className={styles.sdb} onKeyDown={handleKeyDown}>
        <div className={styles.filters}>
          <div className={styles.search}>
            <TextInput
              ref={(el) => {
                if (!itemRefs.current || !el) return;
                itemRefs.current[0] = el;
              }}
              aria-label="Search systems"
              onFocus={() => setCursor(0)}
              leftIcon={<IconSearch size={15} />}
              placeholder="Search ID, planet, resources…"
              value={searchString}
              onChange={(e) => {
                resetFocus();
                setSearchString(e.target.value.toLowerCase());
              }}
            />
          </div>
          <div className={styles.groups}>
            {FILTER_CATEGORIES.map((category) => (
              <div
                key={category.id}
                className={styles.group}
                role="group"
                aria-labelledby={`sdb-${category.id}`}
              >
                <h5 id={`sdb-${category.id}`}>{category.label}</h5>
                <div className={styles.chips}>
                  {category.filters.map((filter) => (
                    <Chip
                      key={filter.id}
                      pressed={activeFilters.includes(filter.id)}
                      onChange={(on) => toggleFilter(filter.id, on)}
                      icon={filterIcon(filter.id)}
                    >
                      {filter.label}
                    </Chip>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.results}>
          <div className={styles.rhead}>
            <b>
              {systems.length} {systems.length === 1 ? "system" : "systems"}
            </b>
            <div className={styles.active}>
              {activeFilters.map((filterId) => {
                const filter = allFilters.find((f) => f.id === filterId);
                if (!filter) return null;
                const label =
                  filter.label === "Any"
                    ? (ANY_LABEL[filter.category] ?? "Any")
                    : filter.label;
                return (
                  <button
                    key={filterId}
                    type="button"
                    className={styles.activeTag}
                    aria-label={`Remove filter ${label}`}
                    onClick={() => toggleFilter(filterId, false)}
                  >
                    {label}
                    <IconX size={12} />
                  </button>
                );
              })}
              {searchString && (
                <button
                  type="button"
                  className={styles.activeTag}
                  aria-label="Clear search"
                  onClick={() => setSearchString("")}
                >
                  “{searchString}”
                  <IconX size={12} />
                </button>
              )}
            </div>
            {hasActiveFilters && (
              <Button
                variant="tertiary"
                size="sm"
                className={styles.clear}
                onClick={clearFilters}
              >
                Clear all
              </Button>
            )}
          </div>

          <div className={styles.grid}>
            {systems.length === 0 && (
              <div className={styles.empty}>
                <IconHexagon size={28} />
                {hasActiveFilters ? (
                  <>
                    <Text weight={600}>No systems match your filters</Text>
                    <Text size="sm" tone="muted">
                      Remove a filter or change the search.
                    </Text>
                    <Button size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  </>
                ) : (
                  <>
                    <Text weight={600}>
                      Select filters or search to find systems
                    </Text>
                    <Text size="sm" tone="muted">
                      Try a planet name, a system number like 26, or a value
                      like “3 resources”.
                    </Text>
                  </>
                )}
              </div>
            )}

            {systems.map((system, idx) => {
              const inUse = usedSystemIds.includes(system.id);
              const gameSet = getSystemGameSet(system.id);
              return (
                <div
                  key={`${system.id}-${system.rotation ?? 0}`}
                  className={cx(styles.card, inUse && styles.inUse)}
                  role="button"
                  tabIndex={idx + 1}
                  aria-label={`System ${system.id}${inUse ? ", in use" : ""}`}
                  ref={(el) => {
                    if (!itemRefs.current || !el) return;
                    itemRefs.current[idx + 1] = el;
                  }}
                  onMouseDown={() => onSystemSelected(system)}
                  onFocus={() => setCursor(idx + 1)}
                  onKeyDown={(e) => {
                    if (e.key !== " ") return;
                    e.preventDefault();
                    onSystemSelected(system);
                  }}
                >
                  <span className={styles.tile} aria-hidden>
                    <RawSystemTile
                      mapId={`sdb-${system.id}-${system.rotation ?? 0}`}
                      tile={{
                        idx: 0,
                        type: "SYSTEM",
                        systemId: system.id,
                        rotation: system.rotation,
                        position: { x: 0, y: 0 },
                      }}
                      radius={40}
                      disablePopover
                    />
                  </span>
                  <div className={styles.body}>
                    <div className={styles.top}>
                      <b>{system.id}</b>
                      {gameSet && <small>{systemGameSetLabels[gameSet]}</small>}
                      {inUse && <Tag className={styles.inUseTag}>In use</Tag>}
                    </div>

                    {system.planets.map((planet) => (
                      <Fragment key={planet.name}>
                        <div className={styles.planet}>
                          <Dot
                            color={
                              planet.trait?.[0]
                                ? TRAIT_COLOR[planet.trait[0].toLowerCase()]
                                : "var(--text-faint)"
                            }
                          />
                          <span className={styles.name}>{planet.name}</span>
                          <ValuePill
                            size="sm"
                            r={planet.resources}
                            i={planet.influence}
                          />
                          {planet.tech?.map((tech, techIdx) => (
                            <TechIcon
                              key={`${tech}-${techIdx}`}
                              techSpecialty={tech}
                              size={15}
                            />
                          ))}
                          {planet.legendary && <LegendaryIcon size={15} />}
                          {planet.tradeStation && (
                            <Tag tone="ion" className={styles.smallTag}>
                              Station
                            </Tag>
                          )}
                        </div>
                      </Fragment>
                    ))}

                    <div className={styles.extra}>
                      {system.wormholes.map((wormhole) => (
                        <Tag
                          key={wormhole}
                          className={styles.smallTag}
                          icon={<WormholeGlyph type={wormhole} />}
                        >
                          {wormhole.charAt(0) + wormhole.slice(1).toLowerCase()}
                        </Tag>
                      ))}

                      {system.anomalies.map((anomaly) => (
                        <Tag
                          key={anomaly}
                          tone="danger"
                          className={styles.smallTag}
                        >
                          {anomaly.charAt(0) +
                            anomaly.slice(1).toLowerCase().replace(/_/g, " ")}
                        </Tag>
                      ))}

                      {system.planets.length === 0 && (
                        <Tag className={styles.smallTag}>No planets</Tag>
                      )}

                      {system.planets.length === 0 &&
                        system.anomalies.length === 0 &&
                        system.wormholes.length === 0 &&
                        !system.hyperlanes && (
                          <Tag className={styles.smallTag}>Empty</Tag>
                        )}

                      {system.hyperlanes && (
                        <Tag tone="ion" className={styles.smallTag}>
                          Hyperlane {system.rotation}°
                        </Tag>
                      )}

                      {system.faction && (
                        <Tag className={styles.smallTag}>
                          {factions[system.faction].name}
                        </Tag>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.keys} aria-hidden>
            <span>
              <Kbd>↑</Kbd> <Kbd>↓</Kbd> move
            </span>
            <span>
              <Kbd>Enter</Kbd> place on the map
            </span>
            <span>
              <Kbd>Esc</Kbd> close
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
