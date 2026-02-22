import { Request, Response } from 'express';
import { TodoRepository } from '../domain/todo';

export function makeUpdateItem(repo: TodoRepository) {
  return async (req: Request<{ id: string }>, res: Response) => {
    await repo.updateItem(req.params.id, {
      name: req.body.name,
      completed: req.body.completed,
    });
    const item = await repo.getItem(req.params.id);
    res.send(item);
  };
}
