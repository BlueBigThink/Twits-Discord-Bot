import { Client } from "discord.js-selfbot-v13";
import { readFileSync } from "fs";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
import { Browser } from "puppeteer";
import { commands, loadCommands } from "./commands";
import { config } from "./types/config";
import postStocktwits from "./utils/postStocktwits";

const Config: config = JSON.parse(String(readFileSync("./config.json")));
const parseAllMention = /\*|<[@&#]+[0-9]+>|@everyone|@here/gi;

let browser: Browser;

export { Config, parseAllMention, browser };

// readFile("./test.png", (f) => console.log(f));

// postStocktwits(
//   "test Image Message",
//   readFileSync("./test.png"),
//   "test.png",
//   Config.keys.sotcktwits
// )
//   .then((r) => console.log(r.data))
//   .catch((err) => console.log(err));

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
  console.log(`${client.user.tag} ready`);
});

client.on("messageCreate", async (message) => {
  if (
    message.author.bot ||
    !message.content ||
    !message.guild ||
    !message.content.startsWith(Config.prefix)
  )
    return;

  const args = message.content.trim().replace(Config.prefix, "").split(" ");
  const cmd = commands.get(args[0].toLowerCase());
  if (!cmd) return;
  cmd.exec(client, message, args);
});

client.login(Config.userToken);
