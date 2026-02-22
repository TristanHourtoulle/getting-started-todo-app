export {};
/* eslint-disable @typescript-eslint/no-var-requires */
const db = require('../../src/persistence');
const addItem = require('../../src/routes/addItem');
const { v4: uuid } = require('uuid');

jest.mock('uuid', () => ({ v4: jest.fn() }));

jest.mock('../../src/persistence', () => ({
    removeItem: jest.fn(),
    storeItem: jest.fn(),
    getItem: jest.fn(),
}));

test('it stores item correctly', async () => {
    const id = 'something-not-a-uuid';
    const name = 'A sample item';
    const req = { body: { name } };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);

    await addItem(req, res);

    const expectedItem = { id, name, completed: false };

    expect(db.storeItem.mock.calls.length).toBe(1);
    expect(db.storeItem.mock.calls[0][0]).toEqual(expectedItem);
    expect(res.send.mock.calls[0].length).toBe(1);
    expect(res.send.mock.calls[0][0]).toEqual(expectedItem);
});

test('it stores item with undefined name when body has no name', async () => {
    const id = 'another-uuid';
    const req = { body: {} };
    const res = { send: jest.fn() };

    uuid.mockReturnValue(id);
    db.storeItem.mockClear();

    await addItem(req, res);

    const expectedItem = { id, name: undefined, completed: false };

    expect(db.storeItem.mock.calls.length).toBe(1);
    expect(db.storeItem.mock.calls[0][0]).toEqual(expectedItem);
    expect(res.send.mock.calls[0][0]).toEqual(expectedItem);
});
