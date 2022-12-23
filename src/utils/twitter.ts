// IMPORTS
import {
  twitterAccessToken,
  twitterAccessTokenSecret,
  twitterConsumerKey,
  twitterConsumerSecret,
} from '@keys';
import { handleError } from '@utils';
import { TwitterClient } from 'twitter-api-client';
import { crypto, futures, stocks } from '@assets/json/hashtags.json';
import { sampleSize } from 'lodash';

// INIT
const twitterClient = new TwitterClient({
  apiKey: twitterConsumerKey,
  apiSecret: twitterConsumerSecret,
  accessToken: twitterAccessToken,
  accessTokenSecret: twitterAccessTokenSecret,
});

// TWITTER UTILS
/**
 * Post a message to twitter
 *
 * @param content - Message content to post
 * @param image - Image to post
 */
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

/**
 * Get random hashtags for given category
 *
 * @param category - Category of the hashtags
 * @param count - Number of hashtags to return
 */
export const getHashTags = (category: string, count: number) => {
  const hashtags =
    category === 'stocks'
      ? stocks
      : category === 'futures'
      ? futures
      : crypto;
  const randomHashtags = sampleSize(hashtags, count);

  return randomHashtags.join(' ');
};
