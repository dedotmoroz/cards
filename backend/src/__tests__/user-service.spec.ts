import { UserService } from '../application/user-service';
import { User } from '../domain/user';
import { UserRepository } from '../ports/user-repository';
import { hash, compare } from 'bcryptjs';

jest.mock('bcryptjs', () => ({
    hash: jest.fn(() => Promise.resolve('hashed_password')),
    compare: jest.fn((a: string, b: string) => Promise.resolve(a === b)),
}));

jest.mock('jsonwebtoken', () => ({
    sign: jest.fn(() => 'mocked_jwt'),
}));

describe('UserService', () => {
    let userRepo: jest.Mocked<UserRepository>;
    let userService: UserService;

    beforeEach(() => {
        process.env.JWT_SECRET = 'test_secret';
        userRepo = {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByOAuth: jest.fn(),
        };
        userService = new UserService(userRepo);
    });

    it('registers a user with hashed password', async () => {
        const user: User = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            createdAt: new Date(),
        };
        userRepo.create.mockResolvedValue(user);

        const result = await userService.register('test@example.com', 'plain_password');

        expect(hash).toHaveBeenCalledWith('plain_password', 10);
        expect(userRepo.create).toHaveBeenCalledWith({
            email: 'test@example.com',
            passwordHash: 'hashed_password',
        });
        expect(result).toEqual(user);
    });

    it('returns JWT token on successful login', async () => {
        const user: User = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'plain_password',
            createdAt: new Date(),
        };
        userRepo.findByEmail.mockResolvedValue(user);

        const result = await userService.login('test@example.com', 'plain_password');

        expect(result).toBe('mocked_jwt');
    });

    it('returns null if user not found on login', async () => {
        userRepo.findByEmail.mockResolvedValue(null);

        const result = await userService.login('no@example.com', 'password');

        expect(result).toBeNull();
    });

    it('returns null if password does not match', async () => {
        const user: User = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'wrong_password',
            createdAt: new Date(),
        };
        userRepo.findByEmail.mockResolvedValue(user);

        const result = await userService.login('test@example.com', 'not_matching');

        expect(result).toBeNull();
    });

    it('registers user on Google login if not found', async () => {
        userRepo.findByEmail.mockResolvedValue(null);
        userRepo.create.mockResolvedValue({
            id: '1',
            email: 'user@example.com',
            passwordHash: '',
            createdAt: new Date(),
        });

        const result = await userService.loginWithGoogle('some_token');

        expect(userRepo.create).toHaveBeenCalledWith({
            email: 'user@example.com',
            passwordHash: '',
        });
        expect(result).toBe('mocked_jwt');
    });
});