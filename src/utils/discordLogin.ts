import { Browser, Page } from "puppeteer";
import { Config } from "..";

export default async function discordLogin(browser: Browser): Promise<Page> {
  const webClient = (await browser.pages())[0];
  await webClient.goto(`https://discord.com/login`, {
    waitUntil: "networkidle0",
  });

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

  return webClient;
}
