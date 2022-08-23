import { Client } from "discord.js-selfbot-v13";
import { readFileSync } from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser, Page } from "puppeteer";
import { commands, loadCommands } from "./commands";
import { config } from "./types/config";
import discordLogin from "./utils/discordLogin";
import postDefault from "./utils/postDefault";

const Config: config = JSON.parse(String(readFileSync("./config.json")));
const parseMentions = /\*|<[@&#]+[0-9]+>|@everyone|@here/gim;
const parseEmoji = /:[a-z_]+:/gim;
let browser: Browser;
let discord: Page;

function log(txt: string) {
  console.log(`[${new Date().toLocaleTimeString()}] ${txt}`);
}

export { Config, parseMentions, parseEmoji, browser, discord, log };

const client = new Client({ checkUpdate: false });

client.on("ready", async () => {
  await loadCommands();
  puppeteer.use(StealthPlugin());

  browser = await puppeteer.launch({
    headless: true,
    defaultViewport: { width: 900, height: 900 },
    args: ["--no-sandbox"],
  });
  log("Puppeteer Browser Launched");
  discord = await discordLogin(browser);
  log("Discord Page Ready");
  log(`${client.user.tag} ready`);
});

client.on("messageCreate", async (message) => {
  if (!Config.usersWhitelist.includes(message.author.id)) return;
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
