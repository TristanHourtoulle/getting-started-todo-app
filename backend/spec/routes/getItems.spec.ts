import { makeGetItems } from '../../src/routes/getItems';
import { createMockRepo } from '../helpers/createMockRepo';

const ITEMS = [
    { id: '12345', name: 'Test', completed: false, userId: 'user-1' },
];

const mockRepo = createMockRepo();
const getItems = makeGetItems(mockRepo);

test('it gets items correctly', async () => {
    const req = { userId: 'user-1' };
    const res = { send: jest.fn() };
    mockRepo.getItems.mockResolvedValue(ITEMS);

    await getItems(req as any, res as any);

    expect(mockRepo.getItems).toHaveBeenCalledTimes(1);
    expect(mockRepo.getItems).toHaveBeenCalledWith('user-1');
    expect(res.send).toHaveBeenCalledTimes(1);
    expect(res.send).toHaveBeenCalledWith(ITEMS);
});
