// IMPORTS
import Channels from '@services/channels';
import Users from '@services/users';
import {
  discordAttachmentToBuffer,
  formatMessageContentToTweet,
  getHashTags,
  getMessageScreenshot,
  handleError,
  logToChannel,
  postToStockTwits,
  postToTwitter,
} from '@utils';
import {
  Attachment,
  AttachmentBuilder,
  Message,
  TextChannel,
} from 'discord.js';

// MESSAGE CREATE
module.exports = {
  name: 'messageCreate',
  async execute(message: Message) {
    // -> Ignore if user is not whitelisted
    const isUserWhitelisted = await Users.isWhitelisted(message.author.id);

    if (!isUserWhitelisted && !message.webhookId) return;

    // -> Ignore if message is not in one of the channels
    const isChannelTracked = await Channels.isTracked(message.channel.id);

    if (!isChannelTracked) return;

    // -> This channel's config
    const channel = await Channels.getOneById(message.channel.id);

    if (!channel)
      return handleError(`Channel not found: ${message.channel.id}`);

    // -> Log message
    logToChannel(message.client, 'Received message', message);

    // -> Output
    console.log({
      content: message.content,
      channel: (message.channel as TextChannel).name,
    });

    // -> Format message
    const formattedMessage = formatMessageContentToTweet(
      message.embeds.length &&
        message.embeds[0].title &&
        message.embeds[0].description
        ? `${message.embeds[0].title}\n${message.embeds[0].description}`
        : message.content,
      channel.category,
    );

    // -> Log formatted message
    logToChannel(message.client, 'Formatted message', formattedMessage);

    // -> Check if an image is attached
    let image: Attachment | AttachmentBuilder | undefined =
      message.attachments.first();

    if (!image)
      image = new AttachmentBuilder(await getMessageScreenshot(message));

    if (!image)
      return handleError(
        `Failed to generate image for message: ${message.content}`,
      );

    // -> Get hashtags
    const hashtags = getHashTags(channel.category, channel.hashtagCount);

    let tweet = formattedMessage;

    // -> Handle Image
    const imageToPost = await discordAttachmentToBuffer(image);

    // -> Truncate tweet if it's too long
    if (tweet.length > 220) tweet = `${tweet.substring(0, 217)}...`;

    const user = await Users.getOneById(message.author.id);

    const stocktwitsMsg = `${tweet}${
      user && user.twitstockUsername
        ? `\nPosted by @${user.twitstockUsername}`
        : `\nPosted by ${message.author.username}`
    }${channel.delay ? `\nDelay: ${channel.delay} min` : ''}`;

    const twitterMsg = `${tweet}${
      user && user.twitterUsername
        ? `\nPosted by @${user.twitterUsername}`
        : `\nPosted by ${message.author.username}`
    }${channel.delay ? `\nDelay: ${channel.delay} min` : ''}\n${hashtags}`;

    // -> Log tweet & stocktwit
    logToChannel(message.client, 'Tweet', twitterMsg);
    logToChannel(message.client, 'Stocktwit', stocktwitsMsg);

    // -> Send to Twitter & Stocktwits
    setTimeout(async () => {
      await postToStockTwits(stocktwitsMsg, imageToPost)
        .then(() => console.log(`Posted on stocktwits \n${stocktwitsMsg}`))
        .catch((err) =>
          handleError(`Error while posting on stocktwits\n${err}`),
        );

      await postToTwitter(twitterMsg, imageToPost)
        .then(() => console.log(`Posted on twitter \n${twitterMsg}`))
        .catch((err) =>
          handleError(`Error while posting on twitter\n${err}`),
        );
    }, channel.delay + 0.5 * 60000);
  },
};
