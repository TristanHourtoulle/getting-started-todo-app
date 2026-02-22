import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { TodoItem, TodoRepository } from '../domain/todo';

interface SqliteRow {
  id: string;
  name: string;
  completed: number;
}

export class SqliteTodoRepository implements TodoRepository {
  private db!: InstanceType<typeof sqlite3.verbose.prototype.Database>;
  private readonly location: string;

  constructor(location?: string) {
    this.location = location ?? process.env.SQLITE_DB_LOCATION ?? '/etc/todos/todo.db';
  }

  async init(): Promise<void> {
    const dirName = path.dirname(this.location);
    if (!fs.existsSync(dirName)) {
      fs.mkdirSync(dirName, { recursive: true });
    }

    const verbose = sqlite3.verbose();

    return new Promise((resolve, reject) => {
      this.db = new verbose.Database(this.location, (err: Error | null) => {
        if (err) return reject(err);

        if (process.env.NODE_ENV !== 'test')
          console.log(`Using sqlite database at ${this.location}`);

        this.db.run(
          'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean)',
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
      this.db.close((err: Error | null) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getItems(): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM todo_items', (err: Error | null, rows: SqliteRow[]) => {
        if (err) return reject(err);
        resolve(
          rows.map((item) => ({
            ...item,
            completed: item.completed === 1,
          })),
        );
      });
    });
  }

  async getItem(id: string): Promise<TodoItem | undefined> {
    return new Promise((resolve, reject) => {
      this.db.all('SELECT * FROM todo_items WHERE id=?', [id], (err: Error | null, rows: SqliteRow[]) => {
        if (err) return reject(err);
        resolve(
          rows.map((item) => ({
            ...item,
            completed: item.completed === 1,
          }))[0],
        );
      });
    });
  }

  async storeItem(item: TodoItem): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
        [item.id, item.name, item.completed ? 1 : 0],
        (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });
  }

  async updateItem(id: string, item: Partial<TodoItem>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
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
      this.db.run('DELETE FROM todo_items WHERE id = ?', [id], (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
