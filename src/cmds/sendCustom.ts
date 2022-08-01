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
      //   ("https://discord.com/login?redirect_to=%2Fchannels%2F929564043033870356%2F999031299404738682%2F1003742620503253032");

      await webClient.goto(
        `https://discord.com/login?redirect_to=%2Fchannels%2F${message.guildId}%2F${message.channelId}%2F${message.id}`,
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
        }, 100);
        setTimeout(() => {
          location.reload();
        }, 2500);
      }
        login('"${Config.userToken}"')
      `);

      //   await webClient.reload({
      //     waitUntil: ["networkidle0", "domcontentloaded"],
      //   });

      //   await webClient.waitForTimeout(10000);
      //   await webClient.screenshot({ path: "./testSS.png" });

      const messageSelector = `#chat-messages-${message.id}`;

      const messageElement = await webClient.waitForSelector(messageSelector, {
        timeout: 0,
      });
      await webClient.waitForTimeout(2500);
      await messageElement.screenshot({ path: "./message.png" });

      //   Add Twitter api
    }
  },
};

export default cmd;
