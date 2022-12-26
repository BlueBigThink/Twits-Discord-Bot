// IMPORTS
import coins from '@assets/json/coins.json';
import crypto from '@assets/json/crypto.json';
import futures from '@assets/json/futures.json';
import stocks from '@assets/json/stocks.json';
import { Canvas, createCanvas, loadImage, registerFont } from 'canvas';
import { Attachment } from 'discord.js';

// Init
const tickers = [...coins, ...crypto, ...futures, ...stocks];

// MESSAGE UTILS
/**
 * Format a message's content before sending it to twitter
 *
 * @param content - Content to format
 */
export const formatMessageContentToTweet = (content: string) => {
  // -> Remove all mentions
  const contentWithoutMentions = content.replace(/<@!?\d+>/g, '');

  // -> Updates all tickers (later will be replaced by api)
  const contentWithUpdatedTickers = contentWithoutMentions.replace(
    /(?<=\s|^)[A-Z]+(?=\s|$)/g,
    (match) => {
      const tickerExists = tickers.includes(match);
      return tickerExists ? `$${match}` : match;
    },
  );

  return contentWithUpdatedTickers;
};

export const generateMessageImage = async (
  content: string,
  dateTime: Date,
  displayName: string,
  avatarUrl: string,
) => {
  const date = `Today at ${dateTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  })}`;

  // -> Create canvas with dynamic width/height based on content
  const width = Math.min(
    400,
    Math.max(
      64 + Math.ceil(displayName.length * 8 + date.length * 8),
      64 + Math.ceil(content.length * 8),
    ),
  );
  const height = 64 + Math.ceil(content.length / (width / 14)) * 16;

  const canvas = createCanvas(width, height);
  const context = canvas.getContext('2d');

  // -> Register font
  registerFont('./src/assets/fonts/NotoSans.ttf', {
    family: 'Noto Sans',
  });

  // -> Draw background
  context.fillStyle = '#2f3136';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.save();

  // -> Draw Avatar rounded with margin of 16px from left and 4px from top
  const avatar = await loadImage(avatarUrl);
  context.beginPath();
  context.arc(16 + 40 / 2, 4 + 40 / 2, 40 / 2, 0, Math.PI * 2, true);
  context.closePath();
  context.clip();
  context.drawImage(avatar, 16, 4, 40, 40);
  context.restore();

  // -> Draw username
  context.font = '16px Noto Sans';
  const usernameSize = context.measureText(displayName);
  context.fillStyle = '#fff';
  context.fillText(
    displayName,
    64,
    usernameSize.actualBoundingBoxAscent + 8,
  );

  // -> Draw date
  context.font = '12px Noto Sans';
  const dateSize = context.measureText(date);
  context.fillStyle = '#b9bbbe';
  context.fillText(
    date,
    64 + 8 + usernameSize.width,
    dateSize.actualBoundingBoxAscent + 12,
  );

  // -> Draw content and break lines where line is too long
  context.font = '16px Noto Sans';
  context.fillStyle = '#dcddde';
  const lines = content.split('\n');
  let lineY = usernameSize.actualBoundingBoxAscent + 20;
  for (const line of lines) {
    const lineSize = context.measureText(line);
    if (lineSize.width > canvas.width - 64) {
      const words = line.split(' ');
      let currentLine = '';
      for (const word of words) {
        const currentLineSize = context.measureText(currentLine);
        const wordSize = context.measureText(word);
        if (currentLineSize.width + wordSize.width < canvas.width - 64) {
          currentLine += `${word} `;
        } else {
          context.fillText(
            currentLine,
            64,
            lineY + lineSize.actualBoundingBoxAscent,
          );
          lineY += 24;
          currentLine = `${word} `;
        }
      }
      context.fillText(
        currentLine,
        64,
        lineY + lineSize.actualBoundingBoxAscent,
      );
      lineY += 24;
    } else {
      context.fillText(line, 64, lineY + lineSize.actualBoundingBoxAscent);
      lineY += 24;
    }
  }

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
};
