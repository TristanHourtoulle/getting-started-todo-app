import waitPort from 'wait-port';
import fs from 'fs';
import mysql from 'mysql2';
import { User, UserRepository, UserExportData } from '../domain/user';

interface MysqlUserRow {
    id: string;
    email: string;
    password_hash: string;
    created_at: string;
}

export class MysqlUserRepository implements UserRepository {
    private pool: mysql.Pool | null = null;

    private getPool(): mysql.Pool {
        if (!this.pool) {
            throw new Error(
                'MysqlUserRepository not initialized. Call init() first.',
            );
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
        const password = PASSWORD_FILE
            ? fs.readFileSync(PASSWORD_FILE, 'utf-8')
            : PASSWORD;
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
                `CREATE TABLE IF NOT EXISTS users (
          id varchar(36) PRIMARY KEY,
          email varchar(255) UNIQUE NOT NULL,
          password_hash varchar(255) NOT NULL,
          created_at TEXT NOT NULL
        ) DEFAULT CHARSET utf8mb4`,
                (err) => {
                    if (err) return reject(err);
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

    async createUser(user: User): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getPool().query(
                'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
                [
                    user.id,
                    user.email,
                    user.passwordHash,
                    user.createdAt.toISOString(),
                ],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                },
            );
        });
    }

    async findByEmail(email: string): Promise<User | undefined> {
        return new Promise((resolve, reject) => {
            this.getPool().query(
                'SELECT * FROM users WHERE email = ?',
                [email],
                (err, rows) => {
                    if (err) return reject(err);
                    const results = rows as MysqlUserRow[];
                    if (results.length === 0) return resolve(undefined);
                    const row = results[0]!;
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
            this.getPool().query(
                'SELECT * FROM users WHERE id = ?',
                [id],
                (err, rows) => {
                    if (err) return reject(err);
                    const results = rows as MysqlUserRow[];
                    if (results.length === 0) return resolve(undefined);
                    const row = results[0]!;
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
            this.getPool().query(
                'DELETE FROM users WHERE id = ?',
                [id],
                (err) => {
                    if (err) return reject(err);
                    resolve();
                },
            );
        });
    }

    async getAllUserData(id: string): Promise<UserExportData | null> {
        return new Promise((resolve, reject) => {
            this.getPool().query(
                'SELECT id, email, created_at FROM users WHERE id = ?',
                [id],
                (err, rows) => {
                    if (err) return reject(err);
                    const results = rows as MysqlUserRow[];
                    if (results.length === 0) return resolve(null);
                    const row = results[0]!;
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
