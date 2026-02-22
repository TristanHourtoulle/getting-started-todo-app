import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { makeRegister, makeLogin, makeGetProfile, makeDeleteProfile, makeExportData } from '../../src/routes/auth';
import { createMockRepo, createMockUserRepo } from '../helpers/createMockRepo';

const JWT_SECRET = 'test-secret';
const mockUserRepo = createMockUserRepo();
const mockTodoRepo = createMockRepo();

function createRes() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('register', () => {
  const register = makeRegister(mockUserRepo);

  test('it creates a new user', async () => {
    const req: any = { body: { email: 'test@example.com', password: 'password123' } };
    const res = createRes();

    mockUserRepo.findByEmail.mockResolvedValue(undefined);

    await register(req, res);

    expect(mockUserRepo.createUser).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(201);
  });

  test('it returns 400 when email is missing', async () => {
    const req: any = { body: { password: 'password123' } };
    const res = createRes();

    await register(req, res);

    expect(mockUserRepo.createUser).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(400);
  });

  test('it returns 409 when email already exists', async () => {
    const req: any = { body: { email: 'existing@example.com', password: 'password123' } };
    const res = createRes();

    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'existing-id',
      email: 'existing@example.com',
      passwordHash: 'hash',
      createdAt: new Date(),
    });

    await register(req, res);

    expect(mockUserRepo.createUser).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(409);
  });
});

describe('login', () => {
  const login = makeLogin(mockUserRepo, JWT_SECRET);

  test('it returns a JWT token for valid credentials', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const req: any = { body: { email: 'test@example.com', password: 'password123' } };
    const res = createRes();

    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash,
      createdAt: new Date(),
    });

    await login(req, res);

    expect(res.json).toHaveBeenCalledTimes(1);
    const token = res.json.mock.calls[0][0].token;
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    expect(decoded.userId).toBe('user-1');
  });

  test('it returns 401 for non-existent email', async () => {
    const req: any = { body: { email: 'unknown@example.com', password: 'password123' } };
    const res = createRes();

    mockUserRepo.findByEmail.mockResolvedValue(undefined);

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });

  test('it returns 401 for wrong password', async () => {
    const passwordHash = await bcrypt.hash('correct-password', 10);
    const req: any = { body: { email: 'test@example.com', password: 'wrong-password' } };
    const res = createRes();

    mockUserRepo.findByEmail.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash,
      createdAt: new Date(),
    });

    await login(req, res);

    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe('getProfile', () => {
  const getProfile = makeGetProfile(mockUserRepo);

  test('it returns user profile without passwordHash', async () => {
    const req: any = { userId: 'user-1' };
    const res = createRes();

    mockUserRepo.findById.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'secret-hash',
      createdAt: new Date('2024-01-01'),
    });

    await getProfile(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.id).toBe('user-1');
    expect(response.email).toBe('test@example.com');
    expect(response.passwordHash).toBeUndefined();
  });
});

describe('deleteProfile', () => {
  const deleteProfile = makeDeleteProfile(mockUserRepo, mockTodoRepo);

  test('it deletes all user todos then the user account', async () => {
    const req: any = { userId: 'user-1' };
    const res = createRes();

    await deleteProfile(req, res);

    expect(mockTodoRepo.removeItemsByUserId).toHaveBeenCalledWith('user-1');
    expect(mockUserRepo.deleteUser).toHaveBeenCalledWith('user-1');
    expect(res.json).toHaveBeenCalledWith({ message: 'Account and all associated data deleted' });
  });
});

describe('exportData', () => {
  const exportData = makeExportData(mockUserRepo, mockTodoRepo);

  test('it returns user data and todos', async () => {
    const req: any = { userId: 'user-1' };
    const res = createRes();

    mockUserRepo.getAllUserData.mockResolvedValue({
      id: 'user-1',
      email: 'test@example.com',
      createdAt: '2024-01-01',
    });
    mockTodoRepo.getItems.mockResolvedValue([
      { id: 'todo-1', name: 'Test todo', completed: false, userId: 'user-1' },
    ]);

    await exportData(req, res);

    const response = res.json.mock.calls[0][0];
    expect(response.user).toBeDefined();
    expect(response.todos).toHaveLength(1);
  });
});
