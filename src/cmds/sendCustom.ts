import axios from "axios";
import { Client, Message } from "discord.js-selfbot-v13";
import { browser, Config, discord } from "..";
import { Command } from "../types/commands";
import discordLogin from "../utils/discordLogin";
import getMessageImage from "../utils/getMessageImage";
import postStocktwits from "../utils/postStocktwits";
import postTwitter from "../utils/postTwitter";

const cmd: Command = {
  id: "sendCustom",
  triggers: ["send", "sendCustom"],
  exec: async function (client: Client, message: Message, args: string[]) {
    if (args.length < 2) return message.reply("Message cannot be empty");

    let image: Buffer;
    const { attachments } = message;

    switch (true) {
      case attachments.size > 0: {
        const response = await axios(
          String(attachments.toJSON()[0].attachment),
          {
            responseType: "arraybuffer",
          }
        );
        image = Buffer.from(response.data, "base64");
        break;
      }

      default:
        image = await getMessageImage(discord, message);
    }
    await postStocktwits(message.content, image).catch((err) =>
      console.log(err)
    );
    await postTwitter(message.content, image).catch((err) => console.log(err));
  },
};

export default cmd;
