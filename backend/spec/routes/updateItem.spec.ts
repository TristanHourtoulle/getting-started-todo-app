import { makeUpdateItem } from '../../src/routes/updateItem';
import { createMockRepo } from '../helpers/createMockRepo';

const ITEM = { id: '12345', name: 'Test', completed: false };

const mockRepo = createMockRepo();
const updateItem = makeUpdateItem(mockRepo);

test('it updates items correctly', async () => {
  const req = {
    params: { id: '1234' },
    body: { name: 'New title', completed: false },
  };
  const res = { send: jest.fn() };

  mockRepo.getItem.mockResolvedValue(ITEM);

  await updateItem(req as any, res as any);

  expect(mockRepo.updateItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.updateItem).toHaveBeenCalledWith('1234', {
    name: 'New title',
    completed: false,
  });

  expect(mockRepo.getItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.getItem).toHaveBeenCalledWith('1234');

  expect(res.send).toHaveBeenCalledTimes(1);
  expect(res.send).toHaveBeenCalledWith(ITEM);
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

  expect(mockRepo.updateItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.updateItem).toHaveBeenCalledWith('1234', {
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

  expect(mockRepo.updateItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.updateItem).toHaveBeenCalledWith('non-existent-id', {
    name: 'Updated',
    completed: true,
  });
  expect(mockRepo.getItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.getItem).toHaveBeenCalledWith('non-existent-id');
  expect(res.send).toHaveBeenCalledWith(undefined);
});
