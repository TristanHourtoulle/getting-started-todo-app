import { makeAddItem } from '../../src/routes/addItem';
import { TodoRepository } from '../../src/domain/todo';
import { v4 as uuid } from 'uuid';

jest.mock('uuid', () => ({ v4: jest.fn() }));

const mockRepo: jest.Mocked<Pick<TodoRepository, 'storeItem' | 'getItem' | 'removeItem'>> = {
  removeItem: jest.fn(),
  storeItem: jest.fn(),
  getItem: jest.fn(),
};

const addItem = makeAddItem(mockRepo as unknown as TodoRepository);

test('it stores item correctly', async () => {
  const id = 'something-not-a-uuid';
  const name = 'A sample item';
  const req = { body: { name } };
  const res = { send: jest.fn() };

  (uuid as jest.Mock).mockReturnValue(id);

  await addItem(req as any, res as any);

  const expectedItem = { id, name, completed: false };

  expect(mockRepo.storeItem.mock.calls.length).toBe(1);
  expect(mockRepo.storeItem.mock.calls[0]?.[0]).toEqual(expectedItem);
  expect(res.send.mock.calls[0]?.length).toBe(1);
  expect(res.send.mock.calls[0]?.[0]).toEqual(expectedItem);
});

test('it stores item with undefined name when body has no name', async () => {
  const id = 'another-uuid';
  const req = { body: {} };
  const res = { send: jest.fn() };

  (uuid as jest.Mock).mockReturnValue(id);
  mockRepo.storeItem.mockClear();

  await addItem(req as any, res as any);

  const expectedItem = { id, name: undefined, completed: false };

  expect(mockRepo.storeItem.mock.calls.length).toBe(1);
  expect(mockRepo.storeItem.mock.calls[0]?.[0]).toEqual(expectedItem);
  expect(res.send.mock.calls[0]?.[0]).toEqual(expectedItem);
});
