import { UserService } from '../application/user-service';
import { User } from '../domain/user';
import { UserRepository } from '../ports/user-repository';
import * as bcryptjs from 'bcryptjs';
import * as jsonwebtoken from 'jsonwebtoken';

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
        jest.clearAllMocks();
        userRepo = {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findById: jest.fn(),
            findByOAuth: jest.fn(),
            update: jest.fn(),
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

        expect(bcryptjs.hash).toHaveBeenCalledWith('plain_password', 10);
        expect(userRepo.create).toHaveBeenCalledWith({
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            name: undefined,
            language: undefined,
            isGuest: undefined,
        });
        expect(result).toEqual(user);
    });

    it('registers a user with name', async () => {
        const user: User = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            name: 'Test User',
            createdAt: new Date(),
        };
        userRepo.create.mockResolvedValue(user);

        const result = await userService.register('test@example.com', 'plain_password', 'Test User');

        expect(bcryptjs.hash).toHaveBeenCalledWith('plain_password', 10);
        expect(userRepo.create).toHaveBeenCalledWith({
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            name: 'Test User',
            language: undefined,
            isGuest: undefined,
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

        expect(jsonwebtoken.sign).toHaveBeenCalled();
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
        const createdUser = {
            id: '1',
            email: 'user@example.com',
            passwordHash: '',
            createdAt: new Date(),
        };
        userRepo.create.mockResolvedValue(createdUser);

        const result = await userService.loginWithGoogle('some_token');

        // Теперь используется register
        expect(bcryptjs.hash).toHaveBeenCalledWith('', 10);
        expect(userRepo.create).toHaveBeenCalledWith({
            email: 'user@example.com',
            passwordHash: 'hashed_password',
            name: '',
            language: undefined,
            isGuest: false,
        });
        expect(jsonwebtoken.sign).toHaveBeenCalled();
        expect(result).toBe('mocked_jwt');
    });

    it('updates user email', async () => {
        const user: User = {
            id: '1',
            email: 'old@example.com',
            passwordHash: 'hashed_password',
            createdAt: new Date(),
        };
        const updatedUser: User = {
            ...user,
            email: 'new@example.com',
        };
        userRepo.findByEmail.mockResolvedValue(null);
        userRepo.update.mockResolvedValue(updatedUser);

        const result = await userService.updateEmail('1', 'new@example.com');

        expect(userRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
        expect(userRepo.update).toHaveBeenCalledWith('1', { email: 'new@example.com' });
        expect(result).toEqual(updatedUser);
    });

    it('throws error when updating email that already exists', async () => {
        const existingUser: User = {
            id: '2',
            email: 'existing@example.com',
            passwordHash: 'hashed_password',
            createdAt: new Date(),
        };
        userRepo.findByEmail.mockResolvedValue(existingUser);

        await expect(userService.updateEmail('1', 'existing@example.com')).rejects.toThrow('Email already exists');
        expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('allows updating email to same email for same user', async () => {
        const user: User = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            createdAt: new Date(),
        };
        userRepo.findByEmail.mockResolvedValue(user);
        userRepo.update.mockResolvedValue(user);

        const result = await userService.updateEmail('1', 'test@example.com');

        expect(userRepo.findByEmail).toHaveBeenCalledWith('test@example.com');
        expect(userRepo.update).toHaveBeenCalledWith('1', { email: 'test@example.com' });
        expect(result).toEqual(user);
    });

    it('updates user language', async () => {
        const user: User = {
            id: '1',
            email: 'test@example.com',
            passwordHash: 'hashed_password',
            language: 'en',
            createdAt: new Date(),
        };
        userRepo.update.mockResolvedValue(user);

        const result = await userService.updateLanguage('1', 'en');

        expect(userRepo.update).toHaveBeenCalledWith('1', { language: 'en' });
        expect(result).toEqual(user);
    });

    it('converts guest to regular user', async () => {
        const guestUser: User = {
            id: '1',
            email: 'guest-1@kotcat.com',
            passwordHash: 'old_hash',
            name: 'guest',
            isGuest: true,
            createdAt: new Date(),
        };
        const convertedUser: User = {
            id: '1',
            email: 'new@example.com',
            passwordHash: 'hashed_password',
            name: 'John Doe',
            language: 'en',
            isGuest: false,
            createdAt: guestUser.createdAt,
        };
        userRepo.findById.mockResolvedValue(guestUser);
        userRepo.findByEmail.mockResolvedValue(null);
        userRepo.update.mockResolvedValue(convertedUser);

        const result = await userService.convertGuestToUser(
            '1',
            'new@example.com',
            'newPassword123',
            'John Doe',
            'en'
        );

        expect(userRepo.findById).toHaveBeenCalledWith('1');
        expect(userRepo.findByEmail).toHaveBeenCalledWith('new@example.com');
        expect(bcryptjs.hash).toHaveBeenCalledWith('newPassword123', 10);
        expect(userRepo.update).toHaveBeenCalledWith('1', {
            email: 'new@example.com',
            passwordHash: 'hashed_password',
            name: 'John Doe',
            language: 'en',
            isGuest: false,
        });
        expect(result).toEqual(convertedUser);
    });

    it('throws error when converting non-guest user', async () => {
        const regularUser: User = {
            id: '1',
            email: 'user@example.com',
            passwordHash: 'hashed_password',
            isGuest: false,
            createdAt: new Date(),
        };
        userRepo.findById.mockResolvedValue(regularUser);

        await expect(
            userService.convertGuestToUser('1', 'new@example.com', 'password123')
        ).rejects.toThrow('User is not a guest');
        expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('throws error when converting guest but user not found', async () => {
        userRepo.findById.mockResolvedValue(null);

        await expect(
            userService.convertGuestToUser('1', 'new@example.com', 'password123')
        ).rejects.toThrow('User not found');
        expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('throws error when email already exists for guest conversion', async () => {
        const guestUser: User = {
            id: '1',
            email: 'guest-1@kotcat.com',
            passwordHash: 'old_hash',
            isGuest: true,
            createdAt: new Date(),
        };
        const existingUser: User = {
            id: '2',
            email: 'existing@example.com',
            passwordHash: 'hashed_password',
            createdAt: new Date(),
        };
        userRepo.findById.mockResolvedValue(guestUser);
        userRepo.findByEmail.mockResolvedValue(existingUser);

        await expect(
            userService.convertGuestToUser('1', 'existing@example.com', 'password123')
        ).rejects.toThrow('Email already exists');
        expect(userRepo.update).not.toHaveBeenCalled();
    });

    it('converts guest to user without name and language', async () => {
        const guestUser: User = {
            id: '1',
            email: 'guest-1@kotcat.com',
            passwordHash: 'old_hash',
            name: 'guest',
            isGuest: true,
            createdAt: new Date(),
        };
        const convertedUser: User = {
            id: '1',
            email: 'new@example.com',
            passwordHash: 'hashed_password',
            name: undefined,
            language: undefined,
            isGuest: false,
            createdAt: guestUser.createdAt,
        };
        userRepo.findById.mockResolvedValue(guestUser);
        userRepo.findByEmail.mockResolvedValue(null);
        userRepo.update.mockResolvedValue(convertedUser);

        const result = await userService.convertGuestToUser(
            '1',
            'new@example.com',
            'newPassword123'
        );

        expect(userRepo.update).toHaveBeenCalledWith('1', {
            email: 'new@example.com',
            passwordHash: 'hashed_password',
            name: undefined,
            language: undefined,
            isGuest: false,
        });
        expect(result).toEqual(convertedUser);
    });
});