import { makeAddItem } from '../../src/routes/addItem';
import { createMockRepo } from '../helpers/createMockRepo';
import { v4 as uuid } from 'uuid';

jest.mock('uuid', () => ({ v4: jest.fn() }));

const mockRepo = createMockRepo();
const addItem = makeAddItem(mockRepo);

test('it stores item correctly', async () => {
  const id = 'something-not-a-uuid';
  const name = 'A sample item';
  const req = { body: { name } };
  const res = { send: jest.fn() };

  (uuid as jest.Mock).mockReturnValue(id);

  await addItem(req as any, res as any);

  const expectedItem = { id, name, completed: false };

  expect(mockRepo.storeItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.storeItem).toHaveBeenCalledWith(expectedItem);
  expect(res.send).toHaveBeenCalledTimes(1);
  expect(res.send).toHaveBeenCalledWith(expectedItem);
});

test('it stores item with undefined name when body has no name', async () => {
  const id = 'another-uuid';
  const req = { body: {} };
  const res = { send: jest.fn() };

  (uuid as jest.Mock).mockReturnValue(id);
  mockRepo.storeItem.mockClear();

  await addItem(req as any, res as any);

  const expectedItem = { id, name: undefined, completed: false };

  expect(mockRepo.storeItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.storeItem).toHaveBeenCalledWith(expectedItem);
  expect(res.send).toHaveBeenCalledWith(expectedItem);
});
