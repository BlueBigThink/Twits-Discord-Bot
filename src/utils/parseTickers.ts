import { readFileSync } from "fs";

export function parseTickers(currency: string, args: string[]) {
  const tickers = JSON.parse(
    String(readFileSync(`./tickers/${currency}.json`))
  );
  for (var i in args) {
    if (tickers.includes(args[i].toUpperCase())) {
      args.splice(
        Number(i),
        1,
        currency == "crypto"
          ? `$${args[i].toUpperCase()}.X`
          : currency == "stocks"
          ? `$${args[i].toUpperCase()}`
          : `$${args[i].toUpperCase()}.X`
      );
    }
  }
  return args;
}
