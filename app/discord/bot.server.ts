import dotenv from "dotenv";
import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  TextChannel,
} from "discord.js";
import startDraft from "./commands/startDraft";
import { DiscordData, Draft, FactionId, Player } from "~/types";
import {
  getDiscordPickMessage,
  addDiscordPickMessage,
  deleteDiscordPickMessage,
} from "~/drizzle/discordMessages.server";
import { hydratePlayers } from "~/hooks/useHydratedDraft";
import { draftSelectionToMessage } from "~/utils/selections";

const commands = [startDraft];

declare global {
  var discordClient: Client;
}
export async function startDiscordBot() {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });
  dotenv.config();
  const token = process.env.DISCORD_TOKEN;
  client.commands = new Collection();
  commands.forEach((command) => {
    client.commands.set(command.data.name, command);
  });

  client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`,
      );
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  });

  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
    global.discordClient = readyClient;
  });

  // Log in to Discord with your client's token
  client.login(token);
}

export async function getChannel(guildId: string, channelId: string) {
  const cachedGuild = global.discordClient.guilds.cache.get(guildId);
  const guild =
    cachedGuild ?? (await global.discordClient.guilds.fetch(guildId));

  const cachedChannel = guild.channels.cache.get(channelId);
  return (cachedChannel ?? guild.channels.fetch(channelId)) as TextChannel;
}

export async function notifyPick(
  draftId: string,
  draftUrl: string,
  draft: Draft,
) {
  if (!draft.integrations.discord) return;
  if (draft.selections.length === draft.pickOrder.length) return;

  const {
    integrations: { discord },
    players,
    pickOrder,
    selections,
  } = draft;

  // edit summary message, if exists
  const summaryMessageId = await getDiscordPickMessage(draftId, 0);
  const summaryMessage = getDraftSummaryMessage(draft);
  const channel = await getChannel(discord.guildId, discord.channelId);

  if (summaryMessageId !== undefined) {
    await editMessage(draft, summaryMessageId, summaryMessage);
  } else {
    const sentMessage = await channel?.send(summaryMessage);
    await addDiscordPickMessage(draftId, 0, sentMessage.id);
  }

  // Show last pick. Remove the 'previous last pick' if there is one.
  const previousMessageId = await getDiscordPickMessage(draftId, 1);
  if (previousMessageId) {
    await deleteMessage(draft, previousMessageId);
    await deleteDiscordPickMessage(draftId, 1);
  }

  // Remove the previous 'it's your turn to draft' message if there is one.
  const previousNotifyMessageId = await getDiscordPickMessage(draftId, 2);
  if (previousNotifyMessageId) {
    await deleteMessage(draft, previousNotifyMessageId);
  }

  // Add the pick just made (if not the start of the draft)
  const previousPlayer = players[pickOrder[draft.selections.length - 1]];
  if (previousPlayer !== undefined) {
    const previousPlayerName = playerName(
      players[pickOrder[draft.selections.length - 1]],
      discord,
    );
    const previousPick = draft.selections[draft.selections.length - 1];

    const sentMessage = await channel?.send(
      draftSelectionToMessage(previousPlayerName, previousPick, draft),
    );
    await addDiscordPickMessage(draftId, 1, sentMessage.id);
  }

  // Prompt the next player to make a pick.
  const currentPlayer = players[pickOrder[selections.length]];
  const discordPlayer = discord.players.find(
    (p) => p.playerId === currentPlayer.id,
  );
  const discordMemberId =
    discordPlayer?.type === "identified" ? discordPlayer.memberId : undefined;

  const message = discordMemberId
    ? `It's your turn to draft, <@${discordMemberId}>! [Draft link](${global.env.baseUrl}/draft/${draftUrl})`
    : `It's your turn to draft, ${currentPlayer.name}! [Draft link](${global.env.baseUrl}/draft/${draftUrl})`;

  const sentMessage = await channel?.send(message);
  await addDiscordPickMessage(draftId, 2, sentMessage.id);
}

const playerName = (player: Player, discordData: DiscordData) => {
  const discordPlayer = discordData.players.find(
    (p) => p.playerId === player.id,
  );
  const discordMemberId =
    discordPlayer?.type === "identified" ? discordPlayer.memberId : undefined;

  return discordMemberId ? `<@${discordMemberId}>` : player.name;
};

export async function deleteMessage(draft: Draft, messageId: string) {
  if (!draft.integrations.discord) return;

  const discord = draft.integrations.discord;
  const channel = await getChannel(discord.guildId, discord.channelId);
  await channel.messages.delete(messageId);
}

export async function editMessage(
  draft: Draft,
  messageId: string,
  newContent: string,
) {
  if (!draft.integrations.discord) return;

  const discord = draft.integrations.discord;
  const channel = await getChannel(discord.guildId, discord.channelId);

  try {
    const message = await channel.messages.fetch(messageId);
    await message.edit(newContent);
    console.log(`Message ${messageId} successfully edited.`);
  } catch (error) {
    console.error(`Error editing message ${messageId}:`, error);
  }
}

function getDraftSummaryMessage(draft: Draft) {
  const hydratedPlayers = hydratePlayers(
    draft.players,
    draft.selections,
    draft.settings.draftSpeaker,
    draft.integrations.discord?.players,
  );

  const currentPick = draft.selections.length;
  const activePlayerId = draft.pickOrder[currentPick];
  const nextPlayerId = draft.pickOrder[currentPick + 1];

  const lines = hydratedPlayers.map((p, idx) => {
    const factionEmoji = p.faction
      ? factionEmojis[p.faction]
      : unpickedFactionEmoji;

    let sliceEmoji = unpickedSliceEmoji;
    if (p.sliceIdx !== undefined) {
      const sliceName = draft.slices[p.sliceIdx].name
        .replace("Slice ", "")
        .slice(0, 1);
      sliceEmoji = sliceEmojis[getAlphabetPosition(sliceName) - 1];
    }

    const positionEmoji =
      p.seatIdx !== undefined
        ? positionEmojis[p.seatIdx]
        : unpickedPositionEmoji;

    let playerName = p.name;
    if (p.id === activePlayerId) {
      playerName = `**__${playerName}   <- CURRENTLY DRAFTING__**`;
    } else if (p.id === nextPlayerId) {
      playerName = `*${playerName}   <- on deck*`;
    }

    const line = [
      `> ${draft.pickOrder.indexOf(p.id) + 1}.`,
      factionEmoji,
      sliceEmoji,
      positionEmoji,
      playerName,
    ]
      .filter((l) => l !== undefined)
      .join(" ");

    return line;
  });

  const draftOrder = draft.pickOrder.slice(0, draft.players.length);
  const orderedLines = draftOrder.map((id) => lines[id]);

  return ["# **__Draft Picks So Far__**:", ...orderedLines].join("\n");
}

export const unpickedSliceEmoji = "<:sliceUnpicked:1225188657703682250>";
export const sliceEmojis: Record<number, string> = {
  0: "<:sliceA:1223132315476037773>",
  1: "<:sliceB:1223132318311387146>",
  2: "<:sliceC:1223132319947423787>",
  3: "<:sliceD:1223132322245640314>",
  4: "<:sliceE:1223132324175151174>",
  5: "<:sliceF:1223132325932699689>",
  6: "<:sliceG:1223132327744634982>",
  7: "<:sliceH:1223132330000912434>",
  8: "<:sliceI:1223132332547117086>",
  9: "<:sliceJ:1227099602260463757>",
  10: "<:sliceK:1227099604244500604>",
  11: "<:sliceL:1227099605968097312>",
  12: "<:sliceM:1227099608774217788>",
  13: "<:sliceN:1227099610279837768>",
  14: "<:sliceO:1227099612645687368>",
  15: "<:sliceP:1227099614885314582>",
  16: "<:sliceQ:1227099616823218306>",
  17: "<:sliceR:1227099618718908489>",
  18: "<:sliceS:1227099621453463573>",
  19: "<:sliceT:1227099623915524126>",
  20: "<:sliceU:1227099625610023004>",
  21: "<:sliceV:1227099631691763742>",
  22: "<:sliceW:1227099633789042709>",
  23: "<:sliceX:1227099636628721685>",
  24: "<:sliceY:1227099638616559686>",
  25: "<:sliceZ:1227099640667701278>",
};

export const unpickedPositionEmoji = "<:positionUnpicked:1227093640313180160>";
export const positionEmojis: Record<number, string> = {
  0: "<:position1:1222754925105381416>",
  1: "<:position2:1222754926174666843>",
  2: "<:position3:1222754927294550076>",
  3: "<:position4:1222754928368422993>",
  4: "<:position5:1222754929219993601>",
  5: "<:position6:1222754930092146780>",
  6: "<:position7:1222754930922754099>",
  7: "<:position8:1222754932503875604>",
  8: "<:position9:1227093802963964025>",
  9: "<:position10:1227093804595544106>",
  10: "<:position11:1227093805963022398>",
  11: "<:position12:1227093807372308550>",
} as const;

export const unpickedFactionEmoji = "<:GoodDog:1068567308819255316>";
export const factionEmojis: Record<FactionId, string> = {
  // Base Game Factions
  arborec: "<:Arborec:1156670455856513175>",
  argent: "<:Argent:1156670457123192873>",
  vulraith: "<:Cabal:1156670460638015600>",
  empyrean: "<:Empyrean:1156670516623577268>",
  creuss: "<:Creuss:1156670489771651324>",
  hacan: "<:Hacan:1156670539688054794>",
  jolnar: "<:JolNar:1156670564342181908>",
  l1z1x: "<:L1Z1X:1156670567198507208>",
  barony: "<:Letnev:1156670569471803422>",
  yssaril: "<:Yssaril:1156670725495726150>",
  mahact: "<:Mahact:1156670571552190484>",
  mentak: "<:Mentak:1156670601851846757>",
  muaat: "<:Muaat:1156670603110129704>",
  naalu: "<:Naalu:1156670604393590784>",
  naazrokha: "<:Naaz:1156670606532677782>",
  nekro: "<:Nekro:1156670630700257310>",
  nomad: "<:Nomad:1156670632705130526>",
  saar: "<:Saar:1156670637226590228>",
  sardakk: "<:Sardakk:1156670656570740827>",
  sol: "<:Sol:1156670659804532736>",
  titans: "<:Titans:1156670697515532350>",
  winnu: "<:Winnu:1156670722039611524>",
  xxcha: "<:Xxcha:1156670723541180547>",
  yin: "<:Yin:1156670724438769754>",
  keleres: "<:Keleres:1156670565793398875>",

  // Discordant Stars Factions
  ilyxum: "<:augurs:1082705489722363904>",
  axis: "<:axis:1082705549092737044>",
  bentor: "<:bentor:1082705559897264199>",
  kyro: "<:blex:1082705569351204995>",
  celdauri: "<:celdauri:1082705576691253288>",
  cheiran: "<:cheiran:1082705584886915204>",
  cymiae: "<:cymiae:1082705596836487238>",
  dihmohn: "<:dihmohn:1082705607624233041>",
  edyn: "<:edyn:1082705616415502396>",
  florzen: "<:florzen:1082705625018024010>",
  freesystems: "<:freesystems:1082705633352089620>",
  ghemina: "<:ghemina:1082705641904279612>",
  ghoti: "<:ghoti:1082705649076543580>",
  gledge: "<:gledge:1082705658052366346>",
  khrask: "<:khrask:1082705665715359786>",
  kjalengard: "<:kjalengard:1082705673596448778>",
  kollecc: "<:kollecc:1082705681108447313>",
  kolume: "<:kolume:1082724367575814245>",
  kortali: "<:kortali:1082724379114340392>",
  lanefir: "<:lanefir:1082724385598742599>",
  lizho: "<:lizho:1082724396235497552>",
  mirveda: "<:mirveda:1082724403076411472>",
  mortheus: "<:mortheus:1082724410290610186>",
  myko: "<:mykomentori:1082724417412530197>",
  nivyn: "<:nivyn:1082724425851482282>",
  nokar: "<:nokar:1082724447162728558>",
  olradin: "<:olradin:1082724458189570238>",
  rohdina: "<:rohdhna:1082724463767998564>",
  tnelis: "<:tnelis:1082724470311112756>",
  vaden: "<:vaden:1082724476287975486>",
  vaylerian: "<:vaylerian:1082724483200196720>",
  veldyr: "<:veldyr:1082724490049491026>",
  rhodun: "<:zealots:1082724497083334827>",
  zelian: "<:zelian:1082724503190249547>",
  // TODO: Implement
  drahn: "",
} as const;

export function getAlphabetPosition(char: string): number {
  // Convert to lowercase to handle both cases
  const normalized = char.toLowerCase();
  // 'a' is charCode 97, so subtracting 96 gives position (1-26)
  return normalized.charCodeAt(0) - 96;
}
