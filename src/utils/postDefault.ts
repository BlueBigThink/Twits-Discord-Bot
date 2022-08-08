import axios from "axios";
import { Message } from "discord.js-selfbot-v13";
import { readFileSync } from "fs";
import { Config, discord, parseAllMention } from "..";
import getMessageImage from "./getMessageImage";
import postStocktwits from "./postStocktwits";
import postTwitter from "./postTwitter";

function getMultipleRandom(arr: string[], num: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

export default async function postDefault(message: Message) {
  if (!Config.channels[message.channelId]) return;

  const { attachments } = message;
  let image: Buffer;

  switch (attachments.size) {
    case 0:
      image = await getMessageImage(discord, message);
      break;
    default: {
      const response = await axios(String(attachments.toJSON()[0].attachment), {
        responseType: "arraybuffer",
      });
      image = Buffer.from(response.data, "base64");
      break;
    }
  }

  let tweet: string;
  let args = [];
  let hashtags: string[];
  let tickers: string[];

  switch (message.embeds.length) {
    case 0:
      args = message.content.split(/(\s+)/);
      break;
    default:
      let embed = message.embeds[0];
      let field = "";
      let fields = embed.fields;

      for (var i in fields) {
        field = `${field}\n${fields[i].name}\n${fields[i].value}`;
      }
      args = `${embed.title}\n${embed.description}${field}`.split(/(\s+)/);
      break;
  }

  switch (Config.channels[message.channelId].currency) {
    case "crypto":
      tickers = JSON.parse(String(readFileSync("./tickers/crypto.json")));
      for (var i in args) {
        if (tickers.includes(args[i].toUpperCase())) {
          args.splice(Number(i), 1, `$${args[i].toUpperCase()}.X`);
        }
      }
      hashtags = getMultipleRandom(
        Config.hashtags.crypto,
        Config.channels[message.channelId].totalHashtags
      );
      break;
    case "stocks":
      tickers = JSON.parse(String(readFileSync("./tickers/stocks.json")));
      for (var i in args) {
        if (tickers.includes(args[i].toUpperCase())) {
          args.splice(Number(i), 1, `$${args[i].toUpperCase()}`);
        }
      }
      hashtags = getMultipleRandom(
        Config.hashtags.stocks,
        Config.channels[message.channelId].totalHashtags
      );
      break;
    case "futures":
      tickers = JSON.parse(String(readFileSync("./tickers/futures.json")));
      for (var i in args) {
        if (tickers.includes(args[i].toUpperCase())) {
          args.splice(Number(i), 1, `$${args[i].toUpperCase()}.X`);
        }
      }
      hashtags = getMultipleRandom(
        Config.hashtags.futures,
        Config.channels[message.channelId].totalHashtags
      );
      break;
  }

  tweet = args.toString().replaceAll(",", "").replaceAll(parseAllMention, "");

  if (tweet.length > 220) tweet = tweet.substring(0, 218) + "..";
  tweet = tweet + "\n" + hashtags.join(" ");

  setTimeout(async () => {
    await postStocktwits(tweet, image).catch((err) => console.log(err));
    await postTwitter(tweet, image).catch((err) => console.log(err));
  }, Config.channels[message.channelId].delay * 60000);
}
