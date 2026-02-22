import { TodoRepository } from '../../src/domain/todo';

type MockedMethods<T> = {
  [K in keyof T]: jest.Mock;
};

export function createMockRepo(
  overrides: Partial<MockedMethods<TodoRepository>> = {},
): jest.Mocked<TodoRepository> {
  return {
    init: jest.fn(),
    teardown: jest.fn(),
    getItems: jest.fn(),
    getItem: jest.fn(),
    storeItem: jest.fn(),
    updateItem: jest.fn(),
    removeItem: jest.fn(),
    ...overrides,
  };
}
