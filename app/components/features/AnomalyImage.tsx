import { Anomaly } from "~/types";
import { Nebula } from "./Nebula";
import { Supernova } from "./Supernova";
import { Asteroids } from "./Asteroids";
import { EntroficScar } from "./EntroficScar";

type Props = {
  anomaly: Anomaly;
  radius: number;
};

export function AnomalyImage({ radius, anomaly }: Props) {
  switch (anomaly) {
    case "NEBULA":
      return <Nebula radius={radius} />;
    case "SUPERNOVA":
      return <Supernova radius={radius} />;
    case "ASTEROID_FIELD":
      return <Asteroids radius={radius} />;
    case "ENTROPIC_SCAR":
      return <EntroficScar radius={radius} />;
  }

  return null;
}
