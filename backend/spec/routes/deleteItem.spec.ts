import { makeDeleteItem } from '../../src/routes/deleteItem';
import { createMockRepo } from '../helpers/createMockRepo';

const ITEM = { id: '12345', name: 'Test', completed: false, userId: 'user-1' };

const mockRepo = createMockRepo();
const deleteItem = makeDeleteItem(mockRepo);

test('it removes item correctly', async () => {
    const req = { params: { id: '12345' }, userId: 'user-1' };
    const res = {
        sendStatus: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    mockRepo.getItem.mockResolvedValue(ITEM);

    await deleteItem(req as any, res as any);

    expect(mockRepo.removeItem).toHaveBeenCalledTimes(1);
    expect(mockRepo.removeItem).toHaveBeenCalledWith('12345');
    expect(res.sendStatus).toHaveBeenCalledWith(200);
});

test('it returns 404 when item does not exist', async () => {
    const req = { params: { id: 'non-existent-id' }, userId: 'user-1' };
    const res = {
        sendStatus: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    mockRepo.removeItem.mockClear();
    mockRepo.getItem.mockClear();
    mockRepo.getItem.mockResolvedValue(undefined);

    await deleteItem(req as any, res as any);

    expect(mockRepo.removeItem).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
});

test('it returns 404 when item belongs to another user', async () => {
    const req = { params: { id: '12345' }, userId: 'different-user' };
    const res = {
        sendStatus: jest.fn(),
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
    };

    mockRepo.removeItem.mockClear();
    mockRepo.getItem.mockClear();
    mockRepo.getItem.mockResolvedValue(ITEM);

    await deleteItem(req as any, res as any);

    expect(mockRepo.removeItem).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
});
