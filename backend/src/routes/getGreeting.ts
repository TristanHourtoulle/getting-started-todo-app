import { Request, Response } from 'express';

const GREETING = 'Hello world!';

export async function getGreeting(_req: Request, res: Response) {
  res.send({ greeting: GREETING });
}
