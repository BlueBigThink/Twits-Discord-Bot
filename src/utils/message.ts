// IMPORTS
import coins from '@assets/json/coins.json';
import crypto from '@assets/json/crypto.json';
import futures from '@assets/json/futures.json';
import stocks from '@assets/json/stocks.json';
import { Message, User } from 'discord.js';
import { createCanvas, loadImage } from 'canvas';
import puppeteer, { Browser } from 'puppeteer';
import { handleError } from './misc';

// Init
let browser: Browser | null;

// MESSAGE UTILS
/**
 * Format a message's content before sending it to twitter
 *
 * @param content - Content to format
 * @param category - Channel category
 */
export const formatMessageContentToTweet = (
  content: string,
  category?: string,
) => {
  // -> Remove all mentions
  const contentWithoutMentions = content
    .replace(/<@!?\d+>/g, '')
    // -> Remove all role mentions
    .replace(/<@&\d+>/g, '')
    // -> Remove @everyone & @here
    .replace(/@(everyone|here)/g, '')
    // -> Add a space after every @ if it's followed by a letter or number
    .replace(/@(?=[a-zA-Z0-9])/g, '@ ');

  // -> Updates all stock tickers
  const contentWithUpdatedTickers = contentWithoutMentions
    .replace(/(?<=^|\s)\$[A-Z]+(?=\s|$)/g, (match) => {
      if (category)
        return category === 'crypto'
          ? `${match}.X`
          : category === 'futures'
          ? `${match}_F`
          : match;
      else return match;
    })
    .replace(/(?<=\s|^)[A-Z]+(?=\s|$)/g, (match) => {
      const stockTickerExists = stocks.includes(match);
      const cryptoTickerExists = crypto.includes(match);
      const coinTickerExists = coins.includes(match);
      const futuresTickerExists = futures.includes(match);

      if (category)
        return category === 'stocks' && stockTickerExists
          ? `$${match}`
          : category === 'crypto' &&
            (cryptoTickerExists || coinTickerExists)
          ? `$${match}.X`
          : futuresTickerExists
          ? `$${match}_F`
          : match;
      else
        return stockTickerExists
          ? `$${match}`
          : cryptoTickerExists || coinTickerExists
          ? `$${match}.X`
          : futuresTickerExists
          ? `$${match}_F`
          : match;
    })
    // Remove any bold/italic/underline markers
    .replace(/(\*|_)/g, '');
  return contentWithUpdatedTickers;
};

export const messageToBase64 = (
  message: Message | string,
  user?: User,
) => {
  if (typeof message === 'string' && user) {
    const content = JSON.stringify({
      messages: [
        {
          data: {
            content: message,
            embeds: null,
            username: user.username,
            avatar_url: user.displayAvatarURL({
              extension: 'png',
              forceStatic: true,
            }),
            attachments: [],
          },
        },
      ],
    });

    // -> return base64url
    return Buffer.from(content)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } else if (message instanceof Message) {
    return Buffer.from(
      JSON.stringify({
        messages: [
          {
            data: {
              content: message.content,
              embeds: message.embeds.length
                ? message.embeds.map((embed) => embed.toJSON())
                : null,
              username: message.author.username,
              avatar_url: message.author.displayAvatarURL({
                extension: 'png',
                forceStatic: true,
              }),
              attachments: message.attachments.map((attachment) =>
                attachment.toJSON(),
              ),
            },
          },
        ],
      }),
    )
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } else throw new Error('Invalid message type');
};

export const getMessageScreenshot = async (
  message: Message | string,
  user?: User,
) => {
  const data = messageToBase64(message, user);

  console.log({ data });

  // -> If browser is not initialized, initialize it
  if (!browser) browser = await puppeteer.launch();

  const page = await browser.newPage();

  await page.setViewport({ width: 1200, height: 1080 });

  try {
    await page.goto(`https://discohook.org/?data=${data}`, {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // -> Wait for date to load
    await page.waitForFunction(() => {
      const date = document.querySelector(
        'main > div > div > div :nth-child(4)',
      );

      if (date?.textContent?.startsWith('Today')) return true;
      else return false;
    });

    // -> Remove the span with BOT text if user is not a bot
    if (
      (user && !user.bot) ||
      (message instanceof Message && !message.author.bot)
    ) {
      await page.evaluate(() => {
        const span = document.querySelector(
          'main > div > div > div > span',
        );

        if (span) span.remove();
      });
    }

    // -> Take screenshot of an element
    const element = await page.$('main > div > div');

    const screenshot = await element?.screenshot();

    // -> Get width & height of the element
    const [width, height] = await page.evaluate(() => {
      const element = document.querySelector('main > div > div');

      if (element) return [element.clientWidth, element.clientHeight];
      else return [0, 0];
    });

    // -> Close page
    await page.close();

    // -> Return screenshot if message's content has 200+ characters or an embed
    if (
      (message instanceof Message &&
        (message.content.length > 200 || message.embeds.length)) ||
      (typeof message === 'string' && message.length > 200)
    )
      return screenshot as Buffer;

    // -> Create canvas using the screenshot buffer
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    const image = await loadImage(screenshot as Buffer);

    ctx.drawImage(image, 0, 0, width, height);

    // -> Create another canvas with 1:2 ratio to fix twitter image with above canvas image centered veritcally and horizontally
    const canvas2 = createCanvas(canvas.width, canvas.width / 2);

    // -> Draw above canvas image centered veritcally and horizontally (and resize it to fit without stretching or cropping)
    const context2 = canvas2.getContext('2d');

    const hRatio = canvas2.width / canvas.width;
    const vRatio = canvas2.height / canvas.height;
    const ratio = Math.min(hRatio, vRatio);
    const centerShift_x = (canvas2.width - canvas.width * ratio) / 2;
    const centerShift_y = (canvas2.height - canvas.height * ratio) / 2;
    context2.clearRect(0, 0, canvas2.width, canvas2.height);
    context2.drawImage(
      canvas,
      0,
      0,
      canvas.width,
      canvas.height,
      centerShift_x,
      centerShift_y,
      canvas.width * ratio,
      canvas.height * ratio,
    );

    // -> Return buffer
    return canvas2.toBuffer();
  } catch (e) {
    // -> Close page
    await page.close();

    handleError(e);
    throw e;
  }
};
