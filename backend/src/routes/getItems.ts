import { Request, Response } from 'express';
import { TodoRepository } from '../domain/todo';

export function makeGetItems(repo: TodoRepository) {
    return async (req: Request, res: Response) => {
        const items = await repo.getItems(req.userId!);
        res.send(items);
    };
}
