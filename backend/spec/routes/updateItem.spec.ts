import { makeUpdateItem } from '../../src/routes/updateItem';
import { createMockRepo } from '../helpers/createMockRepo';

const ITEM = { id: '12345', name: 'Test', completed: false, userId: 'user-1' };

const mockRepo = createMockRepo();
const updateItem = makeUpdateItem(mockRepo);

test('it updates items correctly', async () => {
    const req = {
        params: { id: '12345' },
        body: { name: 'New title', completed: false },
        userId: 'user-1',
    };
    const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    mockRepo.getItem.mockResolvedValue(ITEM);

    await updateItem(req as any, res as any);

    expect(mockRepo.updateItem).toHaveBeenCalledTimes(1);
    expect(mockRepo.updateItem).toHaveBeenCalledWith('12345', {
        name: 'New title',
        completed: false,
    });

    expect(res.send).toHaveBeenCalledTimes(1);
});

test('it passes partial body fields to updateItem', async () => {
    const req = {
        params: { id: '12345' },
        body: { completed: true },
        userId: 'user-1',
    };
    const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    mockRepo.updateItem.mockClear();
    mockRepo.getItem.mockClear();
    mockRepo.getItem
        .mockResolvedValueOnce(ITEM)
        .mockResolvedValueOnce({ ...ITEM, completed: true });

    await updateItem(req as any, res as any);

    expect(mockRepo.updateItem).toHaveBeenCalledTimes(1);
    expect(mockRepo.updateItem).toHaveBeenCalledWith('12345', {
        name: undefined,
        completed: true,
    });
});

test('it returns 404 when item does not exist', async () => {
    const req = {
        params: { id: 'non-existent-id' },
        body: { name: 'Updated', completed: true },
        userId: 'user-1',
    };
    const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    mockRepo.updateItem.mockClear();
    mockRepo.getItem.mockClear();
    mockRepo.getItem.mockResolvedValue(undefined);

    await updateItem(req as any, res as any);

    expect(mockRepo.updateItem).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
});

test('it returns 404 when item belongs to another user', async () => {
    const req = {
        params: { id: '12345' },
        body: { name: 'Updated', completed: true },
        userId: 'different-user',
    };
    const res = {
        send: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    mockRepo.updateItem.mockClear();
    mockRepo.getItem.mockClear();
    mockRepo.getItem.mockResolvedValue(ITEM);

    await updateItem(req as any, res as any);

    expect(mockRepo.updateItem).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
});
