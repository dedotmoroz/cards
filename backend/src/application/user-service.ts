import { randomUUID } from 'crypto';
import { User } from '../domain/user';
import { UserRepository } from '../ports/user-repository';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

export class UserService {
    private readonly jwtSecret: string;

    constructor(private userRepo: UserRepository) {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        this.jwtSecret = JWT_SECRET;
    }


    async register(email: string, password: string, name?: string, language?: string, isGuest?: boolean): Promise<User> {
        const passwordHash = await hash(password, 10);
        return this.userRepo.create({ email, passwordHash, name, language, isGuest });
    }

    async login(email: string, password: string): Promise<string | null> {
        const user = await this.userRepo.findByEmail(email);
        if (!user) return null;

        const isMatch = await compare(password, user.passwordHash);
        if (!isMatch) return null;

        return jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });
    }

    async getById(userId: string): Promise<User | null> {
        return this.userRepo.findById(userId);
    }

    async updateName(userId: string, name: string): Promise<User> {
        return this.userRepo.update(userId, { name });
    }

    async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<User> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }

        const isOldPasswordValid = await compare(oldPassword, user.passwordHash);
        if (!isOldPasswordValid) {
            throw new Error('Invalid old password');
        }

        const newPasswordHash = await hash(newPassword, 10);

        return this.userRepo.update(userId, { passwordHash: newPasswordHash });
    }

    async updateLanguage(userId: string, language: string): Promise<User> {
        return this.userRepo.update(userId, { language });
    }

    async updateEmail(userId: string, email: string): Promise<User> {
        // Проверяем, не занят ли email другим пользователем
        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
            throw new Error('Email already exists');
        }
        return this.userRepo.update(userId, { email });
    }

    async convertGuestToUser(userId: string, email: string, password: string, name?: string, language?: string): Promise<User> {
        const user = await this.userRepo.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        if (!user.isGuest) {
            throw new Error('User is not a guest');
        }

        // Проверяем, не занят ли email другим пользователем
        const existingUser = await this.userRepo.findByEmail(email);
        if (existingUser && existingUser.id !== userId) {
            throw new Error('Email already exists');
        }

        const passwordHash = await hash(password, 10);
        
        return this.userRepo.update(userId, {
            email,
            passwordHash,
            name,
            language,
            isGuest: false,
        });
    }

    async loginWithGoogle(googleIdToken: string): Promise<string> {
        const payload = await this.verifyGoogleToken(googleIdToken);
        const { sub, email, name } = payload;

        let user = await this.userRepo.findByOAuth('google', sub);

        if (!user) {
            const existingByEmail = await this.userRepo.findByEmail(email);
            if (existingByEmail) {
                user = await this.userRepo.update(existingByEmail.id, {
                    oauthProvider: 'google',
                    oauthId: sub,
                });
            } else {
                const placeholderHash = await hash(randomUUID(), 10);
                user = await this.userRepo.create({
                    email,
                    passwordHash: placeholderHash,
                    name: name || undefined,
                    oauthProvider: 'google',
                    oauthId: sub,
                });
            }
        }

        return jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });
    }

    private async verifyGoogleToken(
        idToken: string
    ): Promise<{ sub: string; email: string; name?: string }> {
        const clientId = process.env.GOOGLE_CLIENT_ID;
        if (!clientId) {
            throw new Error('GOOGLE_CLIENT_ID is not configured');
        }

        const client = new OAuth2Client(clientId);
        const ticket = await client.verifyIdToken({
            idToken,
            audience: clientId,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.sub || !payload.email) {
            throw new Error('Invalid Google token: missing sub or email');
        }
        return {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
        };
    }
}