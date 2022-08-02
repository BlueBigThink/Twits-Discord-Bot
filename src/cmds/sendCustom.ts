import axios from "axios";
import { createCanvas } from "canvas";
import { Client, Message } from "discord.js-selfbot-v13";
import { readFileSync, writeFileSync } from "fs";
import Jimp from "jimp";
import { browser, Config } from "..";
import { Command } from "../types/commands";
import discordLogin from "../utils/discordLogin";
import getMessageImage from "../utils/getMessageImage";
// import createCanvas from "canvas";

const cmd: Command = {
  id: "sendCustom",
  triggers: ["send", "sendCustom"],
  exec: async function (client: Client, message: Message, args: string[]) {
    if (!Config.usersWhitelist.includes(message.author.id)) return;
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
        const webClient = await discordLogin(
          browser,
          Config.userToken,
          message
        );
        image = await getMessageImage(webClient, message);
    }

    writeFileSync("./image.png", image);
    //   Add Twitter api
  },
};

export default cmd;
