// IMPORTS
import { stocktwitsApiKey } from '@keys';
import axios from 'axios';
import { handleError } from '@utils';

// STOCK TWIT UTILS
/**
 * Post to StockTwits
 *
 * @param content - Content to post
 * @param image - Image to post
 */
export const postToStockTwits = async (content: string, image: Buffer) => {
  // -> Form Data
  const bodyFormData = new FormData();
  bodyFormData.append('body', content);
  bodyFormData.append('chart', image as any, 'image.png');

  // -> Post to StockTwits
  try {
    const { data } = await axios(
      'https://api.stocktwits.com/api/2/messages/create.json?cc_to_twitter=0',
      {
        headers: {
          accept: 'application/json',
          'accept-language': 'en-US,en;q=0.9,hi;q=0.8',
          authorization: `OAuth ${stocktwitsApiKey}`,
          'content-type':
            'multipart/form-data; boundary=----WebKitFormBoundarywRMZCqBlLzyo0oDG',
          'sec-ch-ua':
            '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
          'sec-ch-ua-mobile': '?0',
          'sec-ch-ua-platform': '"Windows"',
          'sec-fetch-dest': 'empty',
          'sec-fetch-mode': 'cors',
          'sec-fetch-site': 'same-site',
          Referer: 'https://stocktwits.com/',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
        },
        data: bodyFormData,
        method: 'POST',
      },
    );

    return data;
  } catch (e) {
    handleError(e);
    return e;
  }
};
