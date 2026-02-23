import { User, UserRepository, UserExportData } from '../domain/user';

export class InMemoryUserRepository implements UserRepository {
  private users: Map<string, User> = new Map();

  async init(): Promise<void> {
    this.users.clear();
  }

  async teardown(): Promise<void> {
    this.users.clear();
  }

  async createUser(user: User): Promise<void> {
    this.users.set(user.id, { ...user });
  }

  async findByEmail(email: string): Promise<User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return { ...user };
    }
    return undefined;
  }

  async findById(id: string): Promise<User | undefined> {
    const user = this.users.get(id);
    return user ? { ...user } : undefined;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async getAllUserData(id: string): Promise<UserExportData | null> {
    const user = this.users.get(id);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
    };
  }
}
