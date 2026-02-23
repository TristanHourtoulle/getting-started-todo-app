import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { UserRepository } from '../domain/user';
import { TodoRepository } from '../domain/todo';

const SALT_ROUNDS = 10;

export function makeRegister(userRepo: UserRepository) {
    return async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    error: 'Email and password are required',
                });
                return;
            }

            const existing = await userRepo.findByEmail(email);
            if (existing) {
                res.status(409).json({ error: 'Email already registered' });
                return;
            }

            const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
            const user = {
                id: uuid(),
                email,
                passwordHash,
                createdAt: new Date(),
            };

            await userRepo.createUser(user);
            res.status(201).json({ id: user.id, email: user.email });
        } catch (err) {
            console.error('Register error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

export function makeLogin(userRepo: UserRepository, jwtSecret: string) {
    return async (req: Request, res: Response) => {
        try {
            const { email, password } = req.body;

            if (!email || !password) {
                res.status(400).json({
                    error: 'Email and password are required',
                });
                return;
            }

            const user = await userRepo.findByEmail(email);
            if (!user) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const valid = await bcrypt.compare(password, user.passwordHash);
            if (!valid) {
                res.status(401).json({ error: 'Invalid credentials' });
                return;
            }

            const token = jwt.sign({ userId: user.id }, jwtSecret, {
                expiresIn: '24h',
            });
            res.json({ token });
        } catch (err) {
            console.error('Login error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

export function makeGetProfile(userRepo: UserRepository) {
    return async (req: Request, res: Response) => {
        try {
            const user = await userRepo.findById(req.userId!);
            if (!user) {
                res.status(404).json({ error: 'User not found' });
                return;
            }

            res.json({
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
            });
        } catch (err) {
            console.error('Get profile error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

export function makeDeleteProfile(
    userRepo: UserRepository,
    todoRepo: TodoRepository,
) {
    return async (req: Request, res: Response) => {
        try {
            const userId = req.userId!;

            await todoRepo.anonymizeItemsByUserId(userId);
            await userRepo.deleteUser(userId);

            res.json({
                message: 'Account deleted, associated data anonymized',
            });
        } catch (err) {
            console.error('Delete profile error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}

export function makeExportData(
    userRepo: UserRepository,
    todoRepo: TodoRepository,
) {
    return async (req: Request, res: Response) => {
        try {
            const userId = req.userId!;

            const userData = await userRepo.getAllUserData(userId);
            const todos = await todoRepo.getItems(userId);

            res.json({
                user: userData,
                todos,
            });
        } catch (err) {
            console.error('Export data error:', err);
            res.status(500).json({ error: 'Internal server error' });
        }
    };
}
