// IMPORTS
import { SlashCommandBuilder } from '@discordjs/builders';
import Channels from '@services/channels';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

// COMMAND
module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage-channels')
    .setDescription('Manage channels to be tracked')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a channel to be tracked')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Channel to track')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('category')
            .setDescription('Category for hashtags')
            .addChoices(
              {
                name: 'Stocks',
                value: 'stocks',
              },
              {
                name: 'Crypto',
                value: 'crypto',
              },
              {
                name: 'Futures',
                value: 'futures',
              },
            )
            .setRequired(true),
        )
        .addNumberOption((option) =>
          option
            .setName('delay')
            .setDescription('Delay in minutes between each tweet'),
        )
        .addNumberOption((option) =>
          option
            .setName('hashtag-count')
            .setDescription('Number of hashtags to add')
            .setMinValue(1)
            .setMaxValue(10),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a channel from being tracked')
        .addChannelOption((option) =>
          option
            .setName('channel')
            .setDescription('Channel to remove')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription('List all channels being tracked'),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      // -> Add a channel to be tracked
      case 'add':
        // --> Options
        const channel = interaction.options.getChannel('channel', true);
        const category = interaction.options.getString('category', true);
        const delay = interaction.options.getNumber('delay') || 0;
        const hashtagCount =
          interaction.options.getNumber('hashtag-count') || 3;

        // --> Add channel to database
        const isTracked = await Channels.isTracked(channel.id);

        if (isTracked)
          return interaction.reply({
            content: 'Channel is already being tracked',
            ephemeral: true,
          });

        await Channels.setOneById(channel.id, {
          id: channel.id,
          category,
          delay,
          hashtagCount,
        });

        await interaction.reply({
          content: `Channel ${channel} added to be tracked`,
          ephemeral: true,
        });

        break;

      // -> Remove a channel from being tracked
      case 'remove':
        // --> Options
        const channelToRemove = interaction.options.getChannel(
          'channel',
          true,
        );

        // --> Remove channel from database
        const isTrackedToRemove = await Channels.isTracked(
          channelToRemove.id,
        );

        if (!isTrackedToRemove)
          return interaction.reply({
            content: 'Channel is not being tracked',
            ephemeral: true,
          });

        await Channels.deleteOneById(channelToRemove.id);

        await interaction.reply({
          content: `Channel ${channelToRemove} removed from being tracked`,
          ephemeral: true,
        });

        break;

      // -> List all channels being tracked
      case 'list':
        // --> Get all channels
        const channels = await Channels.getAll();

        // --> Reply
        await interaction.reply({
          embeds: [
            new EmbedBuilder({
              title: 'Channels being tracked',
              description: channels.length
                ? channels.map((channel) => `<#${channel.id}>`).join('\n')
                : 'No channels are being tracked',
            }),
          ],
          ephemeral: true,
        });
        break;
    }
  },
};
