// IMPORTS
import Channels from '@services/channels';
import Users from '@services/users';
import {
  formatMessageContentToTweet,
  generateMessageImage,
  getHashTags,
  handleError,
} from '@utils';
import { Attachment, AttachmentBuilder, Message } from 'discord.js';

// MESSAGE CREATE
module.exports = {
  name: 'messageCreate',
  async execute(message: Message) {
    // -> Ignore if message is from a bot
    if (message.author.bot) return;

    // -> Ignore if user is not whitelisted
    const users = await Users.getAll();

    if (!users.find((user) => user.id === message.author.id)) return;

    // -> Ignore if message is not in one of the channels
    const channels = Channels.getAll();

    if (
      !(await channels).find(
        (channel) => channel.id === message.channel.id,
      )
    )
      return;

    // -> Format message
    const formattedMessage = formatMessageContentToTweet(message.content);

    // -> Check if an image is attached
    let image: Attachment | AttachmentBuilder | undefined =
      message.attachments.first();

    if (!image)
      image = new AttachmentBuilder(
        await generateMessageImage(
          formattedMessage,
          new Date(),
          message.author.username,
          message.author.displayAvatarURL(),
        ),
      );

    if (!image)
      return handleError(
        `Failed to generate image for message: ${message.content}`,
      );

    // -> This channel's config
    const channelConfig = await Channels.getOneById(message.channel.id);

    // -> Get hashtags
    const hashtags = getHashTags(
      channelConfig.category,
      channelConfig.hashtagCount,
    );
  },
};
