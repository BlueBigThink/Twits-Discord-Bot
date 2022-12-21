// Imports
import { isProd } from '@keys';
import { promises as fs } from 'fs';
import path from 'path';

// Init
const dbPath = path.join(
  process.cwd(),
  isProd ? 'database.json' : 'database.dev.json',
);

// Database
export default class Database {
  /**
   * Get all data from a table
   *
   * @param table - Table name
   */
  static async all<T>(table: string): Promise<T[]> {
    const db = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(db)[table];
  }

  /**
   * Get a single item from a table
   *
   * @param table - Table name
   * @param id - Item ID
   */
  static async get<T>(table: string, id: string): Promise<T> {
    const db = await fs.readFile(dbPath, 'utf-8');
    return JSON.parse(db)[table].find((item: any) => item.id === id);
  }

  /**
   * Set a single item in a table
   *
   * @param table - Table name
   * @param id - Item ID
   * @param data - Data to set
   */
  static async set<T>(table: string, id: string, data: T): Promise<void> {
    const db = await fs.readFile(dbPath, 'utf-8');
    const parsedDb = JSON.parse(db);
    const tableData = parsedDb[table];

    const index = tableData.findIndex((item: any) => item.id === id);

    if (index === -1)
      tableData.push({
        id,
        ...data,
      });
    else
      tableData[index] = {
        id,
        ...data,
      };

    await fs
      .writeFile(dbPath, JSON.stringify(parsedDb, null, 2), 'utf-8')
      .catch((err) => console.log(err));
  }

  /**
   * Delete a single item from a table
   *
   * @param table - Table name
   * @param id - Item ID
   */
  static async delete(table: string, id: string): Promise<void> {
    const db = await fs.readFile(dbPath, 'utf-8');
    const parsedDb = JSON.parse(db);
    const tableData = parsedDb[table];

    const index = tableData.findIndex((item: any) => item.id === id);

    if (index !== -1) tableData.splice(index, 1);

    await fs
      .writeFile(dbPath, JSON.stringify(parsedDb, null, 2), 'utf-8')
      .catch((err) => console.log(err));
  }

  /**
   * Clear a table
   *
   * @param table - Table name
   */
  static async clear(table: string): Promise<void> {
    const db = await fs.readFile(dbPath, 'utf-8');
    const parsedDb = JSON.parse(db);
    parsedDb[table] = [];

    await fs
      .writeFile(dbPath, JSON.stringify(parsedDb, null, 2), 'utf-8')
      .catch((err) => console.log(err));
  }

  /**
   * Initialize the database
   */
  static async init(): Promise<void> {
    await fs
      .writeFile(dbPath, JSON.stringify({}, null, 2), 'utf-8')
      .catch((err) => console.log(err));
  }
}
