// CONFIG
import * as dotenv from 'dotenv';

dotenv.config();

// KEYS
export const isProd = process.env.NODE_ENV === 'production';
export const discordToken = isProd
  ? process.env.DISCORD_TOKEN!
  : process.env.DISCORD_TOKEN_DEV!;
export const discordClientId = isProd
  ? process.env.DISCORD_CLIENT_ID!
  : process.env.DISCORD_CLIENT_ID_DEV!;
export const discordGuildId = isProd
  ? process.env.DISCORD_GUILD_ID!
  : process.env.DISCORD_GUILD_ID_DEV!;
export const sentryDsn = isProd
  ? process.env.SENTRY_DSN!
  : process.env.SENTRY_DSN_DEV!;
export const stocktwitsApiKey = isProd
  ? process.env.STOCKTWITS_API_KEY!
  : process.env.STOCKTWITS_API_KEY_DEV!;
export const twitterConsumerKey = isProd
  ? process.env.TWITTER_CONSUMER_KEY!
  : process.env.TWITTER_CONSUMER_KEY_DEV!;
export const twitterConsumerSecret = isProd
  ? process.env.TWITTER_CONSUMER_SECRET!
  : process.env.TWITTER_CONSUMER_SECRET_DEV!;
export const twitterAccessToken = isProd
  ? process.env.TWITTER_ACCESS_TOKEN!
  : process.env.TWITTER_ACCESS_TOKEN_DEV!;
export const twitterAccessTokenSecret = isProd
  ? process.env.TWITTER_ACCESS_TOKEN_SECRET!
  : process.env.TWITTER_ACCESS_TOKEN_SECRET_DEV!;
