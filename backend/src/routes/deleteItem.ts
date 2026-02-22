import { Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../persistence');

module.exports = async (req: Request, res: Response) => {
    await db.removeItem(req.params.id);
    res.sendStatus(200);
};
