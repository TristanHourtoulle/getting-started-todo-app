import fs from 'fs';
import path from 'path';
import os from 'os';
import { SqliteTodoRepository } from '../../src/infrastructure/SqliteTodoRepository';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'todo-test-'));
const location = path.join(tmpDir, 'todo.db');

const USER_ID = 'test-user-1';

const ITEM = {
  id: '7aef3d7c-d301-4846-8358-2a91ec9d6be3',
  name: 'Test',
  completed: false,
  userId: USER_ID,
};

let db: SqliteTodoRepository;

beforeEach(() => {
  if (fs.existsSync(location)) {
    fs.unlinkSync(location);
  }
  db = new SqliteTodoRepository(location);
});

afterEach(async () => {
  await db.teardown();
});

afterAll(() => {
  if (fs.existsSync(location)) {
    fs.unlinkSync(location);
  }
  if (fs.existsSync(tmpDir)) {
    fs.rmdirSync(tmpDir);
  }
});

test('it initializes correctly', async () => {
  await db.init();
});

test('it can store and retrieve items', async () => {
  await db.init();

  await db.storeItem(ITEM);

  const items = await db.getItems(USER_ID);
  expect(items.length).toBe(1);
  expect(items[0]).toEqual(ITEM);
});

test('it can update an existing item', async () => {
  await db.init();

  const initialItems = await db.getItems(USER_ID);
  expect(initialItems.length).toBe(0);

  await db.storeItem(ITEM);

  await db.updateItem(ITEM.id, { ...ITEM, completed: !ITEM.completed });

  const items = await db.getItems(USER_ID);
  expect(items.length).toBe(1);
  expect(items[0]?.completed).toBe(!ITEM.completed);
});

test('it can remove an existing item', async () => {
  await db.init();
  await db.storeItem(ITEM);

  await db.removeItem(ITEM.id);

  const items = await db.getItems(USER_ID);
  expect(items.length).toBe(0);
});

test('it can get a single item', async () => {
  await db.init();
  await db.storeItem(ITEM);

  const item = await db.getItem(ITEM.id);
  expect(item).toEqual(ITEM);
});

test('it only returns items for the specified user', async () => {
  await db.init();

  await db.storeItem(ITEM);
  await db.storeItem({ id: 'other-item', name: 'Other', completed: false, userId: 'other-user' });

  const items = await db.getItems(USER_ID);
  expect(items.length).toBe(1);
  expect(items[0]?.id).toBe(ITEM.id);
});

test('it can remove all items for a user', async () => {
  await db.init();

  await db.storeItem(ITEM);
  await db.storeItem({ id: 'item-2', name: 'Second', completed: false, userId: USER_ID });
  await db.storeItem({ id: 'other-item', name: 'Other', completed: false, userId: 'other-user' });

  await db.removeItemsByUserId(USER_ID);

  const userItems = await db.getItems(USER_ID);
  expect(userItems.length).toBe(0);

  const otherItems = await db.getItems('other-user');
  expect(otherItems.length).toBe(1);
});
