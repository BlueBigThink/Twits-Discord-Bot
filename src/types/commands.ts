import { Client, Message } from "discord.js-selfbot-v13";
type CommandTrigger = string;
type CommandExecFunction = (
  bot: Client,
  message: Message,
  args: string[]
) => Promise<unknown>;

interface Command {
  id: string;
  triggers: CommandTrigger[];
  exec: CommandExecFunction;
}

export { CommandTrigger, CommandExecFunction, Command };
