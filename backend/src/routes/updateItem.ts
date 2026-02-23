import { Request, Response } from 'express';
import { TodoRepository } from '../domain/todo';

export function makeUpdateItem(repo: TodoRepository) {
    return async (req: Request<{ id: string }>, res: Response) => {
        const existing = await repo.getItem(req.params.id);
        if (!existing || existing.userId !== req.userId) {
            res.status(404).json({ error: 'Item not found' });
            return;
        }

        await repo.updateItem(req.params.id, {
            name: req.body.name,
            completed: req.body.completed,
        });
        const item = await repo.getItem(req.params.id);
        res.send(item);
    };
}
