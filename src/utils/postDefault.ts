import axios from "axios";
import { Message } from "discord.js-selfbot-v13";
import { Config, discord, log, parseAllMention } from "..";
import { getHashtags } from "./getHashtags";
import getMessageImage from "./getMessageImage";
import { parseTickers } from "./parseTickers";
import postStocktwits from "./postStocktwits";
import postTwitter from "./postTwitter";

export default async function postDefault(message: Message) {
  const { author, attachments, channelId, embeds } = message;
  if (!Config.channels[channelId]) return;

  let image: Buffer;
  let tweet: string;
  let args = [];
  let hashtags: string;

  if (attachments.size) {
    const response = await axios(String(attachments.toJSON()[0].attachment), {
      responseType: "arraybuffer",
    });
    image = Buffer.from(response.data, "base64");
  } else {
    image = await getMessageImage(discord, message);
  }

  if (embeds.length) {
    const embed = embeds[0];
    let field: string;

    for (var i in embed.fields) {
      field = `${field}\n${embed.fields[i].name}\n${embed.fields[i].value}`;
    }
    args = `${embed.title}\n${embed.description}${field}`.split(/(\s+)/);
  } else {
    args = message.content.split(/(\s+)/);
  }

  const currency = Config.channels[channelId].currency;

  args = parseTickers(currency, args);
  hashtags = getHashtags(currency, message);

  tweet = args.toString().replaceAll(",", "").replaceAll(parseAllMention, "");

  if (tweet.length > 220) tweet = tweet.substring(0, 218) + "..";

  const stocktwitsUsername = Config.usernames.stocktwits[author.id];
  const twitterUsername = Config.usernames.twitter[author.id];

  const stocktwitsMsg = `${tweet}${
    stocktwitsUsername ? `\nPosted by @${stocktwitsUsername}` : ""
  }\n${hashtags}`;

  const twitterMsg = `${tweet}${
    twitterUsername ? `\nPosted by @${twitterUsername}` : ""
  }\n${hashtags}`;

  setTimeout(async () => {
    await postStocktwits(stocktwitsMsg, image)
      .then(() => log(`\nPosted on stocktwits \n${stocktwitsMsg}`))
      .catch((err) => log(`\nError while posting on stocktwits\n${err}`));

    await postTwitter(twitterMsg, image)
      .then(() => log(`\nPosted on twitter \n${twitterMsg}`))
      .catch((err) => log(`\nError while posting on twitter\n${err}`));
  }, Config.channels[channelId].delay * 60000);
}
