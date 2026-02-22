import { Request, Response } from 'express';
import { TodoRepository } from '../domain/todo';

export function makeUpdateItem(repo: TodoRepository) {
  return async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await repo.updateItem(id, {
      name: req.body.name,
      completed: req.body.completed,
    });
    const item = await repo.getItem(id);
    res.send(item);
  };
}
