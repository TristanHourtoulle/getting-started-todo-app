import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { TodoItem, TodoRepository } from '../domain/todo';

interface SqliteRow {
  id: string;
  name: string;
  completed: number;
  user_id: string;
}

const verbose = sqlite3.verbose();

export class SqliteTodoRepository implements TodoRepository {
  private db: InstanceType<typeof verbose.Database> | null = null;
  private readonly location: string;

  constructor(location?: string) {
    this.location = location ?? process.env.SQLITE_DB_LOCATION ?? '/etc/todos/todo.db';
  }

  private getDb(): InstanceType<typeof verbose.Database> {
    if (!this.db) {
      throw new Error('SqliteTodoRepository not initialized. Call init() first.');
    }
    return this.db;
  }

  async init(): Promise<void> {
    const dirName = path.dirname(this.location);
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }

    return new Promise((resolve, reject) => {
      this.db = new verbose.Database(this.location, (err: Error | null) => {
        if (err) return reject(err);

        if (process.env.NODE_ENV !== 'test')
          console.log(`Using sqlite database at ${this.location}`);

        this.getDb().run(
          'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, user_id varchar(36))',
          (err: Error | null) => {
            if (err) return reject(err);
            resolve();
          },
        );
      });
    });
  }

  async teardown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDb().close((err: Error | null) => {
        if (err) reject(err);
        else {
          this.db = null;
          resolve();
        }
      });
    });
  }

  async getItems(userId: string): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      this.getDb().all(
        'SELECT * FROM todo_items WHERE user_id = ?',
        [userId],
        (err: Error | null, rows: SqliteRow[]) => {
          if (err) return reject(err);
          resolve(
            rows.map((item) => ({
              id: item.id,
              name: item.name,
              completed: item.completed === 1,
              userId: item.user_id,
            })),
          );
        },
      );
    });
  }

  async getItem(id: string): Promise<TodoItem | undefined> {
    return new Promise((resolve, reject) => {
      this.getDb().all('SELECT * FROM todo_items WHERE id=?', [id], (err: Error | null, rows: SqliteRow[]) => {
        if (err) return reject(err);
        const row = rows[0];
        if (!row) return resolve(undefined);
        resolve({
          id: row.id,
          name: row.name,
          completed: row.completed === 1,
          userId: row.user_id,
        });
      });
    });
  }

  async storeItem(item: TodoItem): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDb().run(
        'INSERT INTO todo_items (id, name, completed, user_id) VALUES (?, ?, ?, ?)',
        [item.id, item.name, item.completed ? 1 : 0, item.userId],
        (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });
  }

  async updateItem(id: string, item: Partial<TodoItem>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDb().run(
        'UPDATE todo_items SET name=?, completed=? WHERE id = ?',
        [item.name, item.completed ? 1 : 0, id],
        (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });
  }

  async removeItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM todo_items WHERE id = ?', [id], (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async removeItemsByUserId(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM todo_items WHERE user_id = ?', [userId], (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
