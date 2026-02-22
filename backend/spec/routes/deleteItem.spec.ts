import { makeDeleteItem } from '../../src/routes/deleteItem';
import { createMockRepo } from '../helpers/createMockRepo';

const mockRepo = createMockRepo();
const deleteItem = makeDeleteItem(mockRepo);

test('it removes item correctly', async () => {
  const req = { params: { id: '12345' } };
  const res = { sendStatus: jest.fn() };

  await deleteItem(req as any, res as any);

  expect(mockRepo.removeItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.removeItem).toHaveBeenCalledWith('12345');
  expect(res.sendStatus).toHaveBeenCalledTimes(1);
  expect(res.sendStatus).toHaveBeenCalledWith(200);
});

test('it calls removeItem even if item does not exist', async () => {
  const req = { params: { id: 'non-existent-id' } };
  const res = { sendStatus: jest.fn() };

  mockRepo.removeItem.mockClear();

  await deleteItem(req as any, res as any);

  expect(mockRepo.removeItem).toHaveBeenCalledTimes(1);
  expect(mockRepo.removeItem).toHaveBeenCalledWith('non-existent-id');
  expect(res.sendStatus).toHaveBeenCalledWith(200);
});
