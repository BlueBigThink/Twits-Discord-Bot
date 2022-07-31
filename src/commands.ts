import { Collection } from "discord.js-selfbot-v13";
import fs from "fs";
import { Command, CommandExecFunction, CommandTrigger } from "./types/commands";

const commands = new Collection<
  CommandTrigger,
  { id: string; exec: CommandExecFunction }
>();

async function loadCommands() {
  console.log("Loading commands...");

  const dir = fs.readdirSync(__dirname + "/cmds");
  const fileNames = dir.filter((file) => file.endsWith(".js"));

  await new Promise((resolve, _reject) => {
    fileNames.forEach((fileName) => {
      import(__dirname + "/cmds/" + fileName).then(
        ({ default: cmd }: { default: Command }) => {
          cmd.triggers.forEach((t) =>
            commands.set(t, { id: cmd.id, exec: cmd.exec })
          );
          resolve("done");
        }
      );
    });
  });

  console.log("Commands loaded");

  return commands;
}

export { commands, loadCommands };
