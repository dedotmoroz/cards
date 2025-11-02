import { User } from '../domain/user';

export interface UserRepository {
    create(user: Omit<User, 'id' | 'createdAt'>): Promise<User>;
    findByEmail(email: string): Promise<User | null>;
    findById(id: string): Promise<User | null>;
    findByOAuth(provider: string, oauthId: string): Promise<User | null>;
    update(id: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User>;
}
