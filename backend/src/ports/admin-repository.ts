import {
    AdminAuditAction,
    AdminUsersListResult,
    UserStats,
} from '../domain/admin';

export type AdminUsersSort = 'createdAt' | 'lastLoginAt' | 'email';

export interface AdminListUsersQuery {
    search?: string;
    limit: number;
    offset: number;
    sort?: AdminUsersSort;
    sortDirection?: 'asc' | 'desc';
}

export interface AdminRepository {
    isAdmin(userId: string): Promise<boolean>;
    listUsers(query: AdminListUsersQuery): Promise<AdminUsersListResult>;
    getUserStats(userId: string): Promise<UserStats | null>;
    logAction(
        adminUserId: string,
        action: AdminAuditAction,
        targetUserId: string | null,
        metadata?: Record<string, unknown>
    ): Promise<void>;
}
