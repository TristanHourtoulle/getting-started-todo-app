import waitPort from 'wait-port';
import fs from 'fs';
import mysql from 'mysql2';
import { TodoItem, TodoRepository } from '../domain/todo';

interface MysqlRow {
  id: string;
  name: string;
  completed: number;
  user_id: string;
}

export class MysqlTodoRepository implements TodoRepository {
  private pool: mysql.Pool | null = null;

  private getPool(): mysql.Pool {
    if (!this.pool) {
      throw new Error('MysqlTodoRepository not initialized. Call init() first.');
    }
    return this.pool;
  }

  async init(): Promise<void> {
    const {
      MYSQL_HOST: HOST,
      MYSQL_HOST_FILE: HOST_FILE,
      MYSQL_USER: USER,
      MYSQL_USER_FILE: USER_FILE,
      MYSQL_PASSWORD: PASSWORD,
      MYSQL_PASSWORD_FILE: PASSWORD_FILE,
      MYSQL_DB: DB,
      MYSQL_DB_FILE: DB_FILE,
    } = process.env;

    const host = HOST_FILE ? fs.readFileSync(HOST_FILE, 'utf-8') : HOST;
    const user = USER_FILE ? fs.readFileSync(USER_FILE, 'utf-8') : USER;
    const password = PASSWORD_FILE ? fs.readFileSync(PASSWORD_FILE, 'utf-8') : PASSWORD;
    const database = DB_FILE ? fs.readFileSync(DB_FILE, 'utf-8') : DB;

    await waitPort({
      host,
      port: 3306,
      timeout: 10000,
      waitForDns: true,
    });

    this.pool = mysql.createPool({
      connectionLimit: 5,
      host,
      user,
      password,
      database,
      charset: 'utf8mb4',
    });

    return new Promise((resolve, reject) => {
      this.getPool().query(
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean, user_id varchar(36)) DEFAULT CHARSET utf8mb4',
        (err) => {
          if (err) return reject(err);
          if (process.env.NODE_ENV !== 'test')
            console.log(`Connected to mysql db at host ${HOST}`);
          resolve();
        },
      );
    });
  }

  async teardown(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getPool().end((err) => {
        if (err) reject(err);
        else {
          this.pool = null;
          resolve();
        }
      });
    });
  }

  async getItems(userId: string): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      this.getPool().query('SELECT * FROM todo_items WHERE user_id = ?', [userId], (err, rows) => {
        if (err) return reject(err);
        resolve(
          (rows as MysqlRow[]).map((item) => ({
            id: item.id,
            name: item.name,
            completed: item.completed === 1,
            userId: item.user_id,
          })),
        );
      });
    });
  }

  async getItem(id: string): Promise<TodoItem | undefined> {
    return new Promise((resolve, reject) => {
      this.getPool().query('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
        if (err) return reject(err);
        const results = rows as MysqlRow[];
        const row = results[0];
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
      this.getPool().query(
        'INSERT INTO todo_items (id, name, completed, user_id) VALUES (?, ?, ?, ?)',
        [item.id, item.name, item.completed ? 1 : 0, item.userId],
        (err) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });
  }

  async updateItem(id: string, item: Partial<TodoItem>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getPool().query(
        'UPDATE todo_items SET name=?, completed=? WHERE id=?',
        [item.name, item.completed ? 1 : 0, id],
        (err) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });
  }

  async removeItem(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getPool().query('DELETE FROM todo_items WHERE id = ?', [id], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async removeItemsByUserId(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getPool().query('DELETE FROM todo_items WHERE user_id = ?', [userId], (err) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
