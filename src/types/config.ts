interface keys {
  sotcktwits: string;
  twitter: {
    consumerKey: string;
    consumerSecret: string;
    accessToken: string;
    accessTokenSecret: string;
  };
}
interface channels {
  [key: string]: {
    delay: number;
    totalHashtags: number;
    currency: string;
  };
}
interface config {
  prefix: string;
  userToken: string;
  keys: keys;
  channels: channels;
  usersWhitelist: string[];
}

export { keys, channels, config };
