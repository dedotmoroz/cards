import {
    AdminAuditAction,
    AdminUsersListResult,
    UserStats,
} from '../domain/admin';
import {
    AdminListUsersQuery,
    AdminRepository,
} from '../ports/admin-repository';
import { UserService } from './user-service';

export class AdminActionForbiddenError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AdminActionForbiddenError';
    }
}

export class AdminTargetNotFoundError extends Error {
    constructor() {
        super('Target user not found');
        this.name = 'AdminTargetNotFoundError';
    }
}

export class AdminService {
    constructor(
        private readonly adminRepo: AdminRepository,
        private readonly userService: UserService
    ) {}

    isAdmin(userId: string): Promise<boolean> {
        return this.adminRepo.isAdmin(userId);
    }

    listUsers(query: AdminListUsersQuery): Promise<AdminUsersListResult> {
        return this.adminRepo.listUsers(query);
    }

    async getUserStats(userId: string): Promise<UserStats> {
        const stats = await this.adminRepo.getUserStats(userId);
        if (!stats) throw new AdminTargetNotFoundError();
        return stats;
    }

    async deleteUser(adminUserId: string, targetUserId: string): Promise<void> {
        if (adminUserId === targetUserId) {
            throw new AdminActionForbiddenError('Admin cannot delete himself');
        }

        const target = await this.userService.getById(targetUserId);
        if (!target) {
            throw new AdminTargetNotFoundError();
        }

        const targetIsAdmin = await this.adminRepo.isAdmin(targetUserId);
        if (targetIsAdmin) {
            throw new AdminActionForbiddenError('Cannot delete another admin');
        }

        await this.userService.deleteUserById(targetUserId);
        await this.adminRepo.logAction(adminUserId, 'delete_user', targetUserId, {
            email: target.email,
        });
    }

    async assertCanImpersonate(
        adminUserId: string,
        targetUserId: string
    ): Promise<void> {
        if (adminUserId === targetUserId) {
            throw new AdminActionForbiddenError('Cannot impersonate yourself');
        }
        const target = await this.userService.getById(targetUserId);
        if (!target) {
            throw new AdminTargetNotFoundError();
        }
        const targetIsAdmin = await this.adminRepo.isAdmin(targetUserId);
        if (targetIsAdmin) {
            throw new AdminActionForbiddenError('Cannot impersonate another admin');
        }
    }

    logImpersonationStart(
        adminUserId: string,
        targetUserId: string
    ): Promise<void> {
        return this.adminRepo.logAction(
            adminUserId,
            'impersonate_start',
            targetUserId
        );
    }

    logImpersonationStop(
        adminUserId: string,
        targetUserId: string | null
    ): Promise<void> {
        return this.adminRepo.logAction(
            adminUserId,
            'impersonate_stop',
            targetUserId
        );
    }

    logAction(
        adminUserId: string,
        action: AdminAuditAction,
        targetUserId: string | null,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        return this.adminRepo.logAction(adminUserId, action, targetUserId, metadata);
    }
}
