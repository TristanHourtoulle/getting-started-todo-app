import { TodoRepository } from '../../src/domain/todo';
import { UserRepository } from '../../src/domain/user';

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
        anonymizeItemsByUserId: jest.fn(),
        ...overrides,
    };
}

export function createMockUserRepo(
    overrides: Partial<MockedMethods<UserRepository>> = {},
): jest.Mocked<UserRepository> {
    return {
        init: jest.fn(),
        teardown: jest.fn(),
        createUser: jest.fn(),
        findByEmail: jest.fn(),
        findById: jest.fn(),
        deleteUser: jest.fn(),
        getAllUserData: jest.fn(),
        ...overrides,
    };
}
