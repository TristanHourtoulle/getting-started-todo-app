import { Request, Response } from 'express';
import { TodoRepository } from '../domain/todo';

export function makeDeleteItem(repo: TodoRepository) {
  return async (req: Request<{ id: string }>, res: Response) => {
    await repo.removeItem(req.params.id);
    res.sendStatus(200);
  };
}
