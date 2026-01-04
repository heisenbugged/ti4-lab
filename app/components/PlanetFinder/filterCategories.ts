export type FilterCategory = {
  id: string;
  label: string;
  filters: FilterOption[];
};

export type FilterOption = {
  id: string;
  label: string;
  searchTerm: string;
  color?: string;
};

export const FILTER_CATEGORIES: FilterCategory[] = [
  {
    id: "traits",
    label: "Planet Traits",
    filters: [
      { id: "cultural", label: "Cultural", searchTerm: "cultural", color: "blue" },
      { id: "hazardous", label: "Hazardous", searchTerm: "hazardous", color: "red" },
      { id: "industrial", label: "Industrial", searchTerm: "industrial", color: "green" },
    ],
  },
  {
    id: "tech",
    label: "Tech Skips",
    filters: [
      { id: "biotic", label: "Biotic", searchTerm: "biotic", color: "green" },
      { id: "propulsion", label: "Propulsion", searchTerm: "propulsion", color: "blue" },
      { id: "cybernetic", label: "Cybernetic", searchTerm: "cybernetic", color: "yellow" },
      { id: "warfare", label: "Warfare", searchTerm: "warfare", color: "red" },
    ],
  },
  {
    id: "special",
    label: "Special",
    filters: [
      { id: "legendary", label: "Legendary", searchTerm: "legendary", color: "yellow" },
      { id: "station", label: "Space Station", searchTerm: "space station", color: "cyan" },
    ],
  },
  {
    id: "wormholes",
    label: "Wormholes",
    filters: [
      { id: "wormhole", label: "Any", searchTerm: "wormhole", color: "gray" },
      { id: "alpha", label: "Alpha", searchTerm: "alpha", color: "orange" },
      { id: "beta", label: "Beta", searchTerm: "beta", color: "green" },
      { id: "gamma", label: "Gamma", searchTerm: "gamma", color: "violet" },
      { id: "delta", label: "Delta", searchTerm: "delta", color: "blue" },
    ],
  },
  {
    id: "anomalies",
    label: "Anomalies",
    filters: [
      { id: "anomaly", label: "Any", searchTerm: "anomaly", color: "orange" },
      { id: "nebula", label: "Nebula", searchTerm: "nebula", color: "orange" },
      { id: "asteroid", label: "Asteroid", searchTerm: "asteroid field", color: "orange" },
      { id: "rift", label: "Gravity Rift", searchTerm: "gravity rift", color: "orange" },
      { id: "supernova", label: "Supernova", searchTerm: "supernova", color: "orange" },
    ],
  },
  {
    id: "hyperlanes",
    label: "Hyperlanes",
    filters: [
      { id: "hyperlane", label: "Any", searchTerm: "hyperlane", color: "cyan" },
    ],
  },
  {
    id: "system",
    label: "System Type",
    filters: [
      { id: "empty", label: "Empty", searchTerm: "empty", color: "gray" },
      { id: "1planet", label: "1 Planet", searchTerm: "1 planet", color: "gray" },
      { id: "2planet", label: "2 Planets", searchTerm: "2 planet", color: "gray" },
      { id: "3planet", label: "3 Planets", searchTerm: "3 planet", color: "gray" },
    ],
  },
  {
    id: "gameset",
    label: "Game Set",
    filters: [
      { id: "gs-base", label: "Base", searchTerm: "base game", color: "gray" },
      { id: "gs-pok", label: "PoK", searchTerm: "prophecy of kings", color: "gray" },
      { id: "gs-te", label: "Thunder's Edge", searchTerm: "thunders edge", color: "gray" },
      { id: "gs-ds", label: "Discordant Stars", searchTerm: "discordant stars", color: "gray" },
      { id: "gs-us", label: "Uncharted Stars", searchTerm: "uncharted stars", color: "gray" },
    ],
  },
];
