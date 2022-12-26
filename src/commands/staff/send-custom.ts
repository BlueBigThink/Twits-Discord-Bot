// IMPORTS
import { SlashCommandBuilder } from '@discordjs/builders';
import {
  discordAttachmentToBuffer,
  formatMessageContentToTweet,
  generateMessageImage,
  postToStockTwits,
  postToTwitter,
} from '@utils';
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
    await interaction.deferReply({
      ephemeral: true,
    });

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
      interaction.user.displayAvatarURL({
        extension: 'jpg',
      }),
    );

    const attachment = new AttachmentBuilder(generatedImage);

    const imageToPost = image
      ? await discordAttachmentToBuffer(image)
      : generatedImage;

    let tweet = formattedMessage;

    if (tweet.length > 280) tweet = `${tweet.substring(0, 277)}...`;

    // -> Post to twitter
    await postToTwitter(tweet, imageToPost);

    // -> Post to st
    await postToStockTwits(tweet, imageToPost);

    // -> Send message
    await interaction.editReply({
      content: `**Posted to Twitter & StockTwits:** ${tweet}`,
      files: image ? [image] : [attachment],
    });
  },
};
