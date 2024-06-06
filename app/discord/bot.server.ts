import dotenv from "dotenv";
import { Client, Collection, Events, GatewayIntentBits } from "discord.js";
import startDraft from "./commands/startDraft";

const commands = [startDraft];

export async function startDiscordBot() {
  dotenv.config();
  const token = process.env.DISCORD_TOKEN;
  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      // GatewayIntentBits.GuildMessages,
      // GatewayIntentBits.MessageContent,
    ],
  });

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

  // dynamically register commands
  // const foldersPath = path.join(import.meta.dirname, "commands");
  // const commandFolders = fs.readdirSync(foldersPath);
  // for (const folder of commandFolders) {
  //   const commandsPath = path.join(foldersPath, folder);
  //   const commandFiles = fs
  //     .readdirSync(commandsPath)
  //     .filter((file) => file.endsWith(".js"));
  //   for (const file of commandFiles) {
  //     const filePath = path.join(commandsPath, file);
  //     const command = require(filePath);
  //     // Set a new item in the Collection with the key as the command name and the value as the exported module
  //     if ("data" in command && "execute" in command) {
  //       client.commands.set(command.data.name, command);
  //     } else {
  //       console.log(
  //         `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`,
  //       );
  //     }
  //   }
  // }

  // When the client is ready, run this code (only once).
  // The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
  // It makes some properties non-nullable.
  client.once(Events.ClientReady, (readyClient) => {
    console.log(`Ready! Logged in as ${readyClient.user.tag}`);
  });

  // Log in to Discord with your client's token
  client.login(token);
}
