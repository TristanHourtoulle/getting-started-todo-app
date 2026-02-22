import { TodoItem, TodoRepository } from '../domain/todo';

export class InMemoryTodoRepository implements TodoRepository {
  private items: Map<string, TodoItem> = new Map();

  async init(): Promise<void> {
    this.items.clear();
  }

  async teardown(): Promise<void> {
    this.items.clear();
  }

  async getItems(): Promise<TodoItem[]> {
    return Array.from(this.items.values());
  }

  async getItem(id: string): Promise<TodoItem | undefined> {
    return this.items.get(id);
  }

  async storeItem(item: TodoItem): Promise<void> {
    this.items.set(item.id, { ...item });
  }

  async updateItem(id: string, updates: Partial<TodoItem>): Promise<void> {
    const existing = this.items.get(id);
    if (!existing) return;
    this.items.set(id, { ...existing, ...updates, id });
  }

  async removeItem(id: string): Promise<void> {
    this.items.delete(id);
  }
}
