import { TwitterClient } from "twitter-api-client";
import { Config } from "..";

export default async function postTwitter(status: string, media: Buffer) {
  if (Config.keys.twitter) {
    const twitterClient = new TwitterClient({
      apiKey: Config.keys.twitter.consumerKey,
      apiSecret: Config.keys.twitter.consumerSecret,
      accessToken: Config.keys.twitter.accessToken,
      accessTokenSecret: Config.keys.twitter.accessTokenSecret,
    });
    const uploaded = await twitterClient.media.mediaUpload({
      media_data: media.toString("base64"),
      media_category: "tweet_image",
    });

    return await twitterClient.tweetsV2.createTweet({
      media: { media_ids: [uploaded.media_id_string] },
      text: status,
    });
  } else {
    return null;
  }
}
