import { AnyChannel, Client } from "discord.js-selfbot-v13";
import { readFile, readFileSync, writeFileSync } from "fs";
import { commands, loadCommands } from "./commands";
import { channels, config } from "./types/config";
import postStocktwits from "./utils/postStocktwits";

// readFile("./test.png", (f) => console.log(f));
// postStocktwits(
//   "test Image Message",
//   readFileSync("./test.png"),
//   "test.png",
//   config.Keys.sotcktwits
// )
//   .then((r) => console.log(r.data))
//   .catch((err) => console.log(err));
export const Config: config = JSON.parse(String(readFileSync("./config.json")));
const client = new Client({ checkUpdate: false });
const parseAllMention = /\*|<[@&#]+[0-9]+>|@everyone|@here/gi;

client.on("ready", async () => {
  await loadCommands();
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
  console.log(args[0]);
  const cmd = commands.get(args[0].toLowerCase());
  if (!cmd) return;
  console.log("here");
  cmd.exec(client, message, args);
});

client.login(Config.userToken);
