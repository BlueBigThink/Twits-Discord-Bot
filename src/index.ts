// IMPORTS
import { readdirSync } from 'fs';
import 'module-alias/register';
import { join } from 'path';
import { Client, ActivityType, Collection } from 'discord.js';
import { discordToken } from '@keys';
import { handleError } from '@utils';

// CLIENT
// -> Read command folders
const commandFolders = readdirSync(join(__dirname, 'commands'));

// -> Read event folders
const eventFiles = readdirSync(join(__dirname, 'events')).filter((file) =>
  file.endsWith('.js'),
);

// -> Create client
const client = new Client({
  presence: {
    activities: [
      {
        name: 'over messages',
        type: ActivityType.Watching,
      },
    ],
  },
  intents: ['MessageContent', 'GuildMessages', 'Guilds'],
});

// -> Create commands collection
const commandsCollection: Collection<string, any> = new Collection();

// -> Read command files
for (const folder of commandFolders) {
  const commandFiles = readdirSync(
    join(__dirname, 'commands', folder),
  ).filter((file) => file.endsWith('.js'));

  const autocompleteFiles = readdirSync(
    join(__dirname, 'commands', folder),
  ).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(join(__dirname, 'commands', folder, file));
    commandsCollection.set(command.data.name, command);
  }
}

// MAIN
// -> Handle Events
for (const file of eventFiles) {
  const event = require(`./events/${file}`);

  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// -> Handle Commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (!commandsCollection.has(commandName)) return;

  try {
    await commandsCollection.get(commandName).execute(interaction);
  } catch (e) {
    handleError(e);
    await interaction.reply({
      content: "Oops! Command couldn't be executed for unknown reasons",
      ephemeral: true,
    });
  }
});

// LOGIN
try {
  client.login(discordToken);
  console.log('Bot Status: Online');
  console.log('startbot');
} catch (e) {
  handleError(e);
}
