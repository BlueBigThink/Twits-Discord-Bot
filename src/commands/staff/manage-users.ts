// IMPORTS
import { SlashCommandBuilder } from '@discordjs/builders';
import Channels from '@services/channels';
import Users from '@services/users';
import { ChatInputCommandInteraction, EmbedBuilder } from 'discord.js';

// COMMAND
module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage-users')
    .setDescription('Manage whitelisted users')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('add')
        .setDescription('Add a user to whitelist')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to whitelist')
            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('twitter-username')
            .setDescription('Twitter username of the user')

            .setRequired(true),
        )
        .addStringOption((option) =>
          option
            .setName('twitstock-username')
            .setDescription('TwitStock username of the user')

            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('remove')
        .setDescription('Remove a user from whitelist')
        .addUserOption((option) =>
          option
            .setName('user')
            .setDescription('User to remove from whitelist')
            .setRequired(true),
        ),
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('list')
        .setDescription("List all users that're whitelisted"),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    switch (subcommand) {
      // -> Add a user to whitelist
      case 'add':
        // --> Options
        const userToAdd = interaction.options.getUser('user', true);
        const twitterUsername = interaction.options.getString(
          'twitter-username',
          true,
        );
        const twitstockUsername = interaction.options.getString(
          'twitstock-username',
          true,
        );

        // --> Check if user is whitelisted
        const isUserToAddWhitelisted = await Users.isWhitelisted(
          userToAdd.id,
        );

        if (isUserToAddWhitelisted)
          return interaction.reply({
            content: 'User is already whitelisted',
            ephemeral: true,
          });

        // --> Add user to database
        await Users.setOneById(userToAdd.id, {
          id: userToAdd.id,
          twitterUsername,
          twitstockUsername,
        });

        await interaction.reply({
          content: `User ${userToAdd} added to whitelist`,
          ephemeral: true,
        });

        break;

      // -> Remove a user from whitelist
      case 'remove':
        // --> Options
        const user = interaction.options.getUser('user', true);

        // --> Remove user from database
        const isWhitelisted = await Users.isWhitelisted(user.id);

        if (!isWhitelisted)
          return interaction.reply({
            content: 'User is not whitelisted',
            ephemeral: true,
          });

        await Users.deleteOneById(user.id);

        await interaction.reply({
          content: `User ${user} removed from whitelist`,
          ephemeral: true,
        });

        break;

      // -> List all whitelisted users
      case 'list':
        // -->
        const users = await Users.getAll();

        const embed = new EmbedBuilder()
          .setTitle('Whitelisted users')
          .setDescription(
            users.map((user) => `<@${user.id}>`).join('\n\n'),
          );

        await interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
        break;
    }
  },
};
