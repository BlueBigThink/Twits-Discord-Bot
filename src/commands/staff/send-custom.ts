// IMPORTS
import { SlashCommandBuilder } from '@discordjs/builders';
import { formatMessageContentToTweet, generateMessageImage } from '@utils';
import {
  AttachmentBuilder,
  ChatInputCommandInteraction,
} from 'discord.js';

// COMMAND
module.exports = {
  data: new SlashCommandBuilder()
    .setName('send-custom')
    .setDescription('Send a custom message to twitter/st')
    .addStringOption((option) =>
      option
        .setName('message')
        .setDescription('Message to send')
        .setRequired(true),
    )
    .addAttachmentOption((option) =>
      option.setName('image').setDescription('Image to send'),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    // -> Options
    const message = interaction.options.getString('message', true);
    const image = interaction.options.getAttachment('image');

    // -> Format message
    const formattedMessage = formatMessageContentToTweet(message);

    // -> Generate image
    const generatedImage = await generateMessageImage(
      formattedMessage,
      new Date(),
      interaction.user.username,
      interaction.user.displayAvatarURL(),
    );

    const attachment = new AttachmentBuilder(generatedImage);

    // -> Send message
    await interaction.reply({
      content: formattedMessage,
      files: image ? [image] : [attachment],
      ephemeral: true,
    });
  },
};
