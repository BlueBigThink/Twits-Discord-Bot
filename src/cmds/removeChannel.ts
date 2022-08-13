import { Client, Message } from "discord.js-selfbot-v13";
import { writeFileSync } from "fs";
import { Config } from "..";
import { Command } from "../types/commands";

const cmd: Command = {
  id: "remCh",
  triggers: ["remch", "rem"],
  exec: async function (client: Client, message: Message, args: string[]) {
    if (args.length < 1)
      return await message.reply("You must specify a channel");
    const channel = client.channels.cache.get(args[1].replaceAll(/<#|>+/g, ""));
    if (!channel)
      return await message.reply(
        `Channel ${args[1]} does not exist in this guild`
      );

    if (channel.type != "GUILD_TEXT")
      return await message.reply(`Channel must be a Text Channel`);

    if (!Config.channels[channel.id])
      return await message.reply(
        `Channel ${args[1]} does not exist in the config`
      );

    delete Config.channels[channel.id];
    writeFileSync("./config.json", JSON.stringify(Config, null, 2));
    await message.reply(`Channel ${channel.name} successfully removed`);
  },
};

export default cmd;
