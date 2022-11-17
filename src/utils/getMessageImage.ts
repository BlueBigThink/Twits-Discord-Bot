import { createCanvas, loadImage } from "canvas";
import { Message } from "discord.js-selfbot-v13";
import Jimp from "jimp";
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

  const messageImage = await Jimp.read(Buffer.from(messageScreenshot)); // Reading Screenshot

  const w = messageImage.getWidth(),
    h = messageImage.getHeight(),
    max = Math.max(w, h);
  const canvas = createCanvas(max, max); // Creating Canvas

  const context = canvas.getContext("2d"); // Creating context

  context.fillStyle = "#13121d"; // Filling Style
  context.fillRect(0, 0, canvas.width, canvas.height); // Filling Rect

  context.drawImage(
    await loadImage(await messageImage.getBufferAsync(Jimp.MIME_PNG)),
    max / 2 - w / 2,
    max / 2 - h / 2
  );

  return canvas.toBuffer("image/png"); // Creating Buffer
}
