import { createCanvas } from "canvas";
import { Message } from "discord.js-selfbot-v13";
import Jimp from "jimp";
import { Page } from "puppeteer";

export default async function getMessageImage(
  webClient: Page,
  message: Message
): Promise<Buffer> {
  const messageSelector = `#chat-messages-${message.id}`;

  await webClient.goto(
    `https://discord.com/login?redirect_to=%2Fchannels%2F${message.guildId}%2F${message.channelId}%2F${message.id}`
  );
  const messageElement = await webClient.waitForSelector(messageSelector, {
    timeout: 0,
  }); // Getting message element

  await webClient.waitForTimeout(2000);

  const messageScreenshot = await messageElement.screenshot(); // Taking Screenshot
  const messageImage = await Jimp.read(Buffer.from(messageScreenshot)); // Reading Screenshot

  const width = messageImage.getWidth() + 150; // Setting Width and Height
  const height = messageImage.getHeight() + 150;

  const canvas = createCanvas(width, height); // Creating Canvas

  const context = canvas.getContext("2d"); // Creating context

  context.fillStyle = "#13121d"; // Filling Style
  context.fillRect(0, 0, width, height); // Filling Rect

  const canvasBuffer = canvas.toBuffer("image/png"); // Crrating Buffer
  const canvasBackground = await Jimp.read(canvasBuffer); // Reading Buffer

  const centerWidth =
    canvasBackground.getWidth() / 2 - messageImage.getWidth() / 2; // Setting Center Width

  const centerheight =
    canvasBackground.getHeight() / 2 - messageImage.getHeight() / 2; // Setting Center Height

  canvasBackground.blit(messageImage, centerWidth, centerheight); // Putting Message Image on background

  return canvasBackground.getBufferAsync(Jimp.MIME_PNG);
}
