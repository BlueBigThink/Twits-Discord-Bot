// IMPORTS
import { readdirSync } from 'fs';
import 'module-alias/register';
import { join } from 'path';
import { Client, ActivityType, Collection, User, Embed} from 'discord.js';
import { discordToken, stocktwitsApiKey } from '@keys';
import { handleError} from '@utils';
import {getMessageScreenshot, logToChannel} from '@utils';
import { Server } from 'http';
import { error } from 'console';
import { errorHandler } from '@sentry/node/types/handlers';
import { update } from 'lodash';


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

//client.on('messageCreate', logToChannel);
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
  console.log(interaction.id);
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

client.on('messageCreate', async(message)=>{
  //const user = User;
  //for(var i =0, i2 )
  //logToChannel(client,"dddd", message.channelId);
  if (message.author.bot) return;
  message.channel.send(message.content);

  if(message.content ===''){

    
    console.log(message.content);

  }
  //if(message.)
});

// LOGIN
try {
  client.login(discordToken).catch(() => {
//logToChannel();
  });
  console.log('Bot Status: Online');
  console.log('startbot');
  
} catch (e) {
  handleError(e);
}
