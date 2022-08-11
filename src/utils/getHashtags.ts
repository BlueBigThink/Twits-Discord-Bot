import { Message } from "discord.js-selfbot-v13";
import { Config } from "..";

function getMultipleRandom(arr: string[], num: number) {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());

  return shuffled.slice(0, num);
}

export function getHashtags(currency: string, message: Message) {
  return getMultipleRandom(
    Config.hashtags[currency],
    Config.channels[message.channelId].totalHashtags
  ).join(" ");
}
