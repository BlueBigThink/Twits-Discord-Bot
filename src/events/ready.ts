// IMPORTS
import { isProd } from '@keys';
import { postToStockTwits } from '@utils';
import { Client, Guild } from 'discord.js';

// READY
module.exports = {
  name: 'ready',
  once: true,
  async execute(client: Client) {
    console.log(
      `Logged in as ${client.user?.tag}! (${
        isProd ? 'Production' : 'Development'
      } environment)`,
    );
    
  },
  
};
