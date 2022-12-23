// IMPORTS
import {
  twitterAccessToken,
  twitterAccessTokenSecret,
  twitterConsumerKey,
  twitterConsumerSecret,
} from '@keys';
import { handleError } from '@utils';
import { TwitterClient } from 'twitter-api-client';

// INIT
const twitterClient = new TwitterClient({
  apiKey: twitterConsumerKey,
  apiSecret: twitterConsumerSecret,
  accessToken: twitterAccessToken,
  accessTokenSecret: twitterAccessTokenSecret,
});

// TWITTER UTILS
export const postToTwitter = async (content: string, image: Buffer) => {
  try {
    const uploaded = await twitterClient.media.mediaUpload({
      media_data: image.toString('base64'),
      media_category: 'tweet_image',
    });

    return await twitterClient.tweetsV2.createTweet({
      media: { media_ids: [uploaded.media_id_string] },
      text: content,
    });
  } catch (e) {
    handleError(e);
    return e;
  }
};
