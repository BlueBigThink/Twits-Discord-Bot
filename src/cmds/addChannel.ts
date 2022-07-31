import { Client, Message } from "discord.js-selfbot-v13";
import { writeFileSync } from "fs";
import { Config } from "..";
import { Command } from "../types/commands";

const cmd: Command = {
  id: "addCh",
  triggers: ["addch", "add"],
  exec: async function (client: Client, message: Message, args: string[]) {
    if (!Config.usersWhitelist.includes(message.author.id)) return;
    if (args.length < 2)
      return await message.reply("You must specify a channel and currency");

    let delay = 0;
    let totalHashtags = 3;
    const channel = client.channels.cache.get(args[1].replaceAll(/<#|>+/g, ""));

    if (!channel)
      return await message.reply(
        `Channel ${args[1]} does not exist in this guild`
      );

    if (channel.type != "GUILD_TEXT")
      return await message.reply(`Channel must be a Text Channel`);

    if (!/stocks|crypto/gi.exec(args[2]))
      return await message.reply(
        `Currency ${args[2]} does not match (stocks/crypto)`
      );

    let obj = {
      currency: args[2],
      delay: Number(args[3]) || delay,
      totalHashtags: Number(args[4]) || totalHashtags,
    };
    Config.channels[channel.id] = obj;
    writeFileSync("./config.json", JSON.stringify(Config, null, 2));
    await message.reply(`Channel ${channel.name} successfully added`);
  },
};

export default cmd;
