import { FactionId } from "~/types";

export type MahactKingUnitReference = {
  type: "Flagship" | "Mech";
  name: string;
  ability: string;
  traits: string[];
  stats: { label: string; value: string }[];
};

export type MahactKingReference = {
  accent: string;
  commodities: number;
  units: [MahactKingUnitReference, MahactKingUnitReference];
};

export const mahactKingReferences: Partial<
  Record<FactionId, MahactKingReference>
> = {
  redKing: {
    accent: "#c92f32",
    commodities: 2,
    units: [
      {
        type: "Flagship",
        name: "The Scarlet Knife",
        ability:
          "DEPLOY: At the start of your turn, you may discard 1 of your abilities or genomes to place this unit from your reinforcements into a system that contains your ships.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "8" },
          { label: "Combat", value: "5 × 2" },
          { label: "Move", value: "2" },
          { label: "Capacity", value: "3" },
        ],
      },
      {
        type: "Mech",
        name: "The Sharpened Edge",
        ability:
          "DEPLOY: When your flagship is placed, you may place 1 mech into your flagship's space area.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "6" },
        ],
      },
    ],
  },
  yellowKing: {
    accent: "#e5b72f",
    commodities: 6,
    units: [
      {
        type: "Flagship",
        name: "Scintillia",
        ability:
          "When you splice, gain 2 commodities or convert 2 of your commodities to trade goods.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "8" },
          { label: "Combat", value: "9 × 2" },
          { label: "Move", value: "1" },
          { label: "Capacity", value: "3" },
        ],
      },
      {
        type: "Mech",
        name: "Delver",
        ability:
          "When you splice, gain 1 commodity or convert 1 of your commodities to a trade good.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "6" },
        ],
      },
    ],
  },
  blueKing: {
    accent: "#228be6",
    commodities: 3,
    units: [
      {
        type: "Flagship",
        name: "Tizona",
        ability:
          "Apply +1 to the MOVE value of this ship if it would transport 4 units.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "8" },
          { label: "Combat", value: "3" },
          { label: "Move", value: "2" },
          { label: "Capacity", value: "4" },
        ],
      },
      {
        type: "Mech",
        name: "Colada",
        ability:
          "While this unit is in the space area, choose 1 unit in its system that has a capacity value to roll 1 additional die on its combat roll.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "6" },
        ],
      },
    ],
  },
  orangeKing: {
    accent: "#f08c2e",
    commodities: 4,
    units: [
      {
        type: "Flagship",
        name: "Airo Shir Rex",
        ability:
          "At the end of the edict phase, if this unit is on the game board, draw and resolve 1 edict.",
        traits: ["Anti-Fighter Barrage 5 × 3", "Sustain Damage"],
        stats: [
          { label: "Cost", value: "8" },
          { label: "Combat", value: "7 × 2" },
          { label: "Move", value: "1" },
          { label: "Capacity", value: "6" },
        ],
      },
      {
        type: "Mech",
        name: "Starlancer II",
        ability:
          "At the start of each round of ground combat, you may spend 1 token from your strategy pool to repair all of your mechs.",
        traits: ["Planetary Shield", "Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "6" },
        ],
      },
    ],
  },
  purpleKing: {
    accent: "#7950c8",
    commodities: 4,
    units: [
      {
        type: "Flagship",
        name: "Enigma",
        ability:
          "This unit ignores the effects of all anomalies. Its MOVE value is reduced by 1 for each unit it would transport.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "7" },
          { label: "Combat", value: "7" },
          { label: "Move", value: "7" },
          { label: "Capacity", value: "7" },
        ],
      },
      {
        type: "Mech",
        name: "Starlancer XI",
        ability:
          "This unit participates in space combat as if it were a ship. For each anomaly this unit is in or adjacent to, apply +1 to this unit's combat rolls.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "6" },
        ],
      },
    ],
  },
  pinkKing: {
    accent: "#d6338c",
    commodities: 3,
    units: [
      {
        type: "Flagship",
        name: "The Faces of Janovet",
        ability:
          "This unit gains the unit abilities and text abilities of your destroyer, cruiser, and dreadnought unit upgrade technologies.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "8" },
          { label: "Combat", value: "5 × 2" },
          { label: "Move", value: "1" },
          { label: "Capacity", value: "3" },
        ],
      },
      {
        type: "Mech",
        name: "Analyzer",
        ability:
          "At the end of a ground combat you won in which this unit participated, you may return this unit to your reinforcements to draw 1 unit upgrade technology.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "6" },
        ],
      },
    ],
  },
  blackKing: {
    accent: "#5c5f66",
    commodities: 2,
    units: [
      {
        type: "Flagship",
        name: "A Strangled Whisper",
        ability:
          "This ship can transport any number of infantry and fighters, and they do not count against this ship's capacity.",
        traits: ["Bombardment 7", "Sustain Damage"],
        stats: [
          { label: "Cost", value: "8" },
          { label: "Combat", value: "7 × 2" },
          { label: "Move", value: "1" },
          { label: "Capacity", value: "1" },
        ],
      },
      {
        type: "Mech",
        name: "Bone Picked Clean",
        ability:
          "When you splice, capture 1 infantry from the reinforcements of any player with adjacent units; you can spend 1 captured infantry after rolling during combat to reroll this unit's dice.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "5 × 2" },
        ],
      },
    ],
  },
  greenKing: {
    accent: "#2f9e44",
    commodities: 3,
    units: [
      {
        type: "Flagship",
        name: "Nightbloom",
        ability:
          "When this unit moves, you may resolve the production abilities of your units in the system it started in and each system it moved through.",
        traits: ["Sustain Damage"],
        stats: [
          { label: "Cost", value: "8" },
          { label: "Combat", value: "7 × 2" },
          { label: "Move", value: "1" },
          { label: "Capacity", value: "6" },
        ],
      },
      {
        type: "Mech",
        name: "Lakoe's Roots",
        ability:
          "When this unit is produced, place it on any planet you control.",
        traits: ["Production 2", "Sustain Damage"],
        stats: [
          { label: "Cost", value: "2" },
          { label: "Combat", value: "6" },
        ],
      },
    ],
  },
};
