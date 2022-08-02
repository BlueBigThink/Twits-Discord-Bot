import { Message } from "discord.js-selfbot-v13";
import { Browser, Page } from "puppeteer";

export default async function discordLogin(
  browser: Browser,
  token: string,
  message: Message
): Promise<Page> {
  const webClient = (await browser.pages())[0];
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
        login('"${token}"')
      `);

  return webClient;
}
