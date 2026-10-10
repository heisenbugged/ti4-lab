import { useMemo, useState } from "react";
import { useMapBuilder } from "~/mapBuilderStore";
import { getSystemGameSet, systemData } from "~/data/systemData";
import { systemsFromIds } from "~/utils/system";
import { DraggableSidebarTile } from "./DraggableSidebarTile";
import { MiniHex } from "./MiniHex";
import { MiniWormhole } from "./MiniWormhole";
import { Segmented, Text } from "~/ui";
import classes from "./TileSidebar.module.css";

type TileFilter = "all" | "blue" | "red" | "wormhole";

export function TileSidebar() {
  const systemPool = useMapBuilder((state) => state.state.systemPool);
  const gameSets = useMapBuilder((state) => state.state.gameSets);
  const systems = systemsFromIds(systemPool);
  const map = useMapBuilder((state) => state.state.map);
  const [filter, setFilter] = useState<TileFilter>("all");
  const [view, setView] = useState<"tiles" | "hyperlanes">("tiles");

  const usedSystemIds = new Set(
    map
      .filter((tile) => tile.type === "SYSTEM")
      .map((tile) => (tile.type === "SYSTEM" ? tile.systemId : null))
      .filter(Boolean),
  );

  const filterSystems = (systemList: typeof systems) => {
    if (filter === "all") return systemList;
    if (filter === "wormhole") {
      return systemList.filter((system) => system.wormholes.length > 0);
    }
    return systemList.filter((system) => system.type === filter.toUpperCase());
  };

  const availableSystems = filterSystems(
    systems.filter((system) => !usedSystemIds.has(system.id)),
  );
  const usedSystems = filterSystems(
    systems.filter((system) => usedSystemIds.has(system.id)),
  );

  const hyperlaneOptions = useMemo(() => {
    const enabledSets = new Set(
      gameSets.map((set) => {
        if (set === "unchartedstars") return "us";
        if (set === "discordant" || set === "discordantexp") return "ds";
        return set;
      }),
    );

    const rotations = [0, 60, 120, 180, 240, 300];

    return Object.values(systemData)
      .filter((system) => {
        if (system.type !== "HYPERLANE") return false;
        const systemSet = getSystemGameSet(system.id);
        if (!systemSet) return true;
        return enabledSets.has(systemSet);
      })
      .flatMap((system) =>
        rotations.map((rotation) => ({
          systemId: system.id,
          rotation,
        })),
      );
  }, [gameSets]);

  return (
    <div className={classes.sidebar}>
      <div className={classes.head}>
        <Segmented
          block
          label="Sidebar view"
          value={view}
          onChange={setView}
          options={[
            { value: "tiles", label: "Tiles" },
            { value: "hyperlanes", label: "Hyperlanes" },
          ]}
        />
        {view === "tiles" ? (
          <>
            <Text size="xs" tone="muted" weight={600}>
              Tiles ({availableSystems.length})
            </Text>
            <Segmented
              block
              size="sm"
              label="Filter tiles"
              value={filter}
              onChange={setFilter}
              className={classes.filter}
              options={[
                { value: "all", label: "All" },
                {
                  value: "blue",
                  title: "Blue systems",
                  label: (
                    <>
                      <MiniHex color="var(--influence)" />
                      Blue
                    </>
                  ),
                },
                {
                  value: "red",
                  title: "Red systems",
                  label: (
                    <>
                      <MiniHex color="var(--anomaly)" />
                      Red
                    </>
                  ),
                },
                {
                  value: "wormhole",
                  title: "Wormholes",
                  label: (
                    <>
                      <MiniWormhole />
                      Wormholes
                    </>
                  ),
                },
              ]}
            />
          </>
        ) : (
          <Text size="xs" tone="muted" weight={600}>
            Hyperlanes ({hyperlaneOptions.length})
          </Text>
        )}
      </div>

      <div className={classes.scroll}>
        {view === "tiles" ? (
          <>
            <div className={classes.grid}>
              {availableSystems.map((system) => (
                <DraggableSidebarTile key={system.id} systemId={system.id} />
              ))}
            </div>
            {availableSystems.length === 0 && (
              <Text size="xs" tone="muted" className={classes.none}>
                No unused tiles match this filter.
              </Text>
            )}

            {usedSystems.length > 0 && (
              <>
                <div className={classes.used}>
                  <Text size="xs" weight={600}>
                    Used ({usedSystems.length})
                  </Text>
                  <Text size="xs" tone="muted">
                    Systems already on the map stay draggable here. Dropping one
                    moves it.
                  </Text>
                </div>
                <div className={classes.grid}>
                  {usedSystems.map((system) => (
                    <DraggableSidebarTile
                      key={system.id}
                      systemId={system.id}
                    />
                  ))}
                </div>
              </>
            )}
          </>
        ) : (
          <div className={classes.grid}>
            {hyperlaneOptions.map(({ systemId, rotation }) => (
              <DraggableSidebarTile
                key={`${systemId}-${rotation}`}
                systemId={systemId}
                rotation={rotation}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
