// IMPORTS
import { Client } from 'discord.js';

// READY
module.exports = {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    console.log(`Logged in as ${client.user?.tag}!`);
  },
};
