import { Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../persistence');

module.exports = async (req: Request, res: Response) => {
    const item = {
        id: uuid(),
        name: req.body.name,
        completed: false,
    };

    await db.storeItem(item);
    res.send(item);
};
