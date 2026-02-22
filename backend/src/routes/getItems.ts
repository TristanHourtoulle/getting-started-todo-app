import { Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../persistence');

module.exports = async (_req: Request, res: Response) => {
    const items = await db.getItems();
    res.send(items);
};
