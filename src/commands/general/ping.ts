// IMPORTS
import { SlashCommandBuilder } from '@discordjs/builders';
import { ChatInputCommandInteraction } from 'discord.js';

// COMMAND
module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Check if the bot is online'),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.reply({ ephemeral: true, content: '🏓 Pong!' });
  },
};
