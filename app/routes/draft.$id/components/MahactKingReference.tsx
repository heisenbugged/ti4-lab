import type { CSSProperties } from "react";
import { Row, Tag } from "~/ui";
import { MahactKingReference as MahactKingReferenceData } from "~/data/mahactKingReferences";
import { Faction } from "~/types";
import classes from "./MahactKingReference.module.css";

type Props = {
  faction: Faction;
  reference: MahactKingReferenceData;
};

export function MahactKingReference({ faction, reference }: Props) {
  return (
    <div
      className={classes.root}
      style={{ "--accent": reference.accent } as CSSProperties}
    >
      <div className={classes.head}>
        <img
          className={classes.icon}
          src={faction.iconPath}
          alt=""
          aria-hidden
        />
        <div className={classes.titles}>
          <p className={classes.kicker}>Mahact king</p>
          <h3 className={classes.name}>{faction.name}</h3>
        </div>
        <Tag>{reference.commodities} commodities</Tag>
      </div>

      {reference.units.map((unit) => (
        <section key={unit.type} className={classes.unit}>
          <div className={classes.unitHead}>
            <span className={classes.unitType}>{unit.type}</span>
            <h4 className={classes.unitName}>{unit.name}</h4>
          </div>

          <p className={classes.ability}>{unit.ability}</p>

          <Row gap={2}>
            {unit.traits.map((trait) => (
              <Tag key={trait}>{trait}</Tag>
            ))}
          </Row>

          <div className={classes.stats}>
            {unit.stats.map((stat) => (
              <div key={stat.label} className={classes.stat}>
                <b>{stat.value}</b>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
