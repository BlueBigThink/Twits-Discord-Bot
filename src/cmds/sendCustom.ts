import axios from "axios";
import { Client, Message } from "discord.js-selfbot-v13";
import { browser, Config, discord, log } from "..";
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
    args.splice(0, 1);
    let image: Buffer;
    const { attachments } = message;
    const content = args.toString().replaceAll(",", " ");
    log("Processing custom message");
    if (attachments.size) {
      const response = await axios(String(attachments.toJSON()[0].attachment), {
        responseType: "arraybuffer",
      });
      image = Buffer.from(response.data, "base64");
    } else {
      image = await getMessageImage(discord, message);
    }

    await postStocktwits(content, image)
      .then(() => log(`Posted custom message on stocktwits \n${content}\n`))
      .catch((err) =>
        log(`Error while posting custom message on stocktwits\n${err}\n`)
      );
    await postTwitter(content, image)
      .then(() => log(`Posted custom message on twitter \n${content}\n`))
      .catch((err) =>
        log(`Error while posting custom message on twitter\n${err}\n`)
      );
  },
};

export default cmd;
