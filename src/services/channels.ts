// Imports
import Database from '@services/db';

// Types
interface Channel {
  id: string;
  category: string;
  delay: number;
  hashtagCount: number;
}

// Channels table
export default class Channels extends Database {
  /**
   * Get all channels
   */
  static async getAll(): Promise<Channel[]> {
    return super.all<Channel>('channels');
  }

  /**
   * Get a single channel
   * @param id - Channel ID
   */
  static async getOneById(id: string): Promise<Channel | null> {
    return super.get<Channel>('channels', id);
  }

  /**
   * Set a single channel
   * @param id - Channel ID
   * @param data - Data to set
   * @param data.id - Channel ID
   * @param data.category - Channel category
   * @param data.delay - Delay in minutes between each tweet
   * @param data.hashtagCount - Number of hashtags to add
   */
  static async setOneById(id: string, data: Channel): Promise<void> {
    return super.set<Channel>('channels', id, data);
  }

  /**
   * Delete a single channel
   * @param id - Channel ID
   */
  static async deleteOneById(id: string): Promise<void> {
    return super.delete('channels', id);
  }

  /**
   * Check if a channel is tracked
   * @param id - Channel ID
   * @returns - Whether the channel is tracked
   */
  static async isTracked(id: string): Promise<boolean> {
    const channels = await this.getAll();
    return channels.map((channel) => channel.id).includes(id);
  }
}
