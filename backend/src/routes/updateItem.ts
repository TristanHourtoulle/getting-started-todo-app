import { Request, Response } from 'express';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const db = require('../persistence');

module.exports = async (req: Request, res: Response) => {
    await db.updateItem(req.params.id, {
        name: req.body.name,
        completed: req.body.completed,
    });
    const item = await db.getItem(req.params.id);
    res.send(item);
};
