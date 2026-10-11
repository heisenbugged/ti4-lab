import { FactionIcon } from "~/components/icons/FactionIcon";
import { Faction } from "~/types";
import { factionSystems } from "~/data/systemData";
import { StartingUnitsTable } from "~/components/StartingUnitsTable";
import { Text, ValuePill } from "~/ui";
import styles from "./NewDraftReferenceCard.module.css";

type Props = {
  faction: Faction;
};

export function NewDraftReferenceCard({ faction }: Props) {
  const homeSystem = factionSystems[faction.id];

  return (
    <article className={styles.card}>
      <header className={styles.head}>
        <FactionIcon faction={faction.id} style={{ width: 26, height: 26, flexShrink: 0 }} />
        <span className={styles.name} title={faction.name}>
          {faction.name}
        </span>
        {faction.priorityOrder !== undefined && (
          <span
            className={styles.priority}
            title={`Priority ${faction.priorityOrder}`}
          >
            {faction.priorityOrder}
          </span>
        )}
      </header>
      <div className={styles.body}>
        <div className={styles.home}>
          <Text size="xs" tone="muted" weight={600}>
            Home system
          </Text>
          <div className={styles.planets}>
            {homeSystem?.planets.map((planet, idx) => (
              <div key={idx} className={styles.planet}>
                <ValuePill r={planet.resources} i={planet.influence} size="sm" />
                <Text size="sm" truncate>
                  {planet.name}
                </Text>
              </div>
            ))}
          </div>
        </div>

        {faction.fleetComposition && (
          <StartingUnitsTable fleetComposition={faction.fleetComposition} />
        )}
      </div>
    </article>
  );
}
