import jwt from 'jsonwebtoken';
import { makeAuthMiddleware } from '../../src/middleware/auth';
import { createMockUserRepo } from '../helpers/createMockRepo';

const JWT_SECRET = 'test-secret';
const mockUserRepo = createMockUserRepo();
const authMiddleware = makeAuthMiddleware(mockUserRepo, JWT_SECRET);

function createRes() {
  const res: any = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
  };
  return res;
}

beforeEach(() => {
  jest.clearAllMocks();
});

test('it rejects requests without authorization header', async () => {
  const req: any = { headers: {} };
  const res = createRes();
  const next = jest.fn();

  await authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

test('it rejects requests with invalid token format', async () => {
  const req: any = { headers: { authorization: 'InvalidFormat token' } };
  const res = createRes();
  const next = jest.fn();

  await authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

test('it rejects requests with invalid JWT signature', async () => {
  const token = jwt.sign({ userId: 'user-1' }, 'wrong-secret');
  const req: any = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  const next = jest.fn();

  await authMiddleware(req, res, next);

  expect(res.status).toHaveBeenCalledWith(401);
  expect(next).not.toHaveBeenCalled();
});

test('it rejects requests when user no longer exists (RGPD deletion)', async () => {
  const token = jwt.sign({ userId: 'deleted-user' }, JWT_SECRET);
  const req: any = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  const next = jest.fn();

  mockUserRepo.findById.mockResolvedValue(undefined);

  await authMiddleware(req, res, next);

  expect(mockUserRepo.findById).toHaveBeenCalledWith('deleted-user');
  expect(res.status).toHaveBeenCalledWith(401);
  expect(res.json).toHaveBeenCalledWith({ error: 'User no longer exists' });
  expect(next).not.toHaveBeenCalled();
});

test('it allows valid requests and injects userId', async () => {
  const user = { id: 'user-1', email: 'test@test.com', passwordHash: 'hash', createdAt: new Date() };
  const token = jwt.sign({ userId: 'user-1' }, JWT_SECRET);
  const req: any = { headers: { authorization: `Bearer ${token}` } };
  const res = createRes();
  const next = jest.fn();

  mockUserRepo.findById.mockResolvedValue(user);

  await authMiddleware(req, res, next);

  expect(req.userId).toBe('user-1');
  expect(next).toHaveBeenCalledTimes(1);
});
