import { shuffle } from "~/draft/helpers/randomization";
import type { FactionId } from "~/types";

// Add a base URL for your Cloudflare R2 CDN
const CDN_BASE_URL = "https://pub-0d0c405d32714102a425f3be2f199990.r2.dev";

// Update factionIds to include all factions used in factionAudios
export const factionIds: FactionId[] = [
  "muaat",
  "sol",
  "hacan",
  "xxcha",
  "nomad",
  "jolnar",
  "l1z1x",
  "empyrean",
];

export type LineType =
  | "homeDefense"
  | "homeInvasion"
  | "defenseOutnumbered"
  | "offenseSuperior"
  | "battleLines"
  | "jokes"
  | "special"
  | "special2";

type FactionAudio = {
  battleAnthem: string;
  battleAnthemDelay?: number;
  homeDefense: string[];
  homeInvasion?: string[];
  defenseOutnumbered?: string[];
  offenseSuperior?: string[];
  battleLines?: string[];
  jokes?: string[];
  special: {
    title: string;
    uris: string[];
  };
  special2?: {
    title: string;
    uris: string[];
  };
};

export const factionAudios: Record<FactionId, FactionAudio> = {
  yssaril: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/yssaril/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/yssaril/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/yssaril/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/yssaril/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/yssaril/battle1.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/battle2.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/battle3.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/battle4.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/battle5.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/battle6.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/battle7.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/yssaril/joke1.mp3`,
      `${CDN_BASE_URL}/voices/yssaril/joke2.mp3`,
    ],
    special: {
      title: "Action Card Stolen/Drawn",
      uris: [
        `${CDN_BASE_URL}/voices/yssaril/special1.mp3`,
        `${CDN_BASE_URL}/voices/yssaril/special2.mp3`,
      ],
    },
  },
  vulraith: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/vuilraith/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/vuilraith/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/vuilraith/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/vuilraith/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/vuilraith/battle1.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/battle2.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/battle3.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/battle4.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/battle5.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/battle6.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/battle7.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/vuilraith/joke1.mp3`,
      `${CDN_BASE_URL}/voices/vuilraith/joke2.mp3`,
    ],
    special: {
      title: "Devour (Capture)",
      uris: [
        `${CDN_BASE_URL}/voices/vuilraith/special1.mp3`,
        `${CDN_BASE_URL}/voices/vuilraith/special2.mp3`,
      ],
    },
  },
  titans: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/titan/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/titan/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/titans/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/titans/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/titans/battle1.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle2.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle3.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle4.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle5.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle6.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle7.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle8.mp3`,
      `${CDN_BASE_URL}/voices/titans/battle9.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/titans/joke1.mp3`,
      `${CDN_BASE_URL}/voices/titans/joke2.mp3`,
      `${CDN_BASE_URL}/voices/titans/joke3.mp3`,
    ],
    special: {
      title: "Sleeper Awakened",
      uris: [
        `${CDN_BASE_URL}/voices/titans/special1.mp3`,
        `${CDN_BASE_URL}/voices/titans/special2.mp3`,
      ],
    },
  },
  nekro: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/nekro/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/nekro/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/nekro/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/nekro/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/nekro/battle1.mp3`,
      `${CDN_BASE_URL}/voices/nekro/battle2.mp3`,
      `${CDN_BASE_URL}/voices/nekro/battle3.mp3`,
      `${CDN_BASE_URL}/voices/nekro/battle4.mp3`,
      `${CDN_BASE_URL}/voices/nekro/battle5.mp3`,
      `${CDN_BASE_URL}/voices/nekro/battle6.mp3`,
      `${CDN_BASE_URL}/voices/nekro/battle7.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/nekro/joke1.mp3`,
      `${CDN_BASE_URL}/voices/nekro/joke2.mp3`,
      `${CDN_BASE_URL}/voices/nekro/joke3.mp3`,
      `${CDN_BASE_URL}/voices/nekro/joke4.mp3`,
      `${CDN_BASE_URL}/voices/nekro/joke5.mp3`,
    ],
    special: {
      title: "Tech Assimilated",
      uris: [
        `${CDN_BASE_URL}/voices/nekro/special1.mp3`,
        `${CDN_BASE_URL}/voices/nekro/special2.mp3`,
        `${CDN_BASE_URL}/voices/nekro/special3.mp3`,
      ],
    },
  },
  naazrokha: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/naazrhoka/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/naazrhoka/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/naazrhoka/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/naazrhoka/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/naazrhoka/battle1.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/battle2.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/battle3.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/battle4.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/battle5.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/battle6.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/battle7.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/naazrhoka/joke1.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/joke2.mp3`,
      `${CDN_BASE_URL}/voices/naazrhoka/joke3.mp3`,
    ],
    special: {
      title: "Relic Acquired",
      uris: [
        `${CDN_BASE_URL}/voices/naazrhoka/specialrelic1.mp3`,
        `${CDN_BASE_URL}/voices/naazrhoka/specialrelic2.mp3`,
      ],
    },
    special2: {
      title: "Black Market Forgery",
      uris: [
        `${CDN_BASE_URL}/voices/naazrhoka/specialforgery1.mp3`,
        `${CDN_BASE_URL}/voices/naazrhoka/specialforgery2.mp3`,
        `${CDN_BASE_URL}/voices/naazrhoka/specialforgery3.mp3`,
      ],
    },
  },
  naalu: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/naalu/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/naalu/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/naalu/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/naalu/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/naalu/battle1.mp3`,
      `${CDN_BASE_URL}/voices/naalu/battle2.mp3`,
      `${CDN_BASE_URL}/voices/naalu/battle3.mp3`,
      `${CDN_BASE_URL}/voices/naalu/battle4.mp3`,
      `${CDN_BASE_URL}/voices/naalu/battle5.mp3`,
      `${CDN_BASE_URL}/voices/naalu/battle6.mp3`,
      `${CDN_BASE_URL}/voices/naalu/battle7.mp3`,
      `${CDN_BASE_URL}/voices/naalu/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/naalu/joke1.mp3`,
      `${CDN_BASE_URL}/voices/naalu/joke2.mp3`,
      `${CDN_BASE_URL}/voices/naalu/joke3.mp3`,
      `${CDN_BASE_URL}/voices/naalu/joke4.mp3`,
    ],
    special: {
      title: "Foresight",
      uris: [
        `${CDN_BASE_URL}/voices/naalu/special1.mp3`,
        `${CDN_BASE_URL}/voices/naalu/special2.mp3`,
      ],
    },
  },
  mentak: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/mentak/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/mentak/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/mentak/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/mentak/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/mentak/battle1.mp3`,
      `${CDN_BASE_URL}/voices/mentak/battle2.mp3`,
      `${CDN_BASE_URL}/voices/mentak/battle3.mp3`,
      `${CDN_BASE_URL}/voices/mentak/battle4.mp3`,
      `${CDN_BASE_URL}/voices/mentak/battle5.mp3`,
      `${CDN_BASE_URL}/voices/mentak/battle6.mp3`,
      `${CDN_BASE_URL}/voices/mentak/battle7.mp3`,
      `${CDN_BASE_URL}/voices/mentak/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/mentak/joke1.mp3`,
      `${CDN_BASE_URL}/voices/mentak/joke2.mp3`,
      `${CDN_BASE_URL}/voices/mentak/joke3.mp3`,
      `${CDN_BASE_URL}/voices/mentak/joke4.mp3`,
    ],
    special: {
      title: "Pillage",
      uris: [
        `${CDN_BASE_URL}/voices/mentak/special1.mp3`,
        `${CDN_BASE_URL}/voices/mentak/special2.mp3`,
        `${CDN_BASE_URL}/voices/mentak/special3.mp3`,
      ],
    },
    special2: {
      title: "Ambush",
      uris: [`${CDN_BASE_URL}/voices/mentak/specialb.mp3`],
    },
  },
  argent: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/argent/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/argent/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/argent/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/argent/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/argent/battle1.mp3`,
      `${CDN_BASE_URL}/voices/argent/battle2.mp3`,
      `${CDN_BASE_URL}/voices/argent/battle3.mp3`,
      `${CDN_BASE_URL}/voices/argent/battle4.mp3`,
      `${CDN_BASE_URL}/voices/argent/battle5.mp3`,
      `${CDN_BASE_URL}/voices/argent/battle6.mp3`,
      `${CDN_BASE_URL}/voices/argent/battle7.mp3`,
      `${CDN_BASE_URL}/voices/argent/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/argent/joke1.mp3`,
      `${CDN_BASE_URL}/voices/argent/joke2.mp3`,
      `${CDN_BASE_URL}/voices/argent/joke3.mp3`,
    ],
    special: {
      title: "Raid Formation",
      uris: [
        `${CDN_BASE_URL}/voices/argent/special1.mp3`,
        `${CDN_BASE_URL}/voices/argent/special2.mp3`,
      ],
    },
  },
  arborec: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/arborec/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/arborec/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/arborec/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/arborec/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/arborec/battle1.mp3`,
      `${CDN_BASE_URL}/voices/arborec/battle2.mp3`,
      `${CDN_BASE_URL}/voices/arborec/battle3.mp3`,
      `${CDN_BASE_URL}/voices/arborec/battle4.mp3`,
      `${CDN_BASE_URL}/voices/arborec/battle5.mp3`,
      `${CDN_BASE_URL}/voices/arborec/battle6.mp3`,
      `${CDN_BASE_URL}/voices/arborec/battle7.mp3`,
      `${CDN_BASE_URL}/voices/arborec/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/arborec/joke1.mp3`,
      `${CDN_BASE_URL}/voices/arborec/joke2.mp3`,
      `${CDN_BASE_URL}/voices/arborec/joke3.mp3`,
    ],
    special: {
      title: "Huge Build (Hero)",
      uris: [
        `${CDN_BASE_URL}/voices/arborec/special1.mp3`,
        `${CDN_BASE_URL}/voices/arborec/special2.mp3`,
      ],
    },
  },
  yin: {
    battleAnthem: "",
    homeDefense: [`${CDN_BASE_URL}/voices/yin/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/yin/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/yin/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/yin/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/yin/battle1.mp3`,
      `${CDN_BASE_URL}/voices/yin/battle2.mp3`,
      `${CDN_BASE_URL}/voices/yin/battle3.mp3`,
      `${CDN_BASE_URL}/voices/yin/battle4.mp3`,
      `${CDN_BASE_URL}/voices/yin/battle5.mp3`,
      `${CDN_BASE_URL}/voices/yin/battle6.mp3`,
      `${CDN_BASE_URL}/voices/yin/battle7.mp3`,
      `${CDN_BASE_URL}/voices/yin/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/yin/joke1.mp3`,
      `${CDN_BASE_URL}/voices/yin/joke2.mp3`,
      `${CDN_BASE_URL}/voices/yin/joke3.mp3`,
    ],
    special: {
      title: "Van Haugh Explodes",
      uris: [
        `${CDN_BASE_URL}/voices/yin/special1.mp3`,
        `${CDN_BASE_URL}/voices/yin/special2.mp3`,
      ],
    },
  },
  barony: {
    battleAnthem: "spotify:track:1N7LRc9YuyMjWKEkrmlogM",
    homeDefense: [`${CDN_BASE_URL}/voices/barony/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/barony/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/barony/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/barony/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/barony/battle1.mp3`,
      `${CDN_BASE_URL}/voices/barony/battle2.mp3`,
      `${CDN_BASE_URL}/voices/barony/battle3.mp3`,
      `${CDN_BASE_URL}/voices/barony/battle4.mp3`,
      `${CDN_BASE_URL}/voices/barony/battle5.mp3`,
      `${CDN_BASE_URL}/voices/barony/battle6.mp3`,
      `${CDN_BASE_URL}/voices/barony/battle7.mp3`,
      `${CDN_BASE_URL}/voices/barony/battle8.mp3`,
    ],
    special: {
      title: "War Funding",
      uris: [
        `${CDN_BASE_URL}/voices/barony/special1.mp3`,
        `${CDN_BASE_URL}/voices/barony/special2.mp3`,
      ],
    },
    jokes: [
      `${CDN_BASE_URL}/voices/barony/joke1.mp3`,
      `${CDN_BASE_URL}/voices/barony/joke2.mp3`,
    ],
  },
  saar: {
    battleAnthem: "spotify:track:3xlr5CPOArA6UEw6f29st9",
    homeDefense: [`${CDN_BASE_URL}/voices/saar/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/saar/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/saar/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/saar/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/saar/battle1.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle2.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle3.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle4.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle5.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle6.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle7.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle8.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle9.mp3`,
      `${CDN_BASE_URL}/voices/saar/battle10.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/saar/joke1.mp3`,
      `${CDN_BASE_URL}/voices/saar/joke2.mp3`,
    ],
    special: {
      title: "Enter Asteroid",
      uris: [
        `${CDN_BASE_URL}/voices/saar/special1.mp3`,
        `${CDN_BASE_URL}/voices/saar/special2.mp3`,
      ],
    },
  },
  jolnar: {
    battleAnthem: "spotify:track:3xlr5CPOArA6UEw6f29st9",
    homeDefense: [`${CDN_BASE_URL}/voices/jolnar/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/jolnar/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/jolnar/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/jolnar/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/jolnar/battle1.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle2.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle3.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle4.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle5.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle6.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle7.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/battle8.mp3`,
    ],
    special: {
      title: "Tech Acquired",
      uris: [
        `${CDN_BASE_URL}/voices/jolnar/special1.mp3`,
        `${CDN_BASE_URL}/voices/jolnar/special2.mp3`,
      ],
    },
    jokes: [
      `${CDN_BASE_URL}/voices/jolnar/joke1.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke2.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke3.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke4.mp3`,
      `${CDN_BASE_URL}/voices/jolnar/joke5.mp3`,
    ],
  },
  l1z1x: {
    battleAnthem: "spotify:track:5HiAN0PZVXUSMgpiqrScC9",
    homeDefense: [`${CDN_BASE_URL}/voices/l1z1x/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/l1z1x/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/l1z1x/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/l1z1x/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/l1z1x/battle1.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle2.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle3.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle4.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle5.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle6.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle7.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/l1z1x/joke1.mp3`,
      `${CDN_BASE_URL}/voices/l1z1x/joke2.mp3`,
    ],
    special: {
      title: "Assimilation",
      uris: [
        `${CDN_BASE_URL}/voices/l1z1x/special1.mp3`,
        `${CDN_BASE_URL}/voices/l1z1x/special2.mp3`,
      ],
    },
    special2: {
      title: "Harrow",
      uris: [
        `${CDN_BASE_URL}/voices/l1z1x/special11.mp3`,
        `${CDN_BASE_URL}/voices/l1z1x/special12.mp3`,
      ],
    },
  },
  muaat: {
    battleAnthem: "spotify:track:46h0MLW2ONEGKJTUdFNx5f",
    homeDefense: [`${CDN_BASE_URL}/voices/muaat/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/muaat/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/muaat/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/muaat/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/muaat/battle1.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle2.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle3.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle4.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle5.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle6.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle7.mp3`,
      `${CDN_BASE_URL}/voices/muaat/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/muaat/joke1.mp3`,
      `${CDN_BASE_URL}/voices/muaat/joke2.mp3`,
      `${CDN_BASE_URL}/voices/muaat/joke3.mp3`,
    ],
    special: {
      title: "War Sun Built",
      uris: [
        `${CDN_BASE_URL}/voices/muaat/special1.mp3`,
        `${CDN_BASE_URL}/voices/muaat/special2.mp3`,
      ],
    },
  },
  sol: {
    battleAnthem: "spotify:track:6Rlybp1JsE3GUjYp5rC0mo",
    homeDefense: [`${CDN_BASE_URL}/voices/sol/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/sol/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/sol/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/sol/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/sol/battle1.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle2.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle3.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle4.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle5.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle6.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle7.mp3`,
      `${CDN_BASE_URL}/voices/sol/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/sol/joke1.mp3`,
      `${CDN_BASE_URL}/voices/sol/joke2.mp3`,
    ],
    special: {
      title: "Orbital Drop",
      uris: [
        `${CDN_BASE_URL}/voices/sol/special1.mp3`,
        `${CDN_BASE_URL}/voices/sol/special2.mp3`,
        // `${CDN_BASE_URL}/voices/sol/special3.mp3`,
      ],
    },
  },
  hacan: {
    battleAnthem: "spotify:track:61Ps2sXXwiYCcyAynt81JI",
    // epic home system delay
    // battleAnthemDelay: 153000,
    battleAnthemDelay: 80000,
    homeDefense: [`${CDN_BASE_URL}/voices/hacan/home-defense-2.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/hacan/home-invasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/hacan/defense-outnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/hacan/offense-superior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/hacan/battle-1.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-2.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-3.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-4.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-5.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-6.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-7.mp3`,
      `${CDN_BASE_URL}/voices/hacan/battle-8.mp3`,
    ],
    jokes: [`${CDN_BASE_URL}/voices/hacan/joke1.mp3`],
    special: {
      title: "Trade used",
      uris: [
        `${CDN_BASE_URL}/voices/hacan/special1.mp3`,
        `${CDN_BASE_URL}/voices/hacan/special2.mp3`,
      ],
    },
  },
  nomad: {
    battleAnthem: "spotify:track:2Qr9qyTz3NxoSlLOzLUefL",
    homeDefense: [`${CDN_BASE_URL}/voices/nomad/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/nomad/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/nomad/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/nomad/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/nomad/battle1.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle2.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle3.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle4.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle5.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle6.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle7.mp3`,
      `${CDN_BASE_URL}/voices/nomad/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/nomad/joke1.mp3`,
      `${CDN_BASE_URL}/voices/nomad/joke2.mp3`,
      `${CDN_BASE_URL}/voices/nomad/joke3.mp3`,
    ],
    special: {
      title: "Calvary Sold",
      uris: [
        `${CDN_BASE_URL}/voices/nomad/special1.mp3`,
        `${CDN_BASE_URL}/voices/nomad/special2.mp3`,
      ],
    },
  },
  xxcha: {
    battleAnthem: "spotify:track:5cvEWY2qrrPkkjv9x0a7ue",
    homeDefense: [`${CDN_BASE_URL}/voices/xxcha/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/xxcha/homeinvasion.mp3`],
    defenseOutnumbered: [`${CDN_BASE_URL}/voices/xxcha/defenseoutnumbered.mp3`],
    offenseSuperior: [`${CDN_BASE_URL}/voices/xxcha/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/xxcha/battle1.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle2.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle3.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle4.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle5.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle6.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle7.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle8.mp3`,
      `${CDN_BASE_URL}/voices/xxcha/battle9.mp3`,
    ],
    special: {
      title: "Diplomacy Used",
      uris: [
        `${CDN_BASE_URL}/voices/xxcha/special1.mp3`,
        `${CDN_BASE_URL}/voices/xxcha/special2.mp3`,
      ],
    },
    jokes: [`${CDN_BASE_URL}/voices/xxcha/joke2.mp3`],
  },
  empyrean: {
    battleAnthem: "spotify:track:018SQDupRTRsl1Wolu1X0c",
    homeDefense: [`${CDN_BASE_URL}/voices/empyrean/homedefense.mp3`],
    homeInvasion: [`${CDN_BASE_URL}/voices/empyrean/homeinvasion.mp3`],
    defenseOutnumbered: [
      `${CDN_BASE_URL}/voices/empyrean/defenseoutnumbered.mp3`,
    ],
    offenseSuperior: [`${CDN_BASE_URL}/voices/empyrean/offensesuperior.mp3`],
    battleLines: [
      `${CDN_BASE_URL}/voices/empyrean/battle1.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle2.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle3.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle4.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle5.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle6.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle7.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/battle8.mp3`,
    ],
    jokes: [
      `${CDN_BASE_URL}/voices/empyrean/joke1.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/joke2.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/joke3.mp3`,
      `${CDN_BASE_URL}/voices/empyrean/joke4.mp3`,
    ],
    special: {
      title: "Frontier token",
      uris: [
        `${CDN_BASE_URL}/voices/empyrean/special1.mp3`,
        `${CDN_BASE_URL}/voices/empyrean/special2.mp3`,
      ],
    },
  },
} as const;

export const getAudioSrc = (factionId: FactionId, type: LineType): string => {
  const factionAudio = factionAudios[factionId];
  if (!factionAudio) return "";

  if (type === "special") return shuffle(factionAudio.special.uris)[0];
  if (type === "special2" && factionAudio.special2)
    return shuffle(factionAudio.special2.uris)[0];

  // For other types, we know they are string arrays or undefined
  return shuffle((factionAudio[type] as string[]) ?? [])[0];
};

export const getAllSrcs = (
  factionId: FactionId,
  type:
    | "homeDefense"
    | "homeInvasion"
    | "defenseOutnumbered"
    | "offenseSuperior"
    | "battleLines"
    | "jokes"
    | "special"
    | "special2",
) => {
  if (type === "special") return factionAudios[factionId].special.uris;
  if (type === "special2") return factionAudios[factionId].special2?.uris ?? [];
  return factionAudios[factionId][type] ?? [];
};
