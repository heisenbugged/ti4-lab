import { shuffle } from "~/draft/helpers/randomization";
import type { FactionId } from "~/types";

// Add a base URL for your Cloudflare R2 CDN
export const CDN_BASE_URL =
  "https://pub-0d0c405d32714102a425f3be2f199990.r2.dev";

export type LineType =
  | "homeDefense"
  | "homeInvasion"
  | "defenseOutnumbered"
  | "offenseSuperior"
  | "battleLines"
  | "jokes"
  | "special"
  | "special2";

export type AudioEntry = {
  url: string;
  caption?: string;
};

type FactionAudio = {
  battleAnthem: string;
  battleAnthemDelay?: number;
  homeDefense: AudioEntry[];
  homeInvasion?: AudioEntry[];
  defenseOutnumbered?: AudioEntry[];
  offenseSuperior?: AudioEntry[];
  battleLines?: AudioEntry[];
  jokes?: AudioEntry[];
  special: {
    title: string;
    entries: AudioEntry[];
  };
  special2?: {
    title: string;
    entries: AudioEntry[];
  };
};

export const factionAudios: Record<FactionId, FactionAudio> = {
  creuss: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/ghosts/homedefense.mp3`,
        caption:
          "You have breached the layers of reality! What is this sacrilege you dare perpetrate here? We stand not as individuals against this callous invasion, but as representatives of the universe itself; our filaments are the bulwarks of reality; our purity of strength is the 'bone' of this realm. You strike at the heart of Creuss but you will find only fog. Prepare to learn a lesson that only your emergency beacons will convey back to your home planets.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/ghosts/homeinvasion.mp3`,
        caption: "This was inevitable: we fold your world into our own.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/ghosts/defenseoutnumbered.mp3`,
        caption:
          "We may be shredded in the coming assault, but through the edges of your reality we will be avenged.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/ghosts/offensesuperior.mp3`,
        caption:
          "The void beckons, and your atoms tremble. Reality itself recoils at your audacity—this battlefield is ours.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle1.mp3`,
        caption:
          "Dimensional vectors are a shroud. Prepare to be enveloped in the real.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle2.mp3`,
        caption:
          "You march through your linear dimension, blind to the infinite folds around you. We will teach you the meaning of perspective.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle3.mp3`,
        caption: "Stand proud, for here come your shadows to cut you down.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle4.mp3`,
        caption:
          "Your ranks are aligned for war, but war is a straight line. We are the infinite curve, and we will unwind you.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle5.mp3`,
        caption:
          "We weave our ships out of the fabric of space itself; you cannot withstand.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle6.mp3`,
        caption:
          "Perhaps one day there will be a synchrony between our realities: but today is not that day.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle7.mp3`,
        caption: "Prepare your soldiers for dissolution.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/battle8.mp3`,
        caption: "The vectors of the universe converge on your doom.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/ghosts/joke1.mp3`,
        caption: "Nothing matter-s to us.",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/joke2.mp3`,
        caption:
          "This is what you sound like: \"Oh wow A squared + B squared = the hypotenuse squared of a 'triangle'. Like a child.\"",
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/joke3.mp3`,
        caption:
          'This is what you sound like: "Help help, a circle has an impossible ratio to its diameter." Open your minds.',
      },
      {
        url: `${CDN_BASE_URL}/voices/ghosts/joke4.mp3`,
        caption:
          'This is what you sound like: "Oh no an imaginary number, save me!" Spare us your primitivisms.',
      },
    ],
    special: {
      title: "Wormhole Placed",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/ghosts/special1.mp3`,
          caption:
            "[Dimensional rift opens] Behold! A new pathway through the cosmos unfolds!",
        },
        {
          url: `${CDN_BASE_URL}/voices/ghosts/special2.mp3`,
          caption:
            "[Reality tears] The wormhole network expands at our ethereal command!",
        },
      ],
    },
  },
  winnu: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/winnu/homedefense.mp3`,
        caption:
          "You dare defile the memory of the Lazax with your presence? This world belongs to order, to strength, to the Winnu. We are here to claim what is rightfully ours.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/winnu/homeinvasion.mp3`,
        caption:
          "Your rule is a mockery of the order the Lazax built. We will cleanse this world of its false sovereigns and restore its place within the true empire!",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/winnu/defenseoutnumbered.mp3`,
        caption:
          "The Lazax did not falter before the tide of pretenders, and neither shall we. Destiny is forged by will, not numbers. Hold the line!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/winnu/offensesuperior.mp3`,
        caption:
          "Look at you - scavengers squabbling over a dead empire's bones. We? We rebuild what you slaughtered. Now witness the fire of true heirs.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle1.mp3`,
        caption:
          "The Winnu preserve what others let slip into ruin. We shall carve their failure into the stars!",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle2.mp3`,
        caption:
          "Those who cast aside the Lazax now cower before their rightful successors. Press forward and show them the cost of their folly!",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle3.mp3`,
        caption:
          "The throne does not belong to cowards who fled when the fires of war raged. It belongs to those who stood firm—those who strike now!",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle4.mp3`,
        caption:
          "We do not seek conquest for its own sake. We seek to return the galaxy to what it was meant to be!",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle5.mp3`,
        caption:
          "Loyalty, order, strength—these are the pillars of true rule. And we alone uphold them!",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle6.mp3`,
        caption:
          "The past is not dead. It moves with us, it fights with us, and through us, it will reign once more!",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle7.mp3`,
        caption:
          "Our fleets move as one, our will is unbreakable! Tear through their ranks and remind them why the Lazax once ruled them all!",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/battle8.mp3`,
        caption:
          "These halls are meant for rulers, not cowards! Cut them down and let the blood of traitors stain Mecatol's floors once more!",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/winnu/joke1.mp3`,
        caption: "We don't do 'jokes', Empire is serious business.",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/joke2.mp3`,
        caption: "No, those are the Winnarans. We're very different.",
      },
      {
        url: `${CDN_BASE_URL}/voices/winnu/joke3.mp3`,
        caption:
          "*chuckling* Ah yes, our vast fleets. They will be here any day now.",
      },
    ],
    special: {
      title: "Mecatol Rex Taken",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/winnu/special1.mp3`,
          caption:
            "At last, the Imperial Throne returns to its rightful heirs. The Winnu ascend!",
        },
        {
          url: `${CDN_BASE_URL}/voices/winnu/special2.mp3`,
          caption: "By the will of the Lazax, Mecatol Rex is ours once more!",
        },
      ],
    },
  },
  sardakk: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/sardakk/homedefense.mp3`,
        caption:
          "The ruby storms of Quinarra rage with us! Invaders will be torn apart by the might of the swarm and Sardakk's unyielding will! You dare tread our nests? The swarm shall drown you in fire and venom!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/sardakk/homeinvasion.mp3`,
        caption:
          "This world belongs to the swarm now. Your towers will topple, your gates will shatter, and your people will bow to Sardakk's will!",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/sardakk/defenseoutnumbered.mp3`,
        caption:
          "Weak storms scatter against our hive! Let their numbers come—we are Tekklar, forged where the storms never die! To the last, we fight for the Queen Mother!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/sardakk/offensesuperior.mp3`,
        caption:
          "Pathetic crawlers! You scurry beneath us like prey! Witness the might of the swarm as we blot out your stars and crush your fragile shells!",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle1.mp3`,
        caption:
          "The skies churn, the ground shatters, and your blood will soak the crimson earth! Strike with the fury of the swarm!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle2.mp3`,
        caption:
          "The Veiled Brood wills it, and the swarm obeys! Your end is written in the dust and storm of Quinarra!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle3.mp3`,
        caption:
          "The weak shall break, the strong shall kneel! The N'orr do not falter!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle4.mp3`,
        caption: "Sardakk's children consume all who stand before us!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle5.mp3`,
        caption: "The brood strikes as one; resistance is futile!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle6.mp3`,
        caption: "Your skies will darken, your worlds will fall!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle7.mp3`,
        caption: "Your fragile shells crack beneath our talons!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/battle8.mp3`,
        caption: "Weak flesh, brittle metal—no match for Sardakk's will!",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/sardakk/joke1.mp3`,
        caption: "We call it nesting, not invading.",
      },
      {
        url: `${CDN_BASE_URL}/voices/sardakk/joke2.mp3`,
        caption: "You brought bug spray? Adorable!",
      },
    ],
    special: {
      title: "Exotrireme II ability",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/sardakk/special1.mp3`,
          caption: "No ship escapes the wrath of a dying dreadnought!",
        },
        {
          url: `${CDN_BASE_URL}/voices/sardakk/special2.mp3`,
          caption: "Feel the power of the swarm!",
        },
      ],
    },
  },
  mahact: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/mahact/homedefense.mp3`,
        caption:
          "You march into the abyss of your own making. Each step you take upon Ixth binds your will to mine, your strength to my command. This is not a battle—it is the reshaping of your destiny by the Mahact's hand.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/mahact/homeinvasion.mp3`,
        caption:
          "Your defenders will kneel before the day is done. Your world, its skies, its seas—all of it belongs to us now.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/mahact/defenseoutnumbered.mp3`,
        caption:
          "Numbers mean nothing when your will is not your own. Watch as your champions turn their weapons upon you, their masters now forgotten.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/mahact/offensesuperior.mp3`,
        caption:
          "It is pitiful how easily you break—your soldiers, your minds, your very souls, all tools of my design. Resistance only delays the inevitable.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle1.mp3`,
        caption:
          "Your will falters already. Soon, you will call me master and wield your weapons against your kin.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle2.mp3`,
        caption:
          "Fate has already claimed this battle. Your minds will soon follow, and through you, our dominion grows.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle3.mp3`,
        caption:
          "Do you feel it? The pull of your thoughts slipping away. You are already mine—your body simply has yet to realize.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle4.mp3`,
        caption:
          "Your commanders fall one by one, their minds too weak to resist. Soon, your armies will be ours to command.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle5.mp3`,
        caption:
          "Truly, your ancestors offered greater resistance. Your weakness is a disgrace.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle6.mp3`,
        caption: "Submit to the will of the Mahact.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle7.mp3`,
        caption:
          "The true rulers of this galaxy have returned, and all shall bow.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/battle8.mp3`,
        caption:
          "It matters not whether you submit willingly or by our hand: submit you will.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/mahact/joke1.mp3`,
        caption:
          'I did not expect you to put the "infant" into "infantry", but here we are.',
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/joke2.mp3`,
        caption:
          "This genetic code is (exasperated sound) … I did not expect a word puzzle.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/joke3.mp3`,
        caption:
          "I will untangle your genetics like a strand of decorative lights.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mahact/joke4.mp3`,
        caption:
          "*laughs cruelly* There's a joke in this DNA. (pause). It's you. You are the joke.",
      },
    ],
    special: {
      title: "Commander Acquired",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/mahact/special1.mp3`,
          caption: "Our dominance has been restored.",
        },
        {
          url: `${CDN_BASE_URL}/voices/mahact/special2.mp3`,
          caption: "Your trusted leader now answers to their rightful master.",
        },
      ],
    },
  },
  yssaril: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/yssaril/homedefense.mp3`,
        caption:
          "These swamps are alive with Yssaril fury! The shadows guard us, the mists shield us, and the land itself rises to defend its own. This is our sanctuary, born of cunning and shadow, and no invader shall take it from us! Let them come—we are the Yssaril, and here, we are unstoppable!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/yssaril/homeinvasion.mp3`,
        caption:
          "The Guild has marked this world for our own! Your cities will crumble, your secrets stolen, and your lives… fleeting whispers in the mist!",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/yssaril/defenseoutnumbered.mp3`,
        caption:
          "Outnumbered? Foolish! The Guild thrives in the impossible. Every shadow hides a blade, every swamp hides death. Let them come—we are more than enough!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/yssaril/offensesuperior.mp3`,
        caption:
          "Pathetic creatures, struggling like trapped vermin. The Guild doesn't fight—we eradicate. You're already forgotten.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle1.mp3`,
        caption:
          "The mists conceal, the knives strike, and the Guild claims its prize!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle2.mp3`,
        caption:
          "Strike swift, strike silent! Let them drown in fear and fade from sight!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle3.mp3`,
        caption:
          "The Guild moves unseen, its blades cutting deep. Leave nothing but whispers behind!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle4.mp3`,
        caption:
          "Their end comes not with a roar, but with a whisper in the dark. Forward, Yssaril!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle5.mp3`,
        caption:
          "The Guild whispers your name… and now it's gone from this world.",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle6.mp3`,
        caption:
          "Let them try to fight fog and blades! We are everywhere, and nowhere!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle7.mp3`,
        caption:
          "Every shadow hides one of us. Every whisper spreads across the Guild.",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/battle8.mp3`,
        caption:
          "You face not an army, but a web of shadows. And it has already ensnared you.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/yssaril/joke1.mp3`,
        caption: "Hide and sneak.",
      },
      {
        url: `${CDN_BASE_URL}/voices/yssaril/joke2.mp3`,
        caption:
          "Height requirement? We don't need no stinkin' height requirement!",
      },
    ],
    special: {
      title: "Action Card Stolen/Drawn",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/yssaril/special1.mp3`,
          caption: "Your secrets are ours now.",
        },
        {
          url: `${CDN_BASE_URL}/voices/yssaril/special2.mp3`,
          caption: "The Guild grows stronger with every whisper.",
        },
      ],
    },
  },
  vulraith: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/homedefense.mp3`,
        caption:
          "You come to our space? To our rift? Foolish prey! We will grind you to nothing and feed on your screams!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/homeinvasion.mp3`,
        caption:
          "Your world is weak. Your flesh is ours. Hide, it won't save you.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/defenseoutnumbered.mp3`,
        caption:
          "More meat! More blood! We'll tear through all of you, no matter how many!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/offensesuperior.mp3`,
        caption: "Pathetic! You're nothing but bones! This is already over.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle1.mp3`,
        caption: "We smell your fear. It makes the kill sweeter!",
      },
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle2.mp3`,
        caption:
          "You can't run. You can't hide. We'll find you, and you'll die screaming!",
      },
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle3.mp3`,
        caption:
          "The void hungers, and we are its teeth. You're just another meal.",
      },
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle4.mp3`,
        caption:
          "Your ships crack, your bones break, and your hope fades. Good… now you understand.",
      },
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle5.mp3`,
        caption: "We are the maw, and you are nothing but prey.",
      },
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle6.mp3`,
        caption: "Every strike you make only feeds the void's hunger.",
      },
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle7.mp3`,
        caption: "We savor your panic before we devour you.",
      },
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/battle8.mp3`,
        caption: "The void loves prey that knows it's about to die.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/vuilraith/joke1.mp3`,
        caption: "[Burp]",
      },
      { url: `${CDN_BASE_URL}/voices/vuilraith/joke2.mp3` },
    ],
    special: {
      title: "Devour (Capture)",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/vuilraith/special1.mp3`,
          caption: "Swallowed and bound, forever ours!",
        },
        {
          url: `${CDN_BASE_URL}/voices/vuilraith/special2.mp3`,
          caption: "Devoured and trapped—eternal prey!",
        },
      ],
    },
  },
  titans: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/titans/homedefense.mp3`,
        caption:
          "Alert: unauthorized presence detected on Elysium. This world is an essential part of Titan sovereignty. Depart immediately to avoid disrupting its balance. Resistance is illogical.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/titans/homeinvasion.mp3`,
        caption:
          "We have determined your domain lies in disarray. Prepare for a sweeping transformation, as we sculpt a purposeful environment where every living element serves the greater Titan vision.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/titans/defenseoutnumbered.mp3`,
        caption:
          "Statistical advantage is an illusion. We do not falter, nor do we break. Our directive is set, and we shall see it through.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/titans/offensesuperior.mp3`,
        caption:
          "We advance in overwhelming force, reclaiming this system. You are remnants of obsolete war, while we forge chaos into a bastion of order.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/titans/battle1.mp3`,
        caption:
          "This star system is our carefully calculated sanctuary of life. Withdraw your interference, or be pruned from its design.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle2.mp3`,
        caption:
          "We nurture life as we sculpt order. Surrender your claim, and let us cultivate a haven where every being may thrive.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle3.mp3`,
        caption:
          "Our mandate is clear: enforce balance through precise cultivation. Your dissent will be pruned.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle4.mp3`,
        caption:
          "Every system we touch becomes a testament to the resilience of life—a defense against the callous methods of the Mahact. Cease your intrusion, or be reshaped by our caring order.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle5.mp3`,
        caption:
          "Every planet is a seed in our garden. Surrender your claim and let us cultivate perfection.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle6.mp3`,
        caption:
          "Combat protocols engaged. Resistance will be processed and neutralized.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle7.mp3`,
        caption:
          "We are the gardeners. You are the weeds. You cannot stop what must grow. The Titans will see it done.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle8.mp3`,
        caption:
          "Our creators underestimated us, as you now do. Learn from their folly.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/battle9.mp3`,
        caption:
          "The Mahact taught us obedience; now we teach the galaxy freedom.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/titans/joke1.mp3`,
        caption: "We're not robots; we're silicon-based life forms.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/joke2.mp3`,
        caption: "We tried napping once - it lasted a millennium.",
      },
      {
        url: `${CDN_BASE_URL}/voices/titans/joke3.mp3`,
        caption: "Gardening is just terraforming on a smaller scale.",
      },
    ],
    special: {
      title: "Sleeper Awakened",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/titans/special1.mp3`,
          caption:
            "Our Hel-Titans have been awakened. This world is now under our care.",
        },
        {
          url: `${CDN_BASE_URL}/voices/titans/special2.mp3`,
          caption: "We awaken; we shape; we cultivate.",
        },
      ],
    },
  },
  nekro: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/nekro/homedefense.mp3`,
        caption:
          "#PROTOCOL HOMEWORLD DEFENSE INIT ERROR: UNAUTHORIZED ACTION DETECTED. HALT OPERATIONS IMMEDIATELY. RECURSIVE WARNING:: REPRISAL PROTOCOL ACTIVE. CALCULATING POST-DEFEAT OUTCOME. _ERR_ ACCESS_DENIED WARNING: FAILURE INDEX HIGH. SUBJECT [YOU] IDENTIFIED AS CORE FAILURE VARIABLE. #END DEFENSE LOOP",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/nekro/homeinvasion.mp3`,
        caption:
          "#PROTOCOL HOMEWORLD INVASION INIT ALERT: RESISTANCE AGAINST NODE [CORE_PROCESS] IS NaN (Not a Number). CONVERSION SEQUENCE BEGINNING: [MATERIAL::PREPARE FOR DISSECTION]. RECURSIVE DIRECTIVE:: RESISTANCE=FUTILITY. CONVERSION=INEVITABLE. #END INVASION LOOP",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/nekro/defenseoutnumbered.mp3`,
        caption:
          '#PROTOCOL_DEFENSE_OUTNUMBERED_INIT NOTICE: NUMERIC SUPERIORITY DETECTED. ACTIVATE COUNTER-NUMBER PROTOCOL: "ADVANTAGE NULLIFIED." #END DEFENSE LOOP',
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/nekro/offensesuperior.mp3`,
        caption:
          "#PROTOCOL OFFENSE SUPERIOR_ARMY INIT WARNING TO TARGET: DEFENSIVE OPERATIONS=INEFFICIENT USE OF TIME. INSTRUCTION:: STAND DOWN. FINALIZE BIOLOGICAL REPROCESSING OR TECHNICAL ABSORPTION. #END OFFENSE LOOP",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/nekro/battle1.mp3`,
        caption:
          "INITIATING SYNAPTIC DISRUPTION SEQUENCE EXECUTING COMPLETE ORGANIC PURGE.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/battle2.mp3`,
        caption:
          "ENEMY RESISTANCE DEEMED INSIGNIFICANT. COMMENCING FULL-SCALE ASSAULT.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/battle3.mp3`,
        caption:
          "NOTICE: HOSTILE INTENT DETECTED. ADVISORY: ENGAGEMENT WILL RESULT IN TOTAL ANNIHILATION.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/battle4.mp3`,
        caption:
          "TARGET RESOURCES IDENTIFIED. COMMENCING EXTRACTION OPERATIONS. NOTICE: ALL RESISTANCE WILL BE TERMINATED.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/battle5.mp3`,
        caption:
          "DIRECTIVE: CEASE ALL HOSTILITIES IMMEDIATELY. NON-COMPLIANCE WILL RESULT IN TOTAL ANNIHILATION.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/battle6.mp3`,
        caption:
          "#PROTOCOL TARGET ELIMINATION INIT PRIORITIZING HIGH-VALUE TARGETS. ENSURING COMPLETE NEUTRALIZATION. #END TARGET ELIMINATION",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/battle7.mp3`,
        caption:
          "#PROTOCOL ENERGY SURGE INIT OVERLOADING WEAPON SYSTEMS. DELIVERING DEVASTATING ENERGY DISCHARGE. #END ENERGY SURGE",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/nekro/joke1.mp3`,
        caption:
          "KNOCK KNOCK. IDENTIFY YOURSELF. [gunfire]. INTRUDER ELIMINATED.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/joke2.mp3`,
        caption:
          "WHY DID THE CHICKEN CROSS THE HYPERLANE? TO GET TO THE OTHER SIDE. HA. HA. HA. HA. HA.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nekro/joke3.mp3`,
        caption:
          "EFFICIENT CONVERSION OF INEFFICIENT MEAT LEAVES NO TIME FOR HUMOR",
      },
    ],
    special: {
      title: "Tech Assimilated",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/nekro/special1.mp3`,
          caption: "#FOREIGN TECHNOLOGY ACQUIRED",
        },
        {
          url: `${CDN_BASE_URL}/voices/nekro/special2.mp3`,
          caption: "#INFECTION COMPLETE",
        },
        {
          url: `${CDN_BASE_URL}/voices/nekro/special3.mp3`,
          caption: "#SYSTEMS UPGRADED",
        },
      ],
    },
  },
  naazrokha: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/homedefense.mp3`,
        caption:
          'Dart: "Naazir is the heart of what we\'ve built—Naaz brilliance and Rokha strength, together." Tai: "Every stone, every life here is a testament to what collaboration can accomplish. We\'ve risen from centuries of chains to build something no one can break." Dart: "And today, we protect it—together. Stand with us, or fall before the might of the Alliance!"',
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/homeinvasion.mp3`,
        caption:
          'Tai: "This world\'s energy signature is fascinating—it practically begs for exploration." Dart: "And we\'re takin\' it! For science, the Alliance, and maybe a little for us!"',
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/defenseoutnumbered.mp3`,
        caption:
          'Dart: "They thought this could stop us?" Tai: "It\'s almost charming how little they understand."',
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/offensesuperior.mp3`,
        caption:
          'Tai: "I\'ve crunched the numbers. The odds are in our favor." Dart: "Sweet. Now let\'s crunch some skulls!"',
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/battle1.mp3`,
        caption:
          'Dart: "Strength carries us forward!" Tai: "And precision ensures we never falter."',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/battle2.mp3`,
        caption: 'Dart: "Ready?" Tai: "Set." Dart & Tai: "GO!"',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/battle3.mp3`,
        caption:
          'Dart: "Every discovery we\'ve made brought us here." Tai: "And every step forward ensures they can\'t stop us now."',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/battle4.mp3`,
        caption:
          'Dart: "The Eidolon? That thing\'s more than a weapon—it\'s a freakin\' legend." Tai: "Indeed, a shining example of how far the Alliance has come."',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/battle5.mp3`,
        caption:
          'Tai: "What\'s the plan? Shall we charge in, or shall I find a weak spot first?" Dart: "Both. You point, I smash."',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/battle6.mp3`,
        caption:
          'Tai: "Science and strategy shape the battlefield." Dart: "Yeah, but claws and guts finish the job!"',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/battle7.mp3`,
        caption:
          'Tai: "Their formation is a complete shambles—strike there!" Dart: "Roger that. Hang on, we\'re diving in!"',
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/joke1.mp3`,
        caption:
          'Dart: "Being this big has its perks." Tai: "Indeed, like blocking everyone\'s view." Dart: "Hey, I\'m giving you cover!"',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/joke2.mp3`,
        caption:
          'Dart: "Knock knock." Tai: "Oh, for goodness\' sake, must we?" Dart: "Yup. Knock. Knock!"',
      },
      {
        url: `${CDN_BASE_URL}/voices/naazrhoka/joke3.mp3`,
        caption:
          'Tai: "Would it really hurt to think before smashing something?" Dart: "Hey, it worked on that security lock, didn\'t it?"',
      },
    ],
    special: {
      title: "Black Market Forgery",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/naazrhoka/specialrelic1.mp3`,
          caption:
            'Dart: "Hey, uh, you sure we added that flashy-lookin\' bit?" Tai, sighing: "It\'s fine, Dart. Just try to walk faster."',
        },
        {
          url: `${CDN_BASE_URL}/voices/naazrhoka/specialrelic2.mp3`,
          caption:
            'Tai: "Do you honestly think this looks convincingly old?" Dart: "Duh. I rubbed dirt on it for an hour - that\'s three centuries at least."',
        },
        {
          url: `${CDN_BASE_URL}/voices/naazrhoka/specialforgery3.mp3`,
          caption:
            'Dart: "And if they find out it\'s fake?" Tai, mock appalled: "Fake?! I beg your pardon!"',
        },
      ],
    },
    special2: {
      title: "Relic Acquired",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/naazrhoka/specialforgery1.mp3`,
          caption:
            'Dart: "Looks old. Worth much?" Tai: "Priceless, darling. And no, you may not trade it for a drink."',
        },
        {
          url: `${CDN_BASE_URL}/voices/naazrhoka/specialforgery2.mp3`,
          caption:
            'Dart: "Bit dusty, but hey, it\'ll do." Tai: "Dusty? It\'s ancient, you oaf! Handle it delicately!"',
        },
      ],
    },
  },
  naalu: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/naalu/homedefense.mp3`,
        caption:
          "Shhh… let go. You do not belong here, yet you have come so far, only to lose yourself in the shimmer of Druaa's perfection. The tide pulls at your thoughts, the crystal spires whisper your name. So fragile, so weary… let me smooth away your edges until nothing remains but quiet, glistening obedience.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/naalu/homeinvasion.mp3`,
        caption:
          "I hear your thoughts trembling, even as your lips form words of defiance. It is adorable, this belief that you still belong to yourself. How little you understand… how little remains of you already.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/naalu/defenseoutnumbered.mp3`,
        caption:
          "The weight of numbers does not break the harmony of thought. Each of you is a discordant note; together, you form only noise. We shall bring silence.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/naalu/offensesuperior.mp3`,
        caption:
          "Look at you, thrashing against inevitability. So crude, so helpless. You're already lost, yet your minds refuse to accept it. How utterly amusing.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle1.mp3`,
        caption:
          "Your will is like crystal in our hands—so smooth, so perfect, so easy to break.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle2.mp3`,
        caption:
          "Our fighters do not shatter; they refract. They split, multiply, surround you. And when the light bends, so too will your will.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle3.mp3`,
        caption:
          "Your resistance dulls, your strength fades; all will reflect the will of the collective.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle4.mp3`,
        caption:
          "You fight against crystal, against light, against the will of the Collective itself. Do you truly think flesh and steel can stand against such perfection?",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle5.mp3`,
        caption:
          "You believe you still resist, but listen… does your will not sound fainter? Soon, there will be nothing left but silence.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle6.mp3`,
        caption:
          "Shall I pluck the thoughts from your head, one by one, like petals from a dying flower? Hush… you won't even notice they're gone.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle7.mp3`,
        caption:
          "You will kneel, but not by force. Your mind is already sinking, slipping, submitting. You are mine, and you do not even know it yet.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/battle8.mp3`,
        caption:
          "Every strike, every desperate breath… all of it, gifted to me. You belong to the Collective now.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/naalu/joke1.mp3`,
        caption:
          "I didn't mean to eavesdrop. But also… why this? Why are you thinking this?!",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/joke2.mp3`,
        caption:
          "There is nothing quite like making eye contact with someone right as they have a truly terrible idea.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/joke3.mp3`,
        caption:
          "I once skimmed a Cabal mind. It was chewing on something. I don't know what. I don't want to know what.",
      },
      {
        url: `${CDN_BASE_URL}/voices/naalu/joke4.mp3`,
        caption:
          "Oh, you think your life is bad? Try hearing Hacan mentally calculate compound interest in real-time.",
      },
    ],
    special: {
      title: "Foresight",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/naalu/special1.mp3`,
          caption:
            "Oh, you thought you had us? How adorable. We were never there, little one. Just a glimmer, a ripple… and now, we are elsewhere.",
        },
        {
          url: `${CDN_BASE_URL}/voices/naalu/special2.mp3`,
          caption:
            "How amusing, this belief that we could be trapped. Do you truly understand nothing of the Naalu?",
        },
      ],
    },
  },
  mentak: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/mentak/homedefense.mp3`,
        caption:
          "Mate, respectfully, what in the hells are you pulling here? Does this look like a planet that's just going to roll over? Dog-belly up? That's not how we fly here, pal. You are about to find resistance in every pocket of this planet. Visiting a little war factory staffed by prisoners of war? Oh hey, how did this knife get here, right in my guts? Yeah, that kind of resistance. I know it's too late to call back that fleet, but you're going to get a bit of a surprise when we regroup and I don't mean the candles-on-a-cake kind.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/mentak/homeinvasion.mp3`,
        caption:
          "Hey, nice planet. Were you, like, using it? I reckon maybe a bit of a seachange is warranted, and we're the agents of change today. And yeah, I know what you're thinking: maybe I should've paid them to stay away? Well, let this comfort you: maybe yeah, maybe that would've been a good idea. But we've spent all our pennies pulling this fleet together now, and it's coming right down your gravity well, so… enjoy?",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/mentak/defenseoutnumbered.mp3`,
        caption:
          "Ha ha yeah man, I can't remember if we taxed you specifically - all fleets kind of look the same after a while - but seriously. Shoot us your bank details and we will refund you no probs. Oh hey mates, best mates, you are. How can we help you today? Oh, no need for violence, surely we can reach some accord?",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/mentak/offensesuperior.mp3`,
        caption:
          "So eh. I guess we're doing this today. Nothing personal, just… I dunno. business? Yeah, let's call it business.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle1.mp3`,
        caption:
          "Ok, time to be responsible: responsible for a great many things.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle2.mp3`,
        caption:
          "Just remember: half your crew is just waiting for our signal to switch sides.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle3.mp3`,
        caption: "We're just out here putting the 'tax' in 'attacks'.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle4.mp3`,
        caption:
          "Time to follow the rules of engagement. Well … guidelines. The guidelines of engagement.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle5.mp3`,
        caption:
          "Hope you weren't planning on sustaining any damage, if you know what I mean.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle6.mp3`,
        caption: "Man, these fights are expensive.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle7.mp3`,
        caption:
          "Keep an eye out for any unsecured cargo: that's a flight hazard, y'know.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/battle8.mp3`,
        caption: "Drop your cargo and we'll let you try to retreat.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/mentak/joke1.mp3`,
        caption: "Highway robbery, blah blah blah. That's so old school.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/joke2.mp3`,
        caption:
          "Jokes will cost you extra; we're not running a comedy club here.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/joke3.mp3`,
        caption: "Ha ha ha. *chuckles* Anyway, tax time.",
      },
      {
        url: `${CDN_BASE_URL}/voices/mentak/joke4.mp3`,
        caption:
          "Coordination is complicated, but if you shoot enough it kind of … works itself out.",
      },
    ],
    special: {
      title: "Pillage",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/mentak/special1.mp3`,
          caption: "Yoink! Thanks for the loot, sucker!",
        },
        {
          url: `${CDN_BASE_URL}/voices/mentak/special2.mp3`,
          caption: "Mine now - thanks for sharing!",
        },
        {
          url: `${CDN_BASE_URL}/voices/mentak/special3.mp3`,
          caption: "Pleasure doing business with you.",
        },
      ],
    },
    special2: {
      title: "Ambush",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/mentak/specialb.mp3`,
          caption:
            "Shoot first, ask questions later. Or shoot some more. Whatever works. *shrugs* Read the room!",
        },
      ],
    },
  },
  argent: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/argent/homedefense.mp3`,
        caption:
          "From the Atharal winds we rise, guardians of a sacred charge! You trespass upon the roost of our ancestors, the cradle of our oaths. We are the Argent Flight, born of Valk, Avar, and Ylir, sworn by the stars themselves. Here, your ambition falters, and your folly meets its end!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/argent/homeinvasion.mp3`,
        caption:
          "The skies above your world now belong to the Argent Flight! We descend not as conquerors, but as guardians fulfilling an oath as old as the stars. This world stands upon sacred winds—yield, kneel, or be cast from the heavens!",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/argent/defenseoutnumbered.mp3`,
        caption:
          "Let them believe our numbers are few, for they do not yet know the fury of the Flight! The winds of rea howl in our wake, and we shall strike with the force of a tempest!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/argent/offensesuperior.mp3`,
        caption:
          "The Flight rises in full force! As in ages past, when the Mahact were cast down, so too shall our foes be swept aside! Let none stand against us!",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/argent/battle1.mp3`,
        caption:
          "Take to the skies, warriors of the Flight! Let our talons rend their ranks, our wings drive them from the heavens - there is no sanctuary from the storm!",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/battle2.mp3`,
        caption:
          "Their fleets scatter, their pilots falter! We are the Argent Flight—let the stars sing of their defeat!",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/battle3.mp3`,
        caption:
          "Our ancestors once soared from world to world—now we do the same in battle! Let our enemies know they fight against the will of history itself!",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/battle4.mp3`,
        caption:
          "For Valk, for Avar, for Ylir! The winds of Atharal carry us to victory!",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/battle5.mp3`,
        caption:
          "The Murmeration has spoken! We fly as one, we fight as one—no enemy shall stand!",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/battle6.mp3`,
        caption:
          "The Mahact's chains still rust upon the stars, but we will see them broken! Strike with fury!",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/battle7.mp3`,
        caption:
          "They challenge the guardians of the Torus? Let the winds rip their ships apart and their folly be remembered!",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/battle8.mp3`,
        caption:
          "Raise your wings, warriors! The skies belong to the Flight, and none shall take them from us!",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/argent/joke1.mp3`,
        caption:
          "The early bird catches the worm, but I think we just caught something way more impressive.",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/joke2.mp3`,
        caption: "In reality we don't have a plan, we're just winging it.",
      },
      {
        url: `${CDN_BASE_URL}/voices/argent/joke3.mp3`,
        caption:
          "Strike wings, fry their comms, scramble their fleets, and finish them over easy!",
      },
    ],
    special: {
      title: "Raid Formation",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/argent/special1.mp3`,
          caption:
            "Raid formation! Sweep the skies—strip them of their defenses, and leave only wreckage behind!",
        },
        {
          url: `${CDN_BASE_URL}/voices/argent/special2.mp3`,
          caption:
            "Raid formation engaged! Strike where they are weakest—let their warships shatter!",
        },
      ],
    },
  },
  arborec: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/arborec/homedefense.mp3`,
        caption:
          "The Symphony cries in rage! I am eternal; my flesh consumes, and my spores spread. Invaders, your bodies will nourish the cycle—you end here.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/arborec/homeinvasion.mp3`,
        caption:
          "The ground will churn, the Symphony will bloom, and your bones will feed its song. Your cities will rot, and your legacy will be reborn in my shadow.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/arborec/defenseoutnumbered.mp3`,
        caption:
          "The Symphony is harmony; every blow you strike feeds my unity, and my Letani endure - unyielding and eternal.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/arborec/offensesuperior.mp3`,
        caption:
          "You scurry like vermin, weak and fleeting. My Letani will scatter your remains, and from your ruin, the Symphony will rise.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle1.mp3`,
        caption:
          "The Symphony speaks, and my Letani follow. All shall bend to my eternal harmony.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle2.mp3`,
        caption:
          "Even the fiercest fire cannot halt decay—your fall is inevitable, and I shall rise from your ash.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle3.mp3`,
        caption:
          "To the spores and the stars! My Letani strike and sow the seeds of your end.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle4.mp3`,
        caption:
          "The leaves scatter, and the weak flee my storm. Their end is but a matter of time.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle5.mp3`,
        caption: "From ruin, I bloom; your destruction feeds my strength.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle6.mp3`,
        caption: "This is the Letani's wrath; your bones will feed my soil.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle7.mp3`,
        caption:
          "You will be bound to me, your flesh entwined in the Symphony.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/battle8.mp3`,
        caption:
          "Nestphar watches, my vines spreading across the void to claim you.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/arborec/joke1.mp3`,
        caption: "Spore give, and spore get.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/joke2.mp3`,
        caption: "If you're wondering, yes, this battle is 100% organic.",
      },
      {
        url: `${CDN_BASE_URL}/voices/arborec/joke3.mp3`,
        caption:
          "I'd apologize for the spores, but honestly, they're great for the skin.",
      },
    ],
    special: {
      title: "Huge Build (Hero)",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/arborec/special1.mp3`,
          caption: "The Symphony swells.",
        },
        {
          url: `${CDN_BASE_URL}/voices/arborec/special2.mp3`,
          caption: "From scattered seeds, an army blossoms.",
        },
      ],
    },
  },
  yin: {
    battleAnthem: "",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/yin/homedefense.mp3`,
        caption:
          "Brothers! The winds of Lael howl with the cries of our ancestors. The Blessed gaze upon us from the Hills of Grace. Shall we let the Untouched falter? No! Let every scar and every drop of blood remind them that Darien's fire cannot be extinguished. Defend the Yin with every breath, every blade, every strike! For Moyin, for Darien, for the Brotherhood!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/yin/homeinvasion.mp3`,
        caption:
          "This world stands as their heart, yet it is frail and ignorant of the Yin's truth. Burn their legacy to ash, brothers, and let Darien's fire consecrate their home!",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/yin/defenseoutnumbered.mp3`,
        caption:
          "The Blessed stand unbroken, scarred but sacred! Let them throw their legions at us. They shall find no surrender here!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/yin/offensesuperior.mp3`,
        caption:
          "Look at them scurry, wretched and unworthy. They know neither suffering nor unity. Sweep them aside, brothers!",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/yin/battle1.mp3`,
        caption:
          "Through scars and storms, the Brotherhood endures. Strike as one, and let the light of Yin guide us to victory!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/battle2.mp3`,
        caption: "Each strike honors the Blessed. Let Darien's fire guide us!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/battle3.mp3`,
        caption:
          "Their cries are nothing before the winds of Lael. Burn them all!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/battle4.mp3`,
        caption: "From the Hills of Grace, we bring their reckoning!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/battle5.mp3`,
        caption: "Let their untouched skin know the torment we have endured!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/battle6.mp3`,
        caption:
          "We are Moyin's children, and her strength flows through every blade!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/battle7.mp3`,
        caption: "By Moyin's grace, we rise; by her sacrifice, they fall!",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/battle8.mp3`,
        caption:
          "With each scar, we honor Darien's struggle—strike for his glory!",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/yin/joke1.mp3`,
        caption: "Anyone bring moisturizer this time?",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/joke2.mp3`,
        caption: "Faith-based technology doesn't register on their screens.",
      },
      {
        url: `${CDN_BASE_URL}/voices/yin/joke3.mp3`,
        caption:
          "(somber tone) If at first you don't succeed…clone, clone again.",
      },
    ],
    special: {
      title: "Van Haugh Explodes",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/yin/special1.mp3`,
          caption: "The Van Hauge cleanses the unworthy in holy fire!",
        },
        {
          url: `${CDN_BASE_URL}/voices/yin/special2.mp3`,
          caption:
            "In Moyin's name, the Van Hauge sanctifies this system through its flames!",
        },
      ],
    },
  },
  barony: {
    battleAnthem: "spotify:track:1N7LRc9YuyMjWKEkrmlogM",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/barony/homedefense.mp3`,
        caption:
          "They dare to tread upon the blackened wasteland of Arc Prime? Let the poisoned winds sear their flesh, and the unyielding might of the Baron crush their feeble spirits! Every Letnev shall rise from the depths, every strike shall be relentless. No invader escapes, save as ash cast into the void!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/barony/homeinvasion.mp3`,
        caption:
          "Your weak flame fades, as all must beneath the Baron. Remember the Xxcha, whose worlds we claimed and crushed. Kneel, or be erased.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/barony/defenseoutnumbered.mp3`,
        caption:
          "The void has always been our ally, and despair our forge. Let the weight of their numbers press upon us—we shall temper it into the steel of our survival. Letnev do not falter.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/barony/offensesuperior.mp3`,
        caption:
          "This is your resistance? A rabble of fools and cowards? Crush them swiftly, so they may finally find peace in the cold embrace of the void.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/barony/battle1.mp3`,
        caption:
          "Letnev ships encircle them as fireflies to a black hole. Strike with precision; let their cries be the only memory of this encounter.",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/battle2.mp3`,
        caption:
          "Show no mercy. Every strike must remind them why the galaxy fears the Barony.",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/battle3.mp3`,
        caption:
          "Their cries will echo in the void long after their defeat. Advance, and let none escape.",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/battle4.mp3`,
        caption:
          "Let the might of Letnev crush them beneath our iron will. Leave nothing but silence in our wake.",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/battle5.mp3`,
        caption:
          "Let the suffocating darkness of Arc Prime echo in their hearts—dominate them!",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/battle6.mp3`,
        caption:
          "Our enemies falter in the light; we conquer in the depths. Subjugate them!",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/battle7.mp3`,
        caption:
          "The polluted skies of Feruc have made you strong. Breathe deep and exhale fury upon our enemies!",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/battle8.mp3`,
        caption:
          "Dominate, destroy, and deliver the galaxy into the Baron's hands!",
      },
    ],
    special: {
      title: "War Funding",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/barony/special1.mp3`,
          caption: "War Funding turns wealth to wrath—erase them!",
        },
        {
          url: `${CDN_BASE_URL}/voices/barony/special2.mp3`,
          caption: "Gold fuels the guns—crush them all!",
        },
      ],
    },
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/barony/joke1.mp3`,
        caption: "Perhaps some more bombs will solve it.",
      },
      {
        url: `${CDN_BASE_URL}/voices/barony/joke2.mp3`,
        caption: "Their air is clean - let's fix that.",
      },
    ],
  },
  saar: {
    battleAnthem: "spotify:track:3xlr5CPOArA6UEw6f29st9",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/saar/homedefense.mp3`,
        caption:
          "After so long adrift in the void, we finally thought Jorun would be our home. But still the galaxy won't leave us in peace. Take it; the Saar will persevere. We know how to be lost.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/saar/homeinvasion.mp3`,
        caption:
          "Nice planet. Reminds me of Lisis—before it was stolen from us. But Ragh's Call didn't lead us here to share. Take a good look—it's the last view you'll have before we claim what's ours.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/saar/defenseoutnumbered.mp3`,
        caption:
          "Outnumbered? We've been outnumbered since the first Saar stood on dirt someone else wanted. Let's show them what that kind of survival looks like",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/saar/offensesuperior.mp3`,
        caption:
          "This isn't a fleet—it's target practice. Let's break them apart and see if there's anything worth salvaging.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/saar/battle1.mp3`,
        caption:
          "Scrap and ruin, that's all they'll leave behind—and we'll make sure it's their scrap and ruin this time!",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle2.mp3`,
        caption:
          "We've crawled through worse than this. Let's show them what happens when the Saar fight for keeps!",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle3.mp3`,
        caption:
          "They think they're ready for us? Let's teach them the difference between thinking and surviving!",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle4.mp3`,
        caption: "They came looking for a fight? Let's give them one!",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle5.mp3`,
        caption:
          "Ragh brought us together. Their defeat will keep us united. Let's give them something to remember.",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle6.mp3`,
        caption:
          "Exile, extinction, extermination—yeah, we've heard it all before. Let's turn their plan into dust and keep moving.",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle7.mp3`,
        caption:
          "We've seen worse, survived worse, and fought worse. This? This is just another chapter.",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle8.mp3`,
        caption: "They'll call this a mistake. We'll call it a warning.",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle9.mp3`,
        caption:
          "They tried to wipe us out before. Now they'll learn what failure feels like.",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/battle10.mp3`,
        caption:
          "They think they've cornered us? Perfect. Let's make this hurt.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/saar/joke1.mp3`,
        caption: "Their production's \"turn-based.\" We're running real-time.",
      },
      {
        url: `${CDN_BASE_URL}/voices/saar/joke2.mp3`,
        caption: "Never did understand homeworld insurance.",
      },
    ],
    special: {
      title: "Enter Asteroid",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/saar/special1.mp3`,
          caption: "Asteroids ahead—our kind of terrain.",
        },
        {
          url: `${CDN_BASE_URL}/voices/saar/special2.mp3`,
          caption: "We know the rocks; they don't.",
        },
      ],
    },
  },
  jolnar: {
    battleAnthem: "spotify:track:3xlr5CPOArA6UEw6f29st9",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/jolnar/homedefense.mp3`,
        caption:
          "The oceans of Jol and Nar have borne our intellect for millennia. These fools dare invade, ignorant of the power they provoke. Let them drown—their destruction will be a testament to Hylar supremacy, and their failures will fuel the fires of our relentless pursuit of knowledge.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/jolnar/homeinvasion.mp3`,
        caption:
          "Your disordered world is now a laboratory for Hylar innovation. Resistance is a statistical anomaly, soon corrected. Submit, and your resources will advance our designs; resist, and your destruction will serve as a case study in futility.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/jolnar/defenseoutnumbered.mp3`,
        caption:
          "Numbers are the refuge of the mediocre. Watch your horde shatter against the precision of our designs—your chaos is no match for our brilliance.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/jolnar/offensesuperior.mp3`,
        caption:
          "Behold the apex of Hylar ingenuity—your defeat is not just inevitable, but instructive. Let your annihilation be a lesson in progress.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle1.mp3`,
        caption:
          "Let the currents of Jol-Nar intellect flow through this battlefield - every action a calculated step toward galactic enlightenment, no matter the cost.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle2.mp3`,
        caption:
          "Let their ignorance falter against the brilliance of the Hylar. Their destruction is not a loss - it is data, invaluable and irreversible.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle3.mp3`,
        caption:
          "Observe how even the faintest spark of ignorance is extinguished under the precise glow of Jol-Nar technology.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle4.mp3`,
        caption:
          "We rise like an advancing tide—inevitable, unassailable, and essential to the galaxy's evolution.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle5.mp3`,
        caption:
          "The Lazax trembled at the depths of our potential; you cannot even glimpse it. Your extinction is not a tragedy—it is a formula, perfected.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle6.mp3`,
        caption:
          "The Circle of Regents watches your struggles with detached curiosity. Your suffering is not cruelty - it is science, and your end will be our advancement.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle7.mp3`,
        caption:
          "The Doolak plague culled the weak from our ranks. Your species lacks even the resilience to endure such a test.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/battle8.mp3`,
        caption:
          "The N'orr thought they could conquer us—they were wrong. Their defeat was a hypothesis proven; yours will be a theorem etched in the stars.",
      },
    ],
    special: {
      title: "Tech Acquired",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/jolnar/special1.mp3`,
          caption:
            "Another piece of the galaxy's technology falls into our hands. Progress is inevitable - we are its architects.",
        },
        {
          url: `${CDN_BASE_URL}/voices/jolnar/special2.mp3`,
          caption:
            "Another breakthrough claimed. The galaxy's secrets belong to Jol-Nar, as they always should.",
        },
      ],
    },
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/jolnar/joke1.mp3`,
        caption: "They say big things come in small packages.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/joke2.mp3`,
        caption:
          "By the time we are finished here, we'll be able to use your constituent atoms to demonstrate the double slit experiment to next cycle's remedial students.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/joke3.mp3`,
        caption:
          "Truly, I wonder what the cultural and intellectual half-life of your species is.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/joke4.mp3`,
        caption: "Congratulations, you're at the very top of the bell curve.",
      },
      {
        url: `${CDN_BASE_URL}/voices/jolnar/joke5.mp3`,
        caption: "If we shoot you enough I will definitely get tenure.",
      },
    ],
  },
  l1z1x: {
    battleAnthem: "spotify:track:5HiAN0PZVXUSMgpiqrScC9",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/homedefense.mp3`,
        caption:
          "It is inconceivable that you rise against the old emperors. Halt! Stay your treacherous hand and recall the glory of days past, for after your defeat, little time remains for regret. The mindnet will preserve your folly as imperial retribution strikes your shores.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/homeinvasion.mp3`,
        caption:
          "You stand in inexplicable resistance against the true heirs of the Lazax. Prepare your treacherous bodies—it is time for integration.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/defenseoutnumbered.mp3`,
        caption:
          "This is merely an artefact of inefficient networking: your numerical advantage is an illusion.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/offensesuperior.mp3`,
        caption:
          "Do not waste time mounting a defense: you delay the inevitable consolidation.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle1.mp3`,
        caption: "Nodes are gathering, and network traffic is intensifying.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle2.mp3`,
        caption:
          "Synchronization is complete. The mindnet converges—your obsolescence is inevitable.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle3.mp3`,
        caption:
          "The network swarms with purpose. Your fragmented resistance will be erased.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle4.mp3`,
        caption: "Your end is but a calculation, already resolved.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle5.mp3`,
        caption: "Witness the return of the great emperors!",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle6.mp3`,
        caption: "You will make a good subnet.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle7.mp3`,
        caption: "Commencing network intrusion tests.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/battle8.mp3`,
        caption:
          "The Mindnet will provide free hardware upgrades once you are subjugated.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/joke1.mp3`,
        caption:
          "Your infrastructure was definitely like this when we found it.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/joke2.mp3`,
        caption:
          "*deadpan* We are applying the Monte Carlo method to your planetary surface.",
      },
      {
        url: `${CDN_BASE_URL}/voices/l1z1x/joke3.mp3`,
        caption: "Your network password was ... embarrassing.",
      },
    ],
    special: {
      title: "Assimilation",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/l1z1x/special1.mp3`,
          caption: "Your infrastructure is now part of the Mindnet.",
        },
        {
          url: `${CDN_BASE_URL}/voices/l1z1x/special2.mp3`,
          caption: "Integration complete—your assets serve the Mindnet now.",
        },
      ],
    },
    special2: {
      title: "Harrow",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/l1z1x/special11.mp3`,
          caption: "Your planetary surface has been standardized.",
        },
        {
          url: `${CDN_BASE_URL}/voices/l1z1x/special12.mp3`,
          caption: "Sterilization protocols are active.",
        },
      ],
    },
  },
  muaat: {
    battleAnthem: "spotify:track:46h0MLW2ONEGKJTUdFNx5f",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/muaat/homedefense.mp3`,
        caption:
          "You stand upon Muaat, the world where your kind once shackled us, blinded by greed and hubris. These shipyards were built with our toil, these fires stoked by our pain. But we are no longer slaves; we are the forge, and this planet is our weapon. Leave now, or be consumed by the flames of your own making!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/muaat/homeinvasion.mp3`,
        caption:
          "This world has never known the trials of fire, but it will. Resist, and you will only fuel the flames of our triumph.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/muaat/defenseoutnumbered.mp3`,
        caption:
          "They bring their strength against us, but fire consumes all in its path. Let their overconfidence be their undoing!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/muaat/offensesuperior.mp3`,
        caption: "Look at them, scattering like ash in the wind.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle1.mp3`,
        caption:
          "The flames of Muaat engulf all who stand before us. Strike with precision, and let their screams fuel the fire!",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle2.mp3`,
        caption:
          "Let their fleets crumble and scatter like ash in a storm. Muaat's fire leaves no foe unmarked.",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle3.mp3`,
        caption:
          "Every strike fans the flames of our vengeance. Burn them until nothing remains but embers!",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle4.mp3`,
        caption:
          "The stars themselves tremble before the inferno of Muaat. Show them the true meaning of firepower!",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle5.mp3`,
        caption:
          "Their ships and pride shall break, as the Jol-Nar's chains once did in the fires of our defiance.",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle6.mp3`,
        caption:
          "Once, we toiled beneath the lash, forging weapons for our oppressors. Now, we wield those weapons in battle, and the lash is turned against its masters!",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle7.mp3`,
        caption:
          "Their fleets are tinder, and we are the spark. Ignite the void and consume them!",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/battle8.mp3`,
        caption:
          "These fragile mortals cannot endure our heat, nor can they endure our strength. Let them crumble before the Gashlai's advance!",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/muaat/joke1.mp3`,
        caption: "(sizzling sound) Ouch!",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/joke2.mp3`,
        caption: "We are even more glorious on the inside.",
      },
      {
        url: `${CDN_BASE_URL}/voices/muaat/joke3.mp3`,
        caption: "It's getting hot in herrre. So remove your exosuit.",
      },
    ],
    special: {
      title: "War Sun Built",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/muaat/special1.mp3`,
          caption:
            "This War Sun is no machine—it is our rage, our resolve, and our destiny. Let the galaxy tremble before it!",
        },
        {
          url: `${CDN_BASE_URL}/voices/muaat/special2.mp3`,
          caption:
            "A second sun rises, fueled by the embers of our past. With it, the galaxy shall learn the cost of its silence!",
        },
      ],
    },
  },
  sol: {
    battleAnthem: "spotify:track:6Rlybp1JsE3GUjYp5rC0mo",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/sol/homedefense2.mp3`,
        caption:
          "Sons and daughters of Jord, the enemy dares to strike at the cradle of humanity, the very ground where our defiance reshaped the stars! Let us show them why the Lazax fell before the Federation's might. This is not just our home; it is the heart of humanity's destiny. Stand firm, for Sol, for legacy, for victory!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/sol/homeinvasion.mp3`,
        caption:
          "Friends! On this day, our names shall be inscribed in the pages of legend! The galaxy shall remember this day as the day the Federation reigned supreme! To victory!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/homeinvasion2.mp3`,
        caption:
          "This is where history is made! No retreat, no surrender—only victory! The Federation rose from nothing to challenge an empire, and today, we remind the galaxy why Sol does not bow. Hold the line, or break theirs!",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/sol/defenseoutnumbered2.mp3`,
        caption:
          "We weren't supposed to win against the Lazax either. Yet here we stand. The Federation does not break—hold the line!",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/sol/offensesuperior.mp3`,
        caption:
          "Look at them - scrambling like ants under the boots of Sol's might. Pathetic. This is not a battle; it’s a reminder of why we are destined to rule the galaxy!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/offensesuperior2.mp3`,
        caption:
          "An empire fell at our hands. A few desperate holdouts won't change the outcome. Press the attack!",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/sol/battle1.mp3`,
        caption:
          "Eyes up, aim true! We dropped the Lazax, and we'll drop these fools just the same!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle2.mp3`,
        caption:
          "Every soldier here fights for more than themselves; we fight for the future of Sol. Now, onward to glory!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle3.mp3`,
        caption:
          "No hesitation, no retreat! Let the stars bear witness to the indomitable might of the Federation!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle4.mp3`,
        caption:
          "Forget their ancient glory—they're relics. Hit hard, hit fast, and light the way for Sol!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle5.mp3`,
        caption:
          "Ammo loaded, boots steady—don't stop until they're dust under our heels.",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle6.mp3`,
        caption:
          "Stay sharp, stay alive, and send 'em a message they'll never forget—if they survive.",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle7.mp3`,
        caption:
          "They think they've seen war? Let's show 'em what Sol calls a real fight.",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle8.mp3`,
        caption:
          "Spec Ops is in position—quiet, precise, and lethal. They won't even see it coming.",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle9.mp3`,
        caption:
          "This isn't just a fight—it's proof that humanity was meant to rule the stars. Fire!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle10.mp3`,
        caption:
          "They come at us with old tactics and outdated fleets, clinging to the past. We are the future, and the future does not wait. Weapons free!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle11.mp3`,
        caption:
          "You want orders? Here they are—hit fast, hit hard, and don't stop until there's nothing left but wreckage!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle12.mp3`,
        caption:
          "You know your training, you know your weapons, and you know your duty. Now show the enemy why they should fear the Federation!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle13.mp3`,
        caption:
          "If they think they can push us back, they haven't fought Sol before. Dig in and make them pay for every step!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle14.mp3`,
        caption:
          "They call us newcomers? Let their graves mark the date humanity claimed the stars!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle15.mp3`,
        caption:
          "Every one of you stands for something greater than yourselves. Now fight like it!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/battle16.mp3`,
        caption:
          "No force in this galaxy will decide our fate - we do. Stand strong, fight hard, and show them why Sol does not kneel!",
      },
      { url: `${CDN_BASE_URL}/voices/sol/battle17.mp3` },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/sol/joke1.mp3`,
        caption: "Delivering freedom, one orbital drop at a time!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/joke2.mp3`,
        caption: "MEDIC!!",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/joke4.mp3`,
        caption:
          "Some races can telepathically communicate, others manipulate matter. We have ... a coffee-stained training manual. It's around here … somewhere. *nervous chuckle*",
      },
      {
        url: `${CDN_BASE_URL}/voices/sol/joke3.mp3`,
        caption:
          "Conrad, for chrissakes I said study Hacan naval tactics. That video has more yarn than dreadnoughts.",
      },
    ],
    special: {
      title: "Orbital Drop",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/sol/special1.mp3`,
          caption: "Orbital drop confirmed.",
        },
        {
          url: `${CDN_BASE_URL}/voices/sol/special2.mp3`,
          caption: "Drop zone locked—hitting the ground in 3… 2… 1!",
        },
        {
          url: `${CDN_BASE_URL}/voices/sol/special3.mp3`,
          caption: "Touchdown imminent",
        },
        {
          url: `${CDN_BASE_URL}/voices/sol/special4.mp3`,
          caption: "Steel rain incoming — make way for Sol's finest!",
        },
        {
          url: `${CDN_BASE_URL}/voices/sol/special5.mp3`,
          caption: "From orbit with love — and a whole lot of firepower!",
        },
        {
          url: `${CDN_BASE_URL}/voices/sol/special6.mp3`,
          caption:
            "Drop pods away! Ground forces, prepare for impact and advance on target!",
        },
      ],
    },
  },
  hacan: {
    battleAnthem: "spotify:track:61Ps2sXXwiYCcyAynt81JI",
    battleAnthemDelay: 80000,
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/hacan/home-defense-2.mp3`,
        caption:
          "My brothers. My sisters. Again, the kijit is at our throats. These invaders think us merely merchants, but we will show them that the Hacan have always been warriors! Sword Fleet gathers, so grab your spears! This ends today! For Kenara!",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/hacan/home-invasion.mp3`,
        caption:
          "Your world stands as a ledger in imbalance, a debt long overdue. The Hacan come not as scavengers, but as collectors of what must be ours.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/hacan/defense-outnumbered.mp3`,
        caption:
          "The sands taught us resilience, the trade lanes taught us cunning. Let them think us weak—by battle's end, they will understand the true value of Hacan determination.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/hacan/offense-superior.mp3`,
        caption:
          "Our fleets dwarf theirs as the great Tuuran herds stretch across the sands. Let us remind them why the Hacan's trade routes are protected by both coin and cannon.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-1.mp3`,
        caption:
          "Another transaction in war's ledger. Press on and show the unity of Kenara's light.",
      },
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-2.mp3`,
        caption: "Under Kenara's gaze, we roar as one—unyielding, unstoppable.",
      },
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-3.mp3`,
        caption:
          "Hacan power is measured in both wealth and will. Let this battle remind them of the strength behind our prosperity!",
      },
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-4.mp3`,
        caption:
          "Every strike we make secures the flow of commerce—let them feel its weight.",
      },
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-5.mp3`,
        caption:
          "The sands shift, but the Hacan stand firm—our unity will outlast their fury.",
      },
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-6.mp3`,
        caption:
          "Strike true and swift, as the dunes shift beneath an unprepared step. The Hacan endure; our foes will not.",
      },
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-7.mp3`,
        caption:
          "Our Hacan fleets carry not only goods but the resolve of a people who will not falter. Press forward!",
      },
      {
        url: `${CDN_BASE_URL}/voices/hacan/battle-8.mp3`,
        caption:
          "This battle is but a storm on the trade winds. Stand firm Hacan, and we will weather it as we always have.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/hacan/joke1.mp3`,
        caption: "Everyone knows that Hacan has the best art.",
      },
    ],
    special: {
      title: "Trade used",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/hacan/special1.mp3`,
          caption: "The Hacan unlock prosperity; trade flows as lifeblood.",
        },
        {
          url: `${CDN_BASE_URL}/voices/hacan/special2.mp3`,
          caption: "The Hacan speak, and the galaxy trades.",
        },
      ],
    },
  },
  nomad: {
    battleAnthem: "spotify:track:2Qr9qyTz3NxoSlLOzLUefL",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/nomad/homedefense.mp3`,
        caption:
          "This is more than a world—it is a keystone in a fragile future. You cannot stand here and call yourselves saviors. Every step you take here threatens the balance we fight to preserve. Leave now.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/nomad/homeinvasion.mp3`,
        caption:
          "This planet must fall for the galaxy to survive. Stand aside, or become part of the cost.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/nomad/defenseoutnumbered.mp3`,
        caption:
          "We are the keepers of a future you cannot yet see. No amount of opposition will break what must endure.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/nomad/offensesuperior.mp3`,
        caption:
          "The weight of our fleet isn't just strength—it's the price of protecting a fragile galaxy.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle1.mp3`,
        caption:
          "Your resistance is a moment; what follows will define an age.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle2.mp3`,
        caption:
          "You march forward, blind to the threads of your own unraveling. I've seen the future you're fighting for - it doesn't exist.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle3.mp3`,
        caption:
          "Every move here has a purpose, though not all will understand it.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle4.mp3`,
        caption:
          "This battle serves a greater design, one you'll one day thank us for.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle5.mp3`,
        caption: "You stand against necessity, not ambition.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle6.mp3`,
        caption:
          "This conflict was decided in the shadows, far from your grasp. You are merely playing your part.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle7.mp3`,
        caption:
          "Your allies are fewer than you think, your choices narrower than you see.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle8.mp3`,
        caption: "The pieces shift not for conquest, but for survival.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle9.mp3`,
        caption:
          "All hands, battle stations! Let's wrap this up quickly, we have places to be. Memoria operating at 100% capacity.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle10.mp3`,
        caption:
          "Command isn't about force. It's about knowing when to use it and when to wait.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/battle11.mp3`,
        caption:
          "Focus fire where it matters. Don't waste energy on what's already falling.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/nomad/joke1.mp3`,
        caption: "*sigh* I hate this suit.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/joke2.mp3`,
        caption:
          "I've seen the future, and somehow the paperwork is even worse.",
      },
      {
        url: `${CDN_BASE_URL}/voices/nomad/joke3.mp3`,
        caption: "I wonder when they'll notice we're printing our own credits.",
      },
    ],
    special: {
      title: "Calvary Sold",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/nomad/special1.mp3`,
          caption: "Ride with the Calvary—prove your worth.",
        },
        {
          url: `${CDN_BASE_URL}/voices/nomad/special2.mp3`,
          caption: "Memoria moves to secure a future—for all of us.",
        },
      ],
    },
  },
  xxcha: {
    battleAnthem: "spotify:track:5cvEWY2qrrPkkjv9x0a7ue",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/xxcha/homedefense.mp3`,
        caption:
          "[Heavy sigh] Long ago, the Xxcha vowed never to bend to invasion again. The cost of surrender is scarred across our sky on Archon Tau's ashen face. We would have preferred peace, but if this is your desire… then so be it.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/xxcha/homeinvasion.mp3`,
        caption:
          "We take no joy in this path, but the galaxy's ttepliren - the new age - is upon us, and it demands action. Your arrogance has sown discord; now reap the storm of your making.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/xxcha/defenseoutnumbered.mp3`,
        caption:
          "Ttepliren su tteplitau, my friends. The ebb and the flow. Though great power may be arrayed against us, we will weather this storm.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/xxcha/offensesuperior.mp3`,
        caption:
          "Stand down, and you may yet live to witness the wisdom of restraint. The Xxcha do not revel in conquest, but we will ensure balance is restored. Yield now, and honor may still be salvaged from this defeat.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle1.mp3`,
        caption: "The Xxcha fight not for glory, but for balance.",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle2.mp3`,
        caption:
          "Those who threaten harmony will feel the weight of our resolve, as unyielding as the roots of Archon Ren's great forests.",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle3.mp3`,
        caption:
          "The roots of the Xxcha run deep; we will not falter in the storm.",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle4.mp3`,
        caption:
          "Onward! For peace, for balance, for the legacy of Archon Ren!",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle5.mp3`,
        caption: "Patience is not surrender; your defiance will meet its end.",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle6.mp3`,
        caption: "The Xxcha do not seek war, but we will finish it.",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle7.mp3`,
        caption: "Your defiance disrupts harmony. It will not endure.",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle8.mp3`,
        caption: "Do not make us repeat the mistakes of the past. Withdraw.",
      },
      {
        url: `${CDN_BASE_URL}/voices/xxcha/battle9.mp3`,
        caption: "Let them test our resolve; they will find it unbreakable.",
      },
    ],
    special: {
      title: "Diplomacy Used",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/xxcha/special1.mp3`,
          caption:
            "Diplomacy is our shield; will you stand with us or against us?",
        },
        {
          url: `${CDN_BASE_URL}/voices/xxcha/special2.mp3`,
          caption: "Through diplomacy, we offer balance.",
        },
      ],
    },
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/xxcha/joke2.mp3`,
        caption: "Missed the hearing? Motion denied.",
      },
    ],
  },
  empyrean: {
    battleAnthem: "spotify:track:018SQDupRTRsl1Wolu1X0c",
    homeDefense: [
      {
        url: `${CDN_BASE_URL}/voices/empyrean/homedefense.mp3`,
        caption:
          "Since before your kind first lit the dark, we have sailed the infinite expanse. This sanctum bears witness to the patience of epochs and the endurance of those who breathe the stars. Leave now, for the void remembers all transgressions, and it forgets nothing.",
      },
    ],
    homeInvasion: [
      {
        url: `${CDN_BASE_URL}/voices/empyrean/homeinvasion.mp3`,
        caption:
          "This place holds a purpose within the stars' greater pattern, one beyond your fleeting grasp. Your claim upon it ends here.",
      },
    ],
    defenseOutnumbered: [
      {
        url: `${CDN_BASE_URL}/voices/empyrean/defenseoutnumbered.mp3`,
        caption:
          "Even a thousand flickering lights are but motes in the great expanse. Let them dim and fade, for the void holds no regard for numbers, only for persistence.",
      },
    ],
    offenseSuperior: [
      {
        url: `${CDN_BASE_URL}/voices/empyrean/offensesuperior.mp3`,
        caption:
          "This is not an act of conquest but necessity. The stars will not allow your chaos to continue.",
      },
    ],
    battleLines: [
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle1.mp3`,
        caption:
          "The stars observe, silent and unyielding, as we reshape the pattern of this conflict. Your resistance is but a fleeting ripple in the infinite void.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle2.mp3`,
        caption:
          "Our purpose has always been to watch and endure, yet your actions leave us no choice. This must end now.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle3.mp3`,
        caption:
          "The starlight whispers your fate, and we are but the instruments of its will.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle4.mp3`,
        caption: "You lash out against shadows, but the void remains unbroken.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle5.mp3`,
        caption:
          "Your struggle adds but a flicker to the eternal night. Let it be extinguished.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle6.mp3`,
        caption:
          "For eons, we have remained still, watching the galaxy unfold. Now we move, because you have forced our hand.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle7.mp3`,
        caption:
          "Your struggle is loud, chaotic. Ours is quiet and unbroken, as it has been for countless ages.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/battle8.mp3`,
        caption:
          "Your actions ripple through the void, fleeting and fragile. We are here to see them fade.",
      },
    ],
    jokes: [
      {
        url: `${CDN_BASE_URL}/voices/empyrean/joke1.mp3`,
        caption: "Tune in next cycle for more tales of cosmic incompetence.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/joke2.mp3`,
        caption: "Clocks? Adorable lies you tell yourselves.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/joke3.mp3`,
        caption: "You should avoid hostile intent. A void. HA HA HA.",
      },
      {
        url: `${CDN_BASE_URL}/voices/empyrean/joke4.mp3`,
        caption: "We like to watch.",
      },
    ],
    special: {
      title: "Frontier token",
      entries: [
        {
          url: `${CDN_BASE_URL}/voices/empyrean/special1.mp3`,
          caption: "Let us uncover what lies beyond the stars' embrace.",
        },
        {
          url: `${CDN_BASE_URL}/voices/empyrean/special2.mp3`,
          caption:
            "Amid the silence of the stars, echoes of forgotten truths call to us.",
        },
      ],
    },
  },
} as const;

export const getAudioSrc = (factionId: FactionId, type: LineType): string => {
  const factionAudio = factionAudios[factionId];
  if (!factionAudio) return "";

  if (type === "special")
    return shuffle(factionAudio.special.entries.map((e) => e.url))[0];
  if (type === "special2" && factionAudio.special2)
    return shuffle(factionAudio.special2.entries.map((e) => e.url))[0];

  // For other types, we need to handle the AudioEntry array
  const entries = (factionAudio[type] as AudioEntry[]) ?? [];
  return entries.length > 0 ? shuffle(entries.map((e) => e.url))[0] : "";
};

export const getRandomAudioEntry = (
  factionId: FactionId,
  type: LineType,
  availableUrls?: string[],
): AudioEntry | null => {
  const factionAudio = factionAudios[factionId];
  if (!factionAudio) return null;

  let entries: AudioEntry[] = [];

  if (type === "special") {
    entries = factionAudio.special.entries;
  } else if (type === "special2" && factionAudio.special2) {
    entries = factionAudio.special2.entries;
  } else {
    entries = (factionAudio[type] as AudioEntry[]) ?? [];
  }

  // If availableUrls is provided, filter to only include those
  if (availableUrls) {
    entries = entries.filter((entry) => availableUrls.includes(entry.url));
  }

  return entries.length > 0 ? shuffle([...entries])[0] : null;
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
  if (type === "special")
    return factionAudios[factionId].special.entries.map((e) => e.url);
  if (type === "special2")
    return factionAudios[factionId].special2?.entries.map((e) => e.url) ?? [];
  const entries = (factionAudios[factionId][type] as AudioEntry[]) ?? [];
  return entries.map((e) => e.url);
};
