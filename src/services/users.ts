// Imports
import Database from '@services/db';

// Types
interface User {
  id: string;
  twitterUsername?: string;
  twitstockUsername?: string;
}

// Users table
export default class Users extends Database {
  /**
   * Get all users
   */
  static async getAll(): Promise<User[]> {
    return super.all<User>('users');
  }

  /**
   * Get a single user
   * @param id - User ID
   */
  static async getOneById(id: string): Promise<User> {
    return super.get<User>('users', id);
  }

  /**
   * Set a single user
   * @param id - User ID
   * @param data - Data to set
   * @param data.id - User ID
   * @param data.twitterUsername - Twitter username
   * @param data.twitstockUsername - TwitStock username
   */
  static async setOneById(id: string, data: User): Promise<void> {
    return super.set<User>('users', id, data);
  }

  /**
   * Delete a single user
   * @param id - User ID
   */
  static async deleteOneById(id: string): Promise<void> {
    return super.delete('users', id);
  }

  /**
   * Check if a user is whitelisted
   * @param id - User ID
   */
  static async isWhitelisted(id: string): Promise<boolean> {
    const users = await this.getAll();
    return users.map((user) => user.id).includes(id);
  }
}
