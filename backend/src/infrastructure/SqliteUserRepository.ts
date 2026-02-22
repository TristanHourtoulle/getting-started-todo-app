import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { User, UserRepository } from '../domain/user';

interface SqliteUserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: string;
}

const verbose = sqlite3.verbose();

export class SqliteUserRepository implements UserRepository {
  private db: InstanceType<typeof verbose.Database> | null = null;
  private readonly location: string;

  constructor(location?: string) {
    this.location = location ?? process.env.SQLITE_DB_LOCATION ?? '/etc/todos/todo.db';
  }

  private getDb(): InstanceType<typeof verbose.Database> {
    if (!this.db) {
      throw new Error('SqliteUserRepository not initialized. Call init() first.');
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

        this.getDb().run(
          `CREATE TABLE IF NOT EXISTS users (
            id varchar(36) PRIMARY KEY,
            email varchar(255) UNIQUE NOT NULL,
            password_hash varchar(255) NOT NULL,
            created_at TEXT NOT NULL
          )`,
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

  async createUser(user: User): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDb().run(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        [user.id, user.email, user.passwordHash, user.createdAt.toISOString()],
        (err: Error | null) => {
          if (err) return reject(err);
          resolve();
        },
      );
    });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.getDb().get(
        'SELECT * FROM users WHERE email = ?',
        [email],
        (err: Error | null, row: SqliteUserRow | undefined) => {
          if (err) return reject(err);
          if (!row) return resolve(undefined);
          resolve({
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            createdAt: new Date(row.created_at),
          });
        },
      );
    });
  }

  async findById(id: string): Promise<User | undefined> {
    return new Promise((resolve, reject) => {
      this.getDb().get(
        'SELECT * FROM users WHERE id = ?',
        [id],
        (err: Error | null, row: SqliteUserRow | undefined) => {
          if (err) return reject(err);
          if (!row) return resolve(undefined);
          resolve({
            id: row.id,
            email: row.email,
            passwordHash: row.password_hash,
            createdAt: new Date(row.created_at),
          });
        },
      );
    });
  }

  async deleteUser(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.getDb().run('DELETE FROM users WHERE id = ?', [id], (err: Error | null) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }

  async getAllUserData(id: string): Promise<object> {
    return new Promise((resolve, reject) => {
      this.getDb().get(
        'SELECT id, email, created_at FROM users WHERE id = ?',
        [id],
        (err: Error | null, row: SqliteUserRow | undefined) => {
          if (err) return reject(err);
          if (!row) return resolve({});
          resolve({
            id: row.id,
            email: row.email,
            createdAt: row.created_at,
          });
        },
      );
    });
  }
}
