import {
  Anomaly,
  PlanetTrait,
  RawSystem,
  System,
  TechSpecialty,
} from "~/types";
import { planetData } from "./planetData";

export const rawSystemData: Record<number, RawSystem> = {
  18: {
    id: 18,
    planets: ["Mecatol Rex"],
  },
  19: {
    id: 19,
    planets: ["Wellon"],
  },
  20: {
    id: 20,
    planets: ["Vefut II"],
  },
  21: {
    id: 21,
    planets: ["Thibah"],
  },
  22: {
    id: 22,
    planets: ["Tar'Mann"],
  },
  23: {
    id: 23,
    planets: ["Saudor"],
  },
  24: {
    id: 24,
    planets: ["Mehar Xull"],
  },
  25: {
    id: 25,
    planets: ["Quann"],
    wormhole: "BETA",
  },
  26: {
    id: 26,
    planets: ["Lodor"],
    wormhole: "ALPHA",
  },
  27: {
    id: 27,
    planets: ["New Albion", "Starpoint"],
  },
  28: {
    id: 28,
    planets: ["Tequ'ran", "Torkan"],
  },
  29: {
    id: 29,
    planets: ["Qucen'n", "Rarron"],
  },
  30: {
    id: 30,
    planets: ["Mellon", "Zohbat"],
  },
  31: {
    id: 31,
    planets: ["Lazar", "Sakulag"],
  },
  32: {
    id: 32,
    planets: ["Dal Bootha", "Xxehan"],
  },
  33: {
    id: 33,
    planets: ["Corneeq", "Resculon"],
  },
  34: {
    id: 34,
    planets: ["Centauri", "Gral"],
  },
  35: {
    id: 35,
    planets: ["Bereg", "Lirta IV"],
  },
  36: {
    id: 36,
    planets: ["Arnor", "Lor"],
  },
  37: {
    id: 37,
    planets: ["Arinam", "Meer"],
  },
  38: {
    id: 38,
    planets: ["Abyz", "Fria"],
  },
  39: {
    id: 39,
    planets: [],
    wormhole: "ALPHA",
  },
  40: {
    id: 40,
    planets: [],
    wormhole: "BETA",
  },
  41: {
    id: 41,
    planets: [],
    anomaly: "GRAVITY_RIFT",
  },
  42: {
    id: 42,
    planets: [],
    anomaly: "NEBULA",
  },
  43: {
    id: 43,
    planets: [],
    anomaly: "SUPERNOVA",
  },
  44: {
    id: 44,
    planets: [],
    anomaly: "ASTEROID_FIELD",
  },
  45: {
    id: 45,
    planets: [],
    anomaly: "ASTEROID_FIELD",
  },
  46: {
    id: 46,
    planets: [],
  },
  47: {
    id: 47,
    planets: [],
  },
  48: {
    id: 48,
    planets: [],
  },
  49: {
    id: 49,
    planets: [],
  },
  50: {
    id: 50,
    planets: [],
  },
  59: {
    id: 59,
    planets: ["Archon Vail"],
  },
  60: {
    id: 60,
    planets: ["Perimeter"],
  },
  61: {
    id: 61,
    planets: ["Ang"],
  },
  62: {
    id: 62,
    planets: ["Sem-Lore"],
  },
  63: {
    id: 63,
    planets: ["Vorhal"],
  },
  64: {
    id: 64,
    planets: ["Atlas"],
    wormhole: "BETA",
  },
  65: {
    id: 65,
    planets: ["Primor"],
  },
  66: {
    id: 66,
    planets: ["Hope's End"],
  },
  67: {
    id: 67,
    planets: ["Cormund"],
    anomaly: "GRAVITY_RIFT",
  },
  68: {
    id: 68,
    planets: ["Everra"],
    anomaly: "NEBULA",
  },
  69: {
    id: 69,
    planets: ["Accoen", "Joel Ir"],
  },
  70: {
    id: 70,
    planets: ["Kraag", "Siig"],
  },
  71: {
    id: 71,
    planets: ["Alio Prima", "Ba'kal"],
  },
  72: {
    id: 72,
    planets: ["Lisis", "Velnor"],
  },
  73: {
    id: 73,
    planets: ["Cealdri", "Xanhact"],
  },
  74: {
    id: 74,
    planets: ["Vega Major", "Vega Minor"],
  },
  75: {
    id: 75,
    planets: ["Abaddon", "Ashtroth", "Loki"],
  },
  76: {
    id: 76,
    planets: ["Rigel I", "Rigel II", "Rigel III"],
  },
  77: {
    id: 77,
    planets: [],
  },
  78: {
    id: 78,
    planets: [],
  },
  79: {
    id: 79,
    planets: [],
    anomaly: "ASTEROID_FIELD",
    wormhole: "ALPHA",
  },
  80: {
    id: 80,
    planets: [],
    anomaly: "SUPERNOVA",
  },
};

export const systemData: Record<number, System> = Object.entries(
  rawSystemData,
).reduce(
  (acc, [id, system]) => {
    const planets = system.planets.map(
      (name) => planetData.find((planet) => planet.name === name)!!,
    );

    // Determine if system is red or blue
    const isRed =
      (system.planets.length === 0 || system.anomaly !== undefined) &&
      system.id > 0 &&
      system.id !== 18 &&
      !system.home &&
      !system.hyperlane;
    const isBlue =
      system.planets.length > 0 &&
      system.anomaly === undefined &&
      system.id > 0 &&
      system.id !== 18 &&
      !system.home &&
      !system.hyperlane;

    // Calculate total and optimal spend
    let totalSpend = { resources: 0, influence: 0 };
    let optimalSpend = { resources: 0, influence: 0, flex: 0 };
    planets.forEach((planet) => {
      totalSpend.resources += planet.resources;
      totalSpend.influence += planet.influence;

      if (planet.resources > planet.influence) {
        optimalSpend.resources += planet.resources;
      } else if (planet.resources < planet.influence) {
        optimalSpend.influence += planet.influence;
      } else if (planet.resources === planet.influence) {
        optimalSpend.flex += planet.resources;
      }
    });

    acc[parseInt(id)] = {
      id: parseInt(id),
      planets,
      anomaly: system.anomaly,
      wormhole: system.wormhole,
      totalSpend,
      optimalSpend,
      isRed,
      isBlue,
    };

    return acc;
  },
  {} as Record<number, System>,
);
export const systemIds = Object.keys(systemData).map((id) => parseInt(id));

const searchableTech: Record<TechSpecialty, string> = {
  BIOTIC: "green tech",
  CYBERNETIC: "yellow tech",
  WARFARE: "red tech",
  PROPULSION: "blue tech",
};

const searchableTrait: Record<PlanetTrait, string> = {
  INDUSTRIAL: "green planet",
  CULTURAL: "blue planet",
  HAZARDOUS: "red planet",
};

const searchableAnomaly: Record<Anomaly, string> = {
  ASTEROID_FIELD: "asteroid field",
  GRAVITY_RIFT: "gravity rift",
  NEBULA: "nebula",
  SUPERNOVA: "supernova",
};

export const searchableSystemData = Object.values(systemData).reduce(
  (acc, system) => {
    const nameParts: string[] = [system.id.toString()];
    if (system.anomaly) nameParts.push(searchableAnomaly[system.anomaly]);
    if (system.wormhole) {
      nameParts.push(system.wormhole.toLowerCase());
      nameParts.push("wormhole");
    }

    if (!system.anomaly && !system.wormhole && system.planets.length === 0) {
      nameParts.push("empty");
    }

    for (const planet of system.planets) {
      nameParts.push(planet.name.toLowerCase());
      if (planet.trait) {
        nameParts.push(searchableTrait[planet.trait]);
        nameParts.push(planet.trait.toLowerCase());
      }
      if (planet.techSpecialty) {
        nameParts.push(searchableTech[planet.techSpecialty]);
        nameParts.push(planet.techSpecialty.toLowerCase());
      }

      nameParts.push(`${planet.resources} resources`);
      nameParts.push(`${planet.influence} influence`);
    }

    acc.push([nameParts.join(" "), system.id] as const);
    return acc;
  },
  [] as [string, number][],
);
