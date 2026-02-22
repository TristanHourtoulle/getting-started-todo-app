import { Request, Response } from 'express';
import { TodoRepository } from '../domain/todo';

export function makeDeleteItem(repo: TodoRepository) {
  return async (req: Request, res: Response) => {
    await repo.removeItem(req.params.id as string);
    res.sendStatus(200);
  };
}
