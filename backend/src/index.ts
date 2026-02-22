import express from 'express';
import path from 'path';
import { TodoRepository } from './domain/todo';
import { SqliteTodoRepository } from './infrastructure/SqliteTodoRepository';
import { MysqlTodoRepository } from './infrastructure/MysqlTodoRepository';
import { getGreeting } from './routes/getGreeting';
import { makeGetItems } from './routes/getItems';
import { makeAddItem } from './routes/addItem';
import { makeUpdateItem } from './routes/updateItem';
import { makeDeleteItem } from './routes/deleteItem';

function createRepository(): TodoRepository {
  if (process.env.MYSQL_HOST) {
    return new MysqlTodoRepository();
  }
  return new SqliteTodoRepository();
}

const repo = createRepository();
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'static')));

app.get('/api/greeting', getGreeting);
app.get('/api/items', makeGetItems(repo));
app.post('/api/items', makeAddItem(repo));
app.put('/api/items/:id', makeUpdateItem(repo));
app.delete('/api/items/:id', makeDeleteItem(repo));

repo
  .init()
  .then(() => {
    app.listen(3000, () => console.log('Listening on port 3000'));
  })
  .catch((err: unknown) => {
    console.error(err);
    process.exit(1);
  });

const gracefulShutdown = () => {
  repo
    .teardown()
    .catch((err: unknown) => console.error('Shutdown error:', err))
    .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown);
