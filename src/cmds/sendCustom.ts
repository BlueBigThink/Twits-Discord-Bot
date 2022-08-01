import axios from "axios";
import { Client, Message } from "discord.js-selfbot-v13";
import { readFileSync } from "fs";
import { browser, Config } from "..";
import { Command } from "../types/commands";

const cmd: Command = {
  id: "sendCustom",
  triggers: ["send", "sendCustom"],
  exec: async function (client: Client, message: Message, args: string[]) {
    if (!Config.usersWhitelist.includes(message.author.id)) return;
    let image: Buffer;
    const { content, attachments } = message;

    if (attachments.size > 0) {
      const response = await axios(String(attachments.toJSON()[0].attachment), {
        responseType: "arraybuffer",
      });
      image = Buffer.from(response.data, "base64");
    } else {
      const webClient = (await browser.pages())[0];
      await webClient.goto(
        `https://discord.com/channels/${message.guildId}/${message.channelId}/${message.id}`,
        {
          waitUntil: "networkidle0",
        }
      );
      await webClient.evaluate(`
      function login(token) {
        setInterval(() => {
          document.body.appendChild(
            document.createElement("iframe")
          ).contentWindow.localStorage.token = token;
        }, 50);
        setTimeout(() => {
          location.reload();
        }, 2500);
      }
        login('"${Config.userToken}"')
      `);
      await webClient.reload({
        waitUntil: ["networkidle0", "domcontentloaded"],
      });
    }
  },
};

export default cmd;
