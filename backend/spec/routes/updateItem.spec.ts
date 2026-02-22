export {};
/* eslint-disable @typescript-eslint/no-var-requires */
const db = require('../../src/persistence');
const updateItem = require('../../src/routes/updateItem');
const ITEM = { id: 12345 };

jest.mock('../../src/persistence', () => ({
    getItem: jest.fn(),
    updateItem: jest.fn(),
}));

test('it updates items correctly', async () => {
    const req = {
        params: { id: 1234 },
        body: { name: 'New title', completed: false },
    };
    const res = { send: jest.fn() };

    db.getItem.mockReturnValue(Promise.resolve(ITEM));

    await updateItem(req, res);

    expect(db.updateItem.mock.calls.length).toBe(1);
    expect(db.updateItem.mock.calls[0][0]).toBe(req.params.id);
    expect(db.updateItem.mock.calls[0][1]).toEqual({
        name: 'New title',
        completed: false,
    });

    expect(db.getItem.mock.calls.length).toBe(1);
    expect(db.getItem.mock.calls[0][0]).toBe(req.params.id);

    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(ITEM);
});

test('it passes partial body fields to updateItem', async () => {
    const req = {
        params: { id: 1234 },
        body: { completed: true },
    };
    const res = { send: jest.fn() };

    db.updateItem.mockClear();
    db.getItem.mockClear();
    db.getItem.mockReturnValue(Promise.resolve(ITEM));

    await updateItem(req, res);

    expect(db.updateItem.mock.calls.length).toBe(1);
    expect(db.updateItem.mock.calls[0][1]).toEqual({
        name: undefined,
        completed: true,
    });
});

test('it sends undefined when updating a non-existent item', async () => {
    const req = {
        params: { id: 'non-existent-id' },
        body: { name: 'Updated', completed: true },
    };
    const res = { send: jest.fn() };

    db.updateItem.mockClear();
    db.getItem.mockClear();
    db.getItem.mockReturnValue(Promise.resolve(undefined));

    await updateItem(req, res);

    expect(db.updateItem.mock.calls.length).toBe(1);
    expect(db.updateItem.mock.calls[0][0]).toBe('non-existent-id');
    expect(db.getItem.mock.calls.length).toBe(1);
    expect(db.getItem.mock.calls[0][0]).toBe('non-existent-id');
    expect(res.send.mock.calls[0][0]).toBeUndefined();
});
