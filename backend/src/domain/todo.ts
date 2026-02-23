export interface TodoItem {
  id: string;
  name: string;
  completed: boolean;
  userId: string;
}

export interface TodoRepository {
  init(): Promise<void>;
  teardown(): Promise<void>;
  getItems(userId: string): Promise<TodoItem[]>;
  getItem(id: string): Promise<TodoItem | undefined>;
  storeItem(item: TodoItem): Promise<void>;
  updateItem(id: string, item: Partial<TodoItem>): Promise<void>;
  removeItem(id: string): Promise<void>;
  removeItemsByUserId(userId: string): Promise<void>;
}
