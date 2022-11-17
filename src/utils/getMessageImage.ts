import { createCanvas, loadImage } from "canvas";
import { Message } from "discord.js-selfbot-v13";
import { Page } from "puppeteer";
import { log } from "..";

export default async function getMessageImage(
  webClient: Page,
  message: Message
): Promise<Buffer | null> {
  const messageSelector = `#chat-messages-${message.id}`;
  let messageScreenshot: string | Buffer;
  let count = 3;

  while (count) {
    try {
      await webClient.goto(
        `https://discord.com/login?redirect_to=%2Fchannels%2F${message.guildId}%2F${message.channelId}%2F${message.id}`
      );
      const messageElement = await webClient.waitForSelector(messageSelector, {
        timeout: 0,
      }); // Getting message element
      await webClient.waitForTimeout(4000);
      await messageElement.evaluate((e) => e.scrollIntoView());
      await webClient.waitForTimeout(2000);
      await messageElement.evaluate((e) => e.scrollIntoView());
      await webClient.waitForTimeout(6000);
      messageScreenshot = await messageElement.screenshot(); // Taking Screenshot
      log("Screenshot Taken Successfully");
      break;
    } catch (err) {
      log("Error Taking Screenshot : retrying");
      count -= 1;
    }
  }
  if (!messageScreenshot) return null;

  const img = await loadImage(Buffer.from(messageScreenshot));

  const canvas = createCanvas(img.width, img.height * 2),
    ctx = canvas.getContext("2d");

  ctx.fillStyle = "#13121d";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, img.height / 2);

  return canvas.toBuffer();
}
