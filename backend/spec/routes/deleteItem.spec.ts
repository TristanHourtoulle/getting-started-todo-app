import { makeDeleteItem } from '../../src/routes/deleteItem';
import { TodoRepository } from '../../src/domain/todo';

const mockRepo: jest.Mocked<Pick<TodoRepository, 'removeItem' | 'getItem'>> = {
  removeItem: jest.fn(),
  getItem: jest.fn(),
};

const deleteItem = makeDeleteItem(mockRepo as unknown as TodoRepository);

test('it removes item correctly', async () => {
  const req = { params: { id: '12345' } };
  const res = { sendStatus: jest.fn() };

  await deleteItem(req as any, res as any);

  expect(mockRepo.removeItem.mock.calls.length).toBe(1);
  expect(mockRepo.removeItem.mock.calls[0]?.[0]).toBe(req.params.id);
  expect(res.sendStatus.mock.calls[0]?.length).toBe(1);
  expect(res.sendStatus.mock.calls[0]?.[0]).toBe(200);
});

test('it calls removeItem even if item does not exist', async () => {
  const req = { params: { id: 'non-existent-id' } };
  const res = { sendStatus: jest.fn() };

  mockRepo.removeItem.mockClear();

  await deleteItem(req as any, res as any);

  expect(mockRepo.removeItem.mock.calls.length).toBe(1);
  expect(mockRepo.removeItem.mock.calls[0]?.[0]).toBe('non-existent-id');
  expect(res.sendStatus.mock.calls[0]?.[0]).toBe(200);
});
