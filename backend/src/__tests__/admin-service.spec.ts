import {
    AdminService,
    AdminActionForbiddenError,
    AdminTargetNotFoundError,
} from '../application/admin-service';
import { AdminRepository } from '../ports/admin-repository';
import { UserService } from '../application/user-service';

describe('AdminService', () => {
    const adminUserId = 'admin-1';
    const targetUserId = 'user-2';

    let adminRepo: jest.Mocked<AdminRepository>;
    let userService: jest.Mocked<Pick<UserService, 'getById' | 'deleteUserById'>>;
    let service: AdminService;

    beforeEach(() => {
        adminRepo = {
            isAdmin: jest.fn(),
            listUsers: jest.fn(),
            getUserStats: jest.fn(),
            logAction: jest.fn().mockResolvedValue(undefined),
        };
        userService = {
            getById: jest.fn(),
            deleteUserById: jest.fn().mockResolvedValue(undefined),
        };
        service = new AdminService(adminRepo, userService as unknown as UserService);
    });

    describe('deleteUser', () => {
        it('forbids deleting yourself', async () => {
            await expect(service.deleteUser(adminUserId, adminUserId)).rejects.toBeInstanceOf(
                AdminActionForbiddenError
            );
            expect(userService.deleteUserById).not.toHaveBeenCalled();
        });

        it('throws when target not found', async () => {
            userService.getById.mockResolvedValueOnce(null);
            await expect(service.deleteUser(adminUserId, targetUserId)).rejects.toBeInstanceOf(
                AdminTargetNotFoundError
            );
        });

        it('forbids deleting another admin', async () => {
            userService.getById.mockResolvedValueOnce({
                id: targetUserId,
                email: 't@example.com',
                passwordHash: 'x',
                createdAt: new Date(),
            });
            adminRepo.isAdmin.mockResolvedValueOnce(true);
            await expect(service.deleteUser(adminUserId, targetUserId)).rejects.toBeInstanceOf(
                AdminActionForbiddenError
            );
            expect(userService.deleteUserById).not.toHaveBeenCalled();
        });

        it('deletes user and writes audit log', async () => {
            userService.getById.mockResolvedValueOnce({
                id: targetUserId,
                email: 't@example.com',
                passwordHash: 'x',
                createdAt: new Date(),
            });
            adminRepo.isAdmin.mockResolvedValueOnce(false);

            await service.deleteUser(adminUserId, targetUserId);

            expect(userService.deleteUserById).toHaveBeenCalledWith(targetUserId);
            expect(adminRepo.logAction).toHaveBeenCalledWith(
                adminUserId,
                'delete_user',
                targetUserId,
                expect.objectContaining({ email: 't@example.com' })
            );
        });
    });

    describe('assertCanImpersonate', () => {
        it('forbids impersonating yourself', async () => {
            await expect(
                service.assertCanImpersonate(adminUserId, adminUserId)
            ).rejects.toBeInstanceOf(AdminActionForbiddenError);
        });

        it('throws when target not found', async () => {
            userService.getById.mockResolvedValueOnce(null);
            await expect(
                service.assertCanImpersonate(adminUserId, targetUserId)
            ).rejects.toBeInstanceOf(AdminTargetNotFoundError);
        });

        it('forbids impersonating another admin', async () => {
            userService.getById.mockResolvedValueOnce({
                id: targetUserId,
                email: 't@example.com',
                passwordHash: 'x',
                createdAt: new Date(),
            });
            adminRepo.isAdmin.mockResolvedValueOnce(true);

            await expect(
                service.assertCanImpersonate(adminUserId, targetUserId)
            ).rejects.toBeInstanceOf(AdminActionForbiddenError);
        });

        it('passes for valid non-admin target', async () => {
            userService.getById.mockResolvedValueOnce({
                id: targetUserId,
                email: 't@example.com',
                passwordHash: 'x',
                createdAt: new Date(),
            });
            adminRepo.isAdmin.mockResolvedValueOnce(false);

            await expect(
                service.assertCanImpersonate(adminUserId, targetUserId)
            ).resolves.toBeUndefined();
        });
    });

    describe('getUserStats', () => {
        it('throws when user not found', async () => {
            adminRepo.getUserStats.mockResolvedValueOnce(null);
            await expect(service.getUserStats(targetUserId)).rejects.toBeInstanceOf(
                AdminTargetNotFoundError
            );
        });

        it('returns stats from repo', async () => {
            const stats = {
                id: targetUserId,
                email: 't@example.com',
                name: 'T',
                createdAt: new Date(),
                lastLoginAt: null,
                isGuest: false,
                isAdmin: false,
                language: 'ru',
                oauthProvider: null,
                foldersCount: 1,
                cardsCount: 2,
                learnedCardsCount: 0,
            };
            adminRepo.getUserStats.mockResolvedValueOnce(stats);
            await expect(service.getUserStats(targetUserId)).resolves.toEqual(stats);
        });
    });

    describe('logImpersonationStart / logImpersonationStop', () => {
        it('writes start and stop entries', async () => {
            await service.logImpersonationStart(adminUserId, targetUserId);
            await service.logImpersonationStop(adminUserId, targetUserId);

            expect(adminRepo.logAction).toHaveBeenNthCalledWith(
                1,
                adminUserId,
                'impersonate_start',
                targetUserId
            );
            expect(adminRepo.logAction).toHaveBeenNthCalledWith(
                2,
                adminUserId,
                'impersonate_stop',
                targetUserId
            );
        });
    });
});
