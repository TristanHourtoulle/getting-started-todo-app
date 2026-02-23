export interface User {
    id: string;
    email: string;
    passwordHash: string;
    createdAt: Date;
}

export interface UserExportData {
    id: string;
    email: string;
    createdAt: string;
}

export interface UserRepository {
    init(): Promise<void>;
    teardown(): Promise<void>;
    createUser(user: User): Promise<void>;
    findByEmail(email: string): Promise<User | undefined>;
    findById(id: string): Promise<User | undefined>;
    deleteUser(id: string): Promise<void>;
    getAllUserData(id: string): Promise<UserExportData | null>;
}
