import { makeUpdateItem } from '../../src/routes/updateItem';
import { TodoRepository } from '../../src/domain/todo';

const ITEM = { id: '12345', name: 'Test', completed: false };

const mockRepo: jest.Mocked<Pick<TodoRepository, 'getItem' | 'updateItem'>> = {
  getItem: jest.fn(),
  updateItem: jest.fn(),
};

const updateItem = makeUpdateItem(mockRepo as unknown as TodoRepository);

test('it updates items correctly', async () => {
  const req = {
    params: { id: '1234' },
    body: { name: 'New title', completed: false },
  };
  const res = { send: jest.fn() };

  mockRepo.getItem.mockResolvedValue(ITEM);

  await updateItem(req as any, res as any);

  expect(mockRepo.updateItem.mock.calls.length).toBe(1);
  expect(mockRepo.updateItem.mock.calls[0]?.[0]).toBe(req.params.id);
  expect(mockRepo.updateItem.mock.calls[0]?.[1]).toEqual({
    name: 'New title',
    completed: false,
  });

  expect(mockRepo.getItem.mock.calls.length).toBe(1);
  expect(mockRepo.getItem.mock.calls[0]?.[0]).toBe(req.params.id);

  expect(res.send.mock.calls[0]?.length).toBe(1);
  expect(res.send.mock.calls[0]?.[0]).toEqual(ITEM);
});

test('it passes partial body fields to updateItem', async () => {
  const req = {
    params: { id: '1234' },
    body: { completed: true },
  };
  const res = { send: jest.fn() };

  mockRepo.updateItem.mockClear();
  mockRepo.getItem.mockClear();
  mockRepo.getItem.mockResolvedValue(ITEM);

  await updateItem(req as any, res as any);

  expect(mockRepo.updateItem.mock.calls.length).toBe(1);
  expect(mockRepo.updateItem.mock.calls[0]?.[1]).toEqual({
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

  mockRepo.updateItem.mockClear();
  mockRepo.getItem.mockClear();
  mockRepo.getItem.mockResolvedValue(undefined);

  await updateItem(req as any, res as any);

  expect(mockRepo.updateItem.mock.calls.length).toBe(1);
  expect(mockRepo.updateItem.mock.calls[0]?.[0]).toBe('non-existent-id');
  expect(mockRepo.getItem.mock.calls.length).toBe(1);
  expect(mockRepo.getItem.mock.calls[0]?.[0]).toBe('non-existent-id');
  expect(res.send.mock.calls[0]?.[0]).toBeUndefined();
});
