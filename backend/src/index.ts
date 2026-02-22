import express from 'express';
import path from 'path';
import { TodoRepository } from './domain/todo';
import { UserRepository } from './domain/user';
import { SqliteTodoRepository } from './infrastructure/SqliteTodoRepository';
import { MysqlTodoRepository } from './infrastructure/MysqlTodoRepository';
import { SqliteUserRepository } from './infrastructure/SqliteUserRepository';
import { MysqlUserRepository } from './infrastructure/MysqlUserRepository';
import { makeAuthMiddleware } from './middleware/auth';
import { getGreeting } from './routes/getGreeting';
import { makeGetItems } from './routes/getItems';
import { makeAddItem } from './routes/addItem';
import { makeUpdateItem } from './routes/updateItem';
import { makeDeleteItem } from './routes/deleteItem';
import { makeRegister, makeLogin, makeGetProfile, makeDeleteProfile, makeExportData } from './routes/auth';

function getJwtSecret(): string {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable is required in production');
  }
  return 'dev-secret-change-in-production';
}

const JWT_SECRET = getJwtSecret();

function createTodoRepository(): TodoRepository {
  if (process.env.MYSQL_HOST) {
    return new MysqlTodoRepository();
  }
  return new SqliteTodoRepository();
}

function createUserRepository(): UserRepository {
  if (process.env.MYSQL_HOST) {
    return new MysqlUserRepository();
  }
  return new SqliteUserRepository();
}

const todoRepo = createTodoRepository();
const userRepo = createUserRepository();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

const authMiddleware = makeAuthMiddleware(userRepo, JWT_SECRET);

// Public routes
app.get('/api/greeting', getGreeting);
app.post('/api/auth/register', makeRegister(userRepo));
app.post('/api/auth/login', makeLogin(userRepo, JWT_SECRET));

// Protected auth routes
app.get('/api/auth/profile', authMiddleware, makeGetProfile(userRepo));
app.delete('/api/auth/profile', authMiddleware, makeDeleteProfile(userRepo, todoRepo));
app.get('/api/auth/export', authMiddleware, makeExportData(userRepo, todoRepo));

// Protected todo routes
app.get('/api/items', authMiddleware, makeGetItems(todoRepo));
app.post('/api/items', authMiddleware, makeAddItem(todoRepo));
app.put('/api/items/:id', authMiddleware, makeUpdateItem(todoRepo));
app.delete('/api/items/:id', authMiddleware, makeDeleteItem(todoRepo));

Promise.all([todoRepo.init(), userRepo.init()])
  .then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });

const gracefulShutdown = () => {
  Promise.all([todoRepo.teardown(), userRepo.teardown()])
    .catch((err: unknown) => console.error('Shutdown error:', err))
    .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);
