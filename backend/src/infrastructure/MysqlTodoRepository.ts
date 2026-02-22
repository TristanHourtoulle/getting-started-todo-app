import waitPort from 'wait-port';
import fs from 'fs';
import mysql from 'mysql2';
import { TodoItem, TodoRepository } from '../domain/todo';

interface MysqlRow {
  id: string;
  name: string;
  completed: number;
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
        'CREATE TABLE IF NOT EXISTS todo_items (id varchar(36), name varchar(255), completed boolean) DEFAULT CHARSET utf8mb4',
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

  async getItems(): Promise<TodoItem[]> {
    return new Promise((resolve, reject) => {
      this.getPool().query('SELECT * FROM todo_items', (err, rows) => {
        if (err) return reject(err);
        resolve(
          (rows as MysqlRow[]).map((item) => ({
            ...item,
            completed: item.completed === 1,
          })),
        );
      });
    });
  }

  async getItem(id: string): Promise<TodoItem | undefined> {
    return new Promise((resolve, reject) => {
      this.getPool().query('SELECT * FROM todo_items WHERE id=?', [id], (err, rows) => {
        if (err) return reject(err);
        resolve(
          (rows as MysqlRow[]).map((item) => ({
            ...item,
            completed: item.completed === 1,
          }))[0],
        );
      });
    });
  }

  async storeItem(item: TodoItem): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getPool().query(
        'INSERT INTO todo_items (id, name, completed) VALUES (?, ?, ?)',
        [item.id, item.name, item.completed ? 1 : 0],
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
}
