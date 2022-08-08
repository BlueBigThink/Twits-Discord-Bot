import { Client } from "discord.js-selfbot-v13";
import { readFileSync } from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";
import { commands, loadCommands } from "./commands";
import { config } from "./types/config";
import postStocktwits from "./utils/postStocktwits";
import discordLogin from "./utils/discordLogin";
import postDefault from "./utils/postDefault";

const Config: config = JSON.parse(String(readFileSync("./config.json")));
const parseAllMention = /\*|<[@&#]+[0-9]+>|@everyone|@here/gi;

let browser: Browser;
let discord: Page;
export { Config, parseAllMention, browser, discord };

const client = new Client({ checkUpdate: false });

client.on("ready", async () => {
  await loadCommands();
  puppeteer.use(StealthPlugin());

  browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: ["--window-size=900,900"],
  });
  console.log("Puppeteer Browser Launched");
  discord = await discordLogin(browser);
  console.log("Discord Page Ready");
  console.log(`${client.user.tag} ready`);
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith(Config.prefix)) {
    const args = message.content.trim().replace(Config.prefix, "").split(" ");
    const cmd = commands.get(args[0].toLowerCase());
    if (!cmd) return;
    cmd.exec(client, message, args);
  } else {
    await postDefault(message);
  }
});

client.login(Config.userToken);
