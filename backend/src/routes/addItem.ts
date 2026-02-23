import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';
import { TodoRepository } from '../domain/todo';

export function makeAddItem(repo: TodoRepository) {
  return async (req: Request, res: Response) => {
    const item = {
      id: uuid(),
      name: req.body.name,
      completed: false,
      userId: req.userId!,
    };

    await repo.storeItem(item);
    res.send(item);
  };
}
