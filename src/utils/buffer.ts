// IMPORTS
import axios from 'axios';
import { Attachment, AttachmentBuilder } from 'discord.js';
import { Stream } from 'stream';

// BUFFER UTILS
/**
 * Convert stream to buffer
 *
 * @param stream - Stream to convert to buffer
 */
export const streamToBuffer = (stream: Stream) => {
  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
};

/**
 * Convert discord attachment to buffer
 *
 * @param attachment - Attachment to convert to buffer
 */
export const discordAttachmentToBuffer = async (
  attachment: Attachment | AttachmentBuilder,
) => {
  const att = attachment.attachment;

  // -> If attachment is a buffer, return it
  if (att instanceof Buffer) return att;
  // -> If attachment is a stream, convert it to a buffer
  else if (att instanceof Stream) return streamToBuffer(att);
  // -> If attachment is a string, download it and convert it to a buffer
  else {
    const { data } = await axios(String(att), {
      responseType: 'arraybuffer',
    });

    return Buffer.from(data, 'base64');
  }
};
