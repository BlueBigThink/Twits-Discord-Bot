import axios from "axios";
import { Message } from "discord.js-selfbot-v13";
import { Config, discord, log, parseEmoji, parseMentions } from "..";
import { getHashtags } from "./getHashtags";
import getMessageImage from "./getMessageImage";
import { parseTickers } from "./parseTickers";
import postStocktwits from "./postStocktwits";
import postTwitter from "./postTwitter";

export default async function postDefault(message: Message) {
  const { author, attachments, channelId, embeds } = message;
  const configChannel = Config.channels[channelId];
  if (!configChannel) return;

  let image: Buffer;
  let tweet = "";
  let args = [];
  let hashtags = "";

  log("Processing Message");

  if (attachments.size) {
    const response = await axios(String(attachments.toJSON()[0].attachment), {
      responseType: "arraybuffer",
    });
    image = Buffer.from(response.data, "base64");
  } else {
    image = await getMessageImage(discord, message);
  }
  if (!image) return log("Error: Could not take Screenshot");

  if (embeds.length) {
    const { fields, title, description } = embeds[0];
    let field = "";
    for (var i in fields) {
      field = `${field}\n${fields[i].name}\n${fields[i].value}`;
    }
    args = `${title ? title : ""}\n${
      description ? description : ""
    }${field}`.split(/(\s+)/);
  } else {
    args = message.content.split(/(\s+)/);
  }

  args = parseTickers(configChannel.currency, args);
  hashtags = getHashtags(configChannel.currency, message);
  tweet = args
    .toString()
    .replaceAll(",", "")
    .replaceAll(parseMentions, "")
    .replaceAll(parseEmoji, "");

  if (tweet.length > 220) tweet = tweet.substring(0, 218) + "..";

  const delay = configChannel.delay;

  const stocktwitsUsername = Config.usernames.stocktwits[author.id];

  const stocktwitsMsg = `${tweet}${
    stocktwitsUsername ? `\nPosted by @${stocktwitsUsername}` : ""
  }${delay ? `\nDelay: ${delay} min` : ""}`;

  const twitterUsername = Config.usernames.twitter[author.id];

  const twitterMsg = `${tweet}${
    twitterUsername ? `\nPosted by @${twitterUsername}` : ""
  }${delay ? `\nDelay: ${delay} min` : ""}\n${hashtags}`;

  setTimeout(async () => {
    await postStocktwits(stocktwitsMsg, image)
      .then(() => log(`Posted on stocktwits \n${stocktwitsMsg}`))
      .catch((err) => log(`Error while posting on stocktwits\n${err}`));

    await postTwitter(twitterMsg, image)
      .then(() => log(`Posted on twitter \n${twitterMsg}`))
      .catch((err) => log(`Error while posting on twitter\n${err}`));
  }, configChannel.delay + 0.5 * 60000);
}
