import axios from "axios";
import FormData from "form-data";
import { Config } from "..";

export default async function postStocktwits(message: string, image: Buffer) {
  var bodyFormData = new FormData();
  bodyFormData.append("body", message);
  bodyFormData.append("chart", image, "image.png");
  return axios(
    "https://api.stocktwits.com/api/2/messages/create.json?cc_to_twitter=0",
    {
      headers: {
        accept: "application/json",
        "accept-language": "en-US,en;q=0.9,hi;q=0.8",
        authorization: `OAuth ${Config.keys.sotcktwits}`,
        "content-type":
          "multipart/form-data; boundary=----WebKitFormBoundarywRMZCqBlLzyo0oDG",
        "sec-ch-ua":
          '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        Referer: "https://stocktwits.com/",
        "Referrer-Policy": "strict-origin-when-cross-origin",
      },
      data: bodyFormData,
      method: "POST",
    }
  );
}
