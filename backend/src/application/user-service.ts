import { User } from '../domain/user';
import { UserRepository } from '../ports/user-repository';
import { hash, compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';

export class UserService {
    private readonly jwtSecret: string;

    constructor(private userRepo: UserRepository) {
        const JWT_SECRET = process.env.JWT_SECRET;
        if (!JWT_SECRET) {
            throw new Error('JWT_SECRET is not defined in environment variables');
        }
        this.jwtSecret = JWT_SECRET;
    }


    async register(email: string, password: string): Promise<User> {
        const passwordHash = await hash(password, 10);
        return this.userRepo.create({ email, passwordHash });
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

    async loginWithGoogle(googleIdToken: string): Promise<string> {
        // Google token verification would be done here
        // For example using Google Auth Library
        const email = await this.verifyGoogleToken(googleIdToken);

        let user = await this.userRepo.findByEmail(email);
        if (!user) {
            user = await this.userRepo.create({ email, passwordHash: '' });
        }

        return jwt.sign({ userId: user.id }, this.jwtSecret, { expiresIn: '7d' });
    }

    private async verifyGoogleToken(idToken: string): Promise<string> {
        // Mock implementation; use Google API in real code
        return 'user@example.com';
    }
}