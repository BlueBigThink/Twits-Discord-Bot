// IMPORTS
import 'module-alias/register';
import { readdirSync } from 'fs';
import { join } from 'path';
import { REST, Routes } from 'discord.js';
import {
  discordClientId,
  discordGuildId,
  discordToken,
  isProd,
} from '@keys';
import { handleError } from '@utils';

// COMMANDS
const commands: unknown[] = [];

// -> Read command folders
const commandFolders = readdirSync(join(__dirname, '..', 'commands'));

// -> Read command files
for (const folder of commandFolders) {
  const commandFiles = readdirSync(
    join(__dirname, '..', 'commands', folder),
  ).filter((file) => file.endsWith('.js'));

  for (const file of commandFiles) {
    const command = require(join(
      __dirname,
      '..',
      'commands',
      folder,
      file,
    ));
    commands.push(command.data.toJSON());
  }
}

const rest = new REST({ version: '10' }).setToken(discordToken);

console.log(
  `Deploying commands for ${
    isProd ? 'production' : 'development'
  } environment...`,
);

// -> Deploy commands
rest
  .put(
    isProd && process.argv[2] !== 'dev'
      ? Routes.applicationCommands(discordClientId)
      : Routes.applicationGuildCommands(discordClientId, discordGuildId),
    { body: commands },
  )
  .then(() => console.log('REGISTERED COMMANDS'))
  .catch(handleError);
