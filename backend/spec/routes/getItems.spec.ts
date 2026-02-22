import { makeGetItems } from '../../src/routes/getItems';
import { TodoRepository } from '../../src/domain/todo';

const ITEMS = [{ id: '12345', name: 'Test', completed: false }];

const mockRepo: jest.Mocked<Pick<TodoRepository, 'getItems'>> = {
  getItems: jest.fn(),
};

const getItems = makeGetItems(mockRepo as unknown as TodoRepository);

test('it gets items correctly', async () => {
  const req = {};
  const res = { send: jest.fn() };
  mockRepo.getItems.mockResolvedValue(ITEMS);

  await getItems(req as any, res as any);

  expect(mockRepo.getItems.mock.calls.length).toBe(1);
  expect(res.send.mock.calls[0]?.length).toBe(1);
  expect(res.send.mock.calls[0]?.[0]).toEqual(ITEMS);
});
