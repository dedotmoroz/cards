import { sql, eq, asc, desc, and, or, ilike } from 'drizzle-orm';
import { db } from '../../db/db';
import { adminAuditLog, adminUsers, cards, folders, users } from '../../db/schema';
import {
    AdminListUsersQuery,
    AdminRepository,
} from '../../ports/admin-repository';
import {
    AdminAuditAction,
    AdminListItem,
    AdminUsersListResult,
    UserStats,
} from '../../domain/admin';

export class PostgresAdminRepository implements AdminRepository {
    async isAdmin(userId: string): Promise<boolean> {
        if (!userId) return false;
        const rows = await db
            .select({ userId: adminUsers.userId })
            .from(adminUsers)
            .where(eq(adminUsers.userId, userId))
            .limit(1);
        return rows.length > 0;
    }

    async listUsers(query: AdminListUsersQuery): Promise<AdminUsersListResult> {
        const { search, limit, offset, sort = 'createdAt', sortDirection = 'desc' } = query;

        const foldersAgg = db
            .select({
                userId: folders.userId,
                foldersCount: sql<number>`COUNT(*)::int`.as('folders_count'),
            })
            .from(folders)
            .groupBy(folders.userId)
            .as('folders_agg');

        const cardsAgg = db
            .select({
                userId: folders.userId,
                cardsCount: sql<number>`COUNT(${cards.id})::int`.as('cards_count'),
            })
            .from(folders)
            .leftJoin(cards, eq(cards.folderId, sql`${folders.id}::uuid`))
            .groupBy(folders.userId)
            .as('cards_agg');

        const whereClause = search
            ? or(
                  ilike(users.email, `%${search}%`),
                  ilike(users.name, `%${search}%`)
              )
            : undefined;

        const sortColumn =
            sort === 'email'
                ? users.email
                : sort === 'lastLoginAt'
                    ? users.last_login_at
                    : users.created_at;

        const orderExpr = sortDirection === 'asc' ? asc(sortColumn) : desc(sortColumn);

        const baseSelect = db
            .select({
                id: users.id,
                email: users.email,
                name: users.name,
                createdAt: users.created_at,
                lastLoginAt: users.last_login_at,
                isGuest: users.is_guest,
                foldersCount: sql<number>`COALESCE(${foldersAgg.foldersCount}, 0)::int`,
                cardsCount: sql<number>`COALESCE(${cardsAgg.cardsCount}, 0)::int`,
                isAdmin: sql<boolean>`${adminUsers.userId} IS NOT NULL`,
            })
            .from(users)
            .leftJoin(foldersAgg, eq(foldersAgg.userId, users.id))
            .leftJoin(cardsAgg, eq(cardsAgg.userId, users.id))
            .leftJoin(adminUsers, eq(adminUsers.userId, users.id));

        const rowsQuery = whereClause ? baseSelect.where(whereClause) : baseSelect;

        const rows = await rowsQuery
            .orderBy(orderExpr)
            .limit(limit)
            .offset(offset);

        const totalQuery = db
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(users);
        const totalRows = whereClause
            ? await totalQuery.where(whereClause)
            : await totalQuery;
        const total = Number(totalRows[0]?.count ?? 0);

        const list: AdminListItem[] = rows.map((row) => ({
            id: row.id,
            email: row.email,
            name: row.name ?? null,
            createdAt: row.createdAt,
            lastLoginAt: row.lastLoginAt ?? null,
            isGuest: row.isGuest ?? false,
            isAdmin: Boolean(row.isAdmin),
            foldersCount: Number(row.foldersCount ?? 0),
            cardsCount: Number(row.cardsCount ?? 0),
        }));

        return { rows: list, total };
    }

    async getUserStats(userId: string): Promise<UserStats | null> {
        const userRows = await db
            .select()
            .from(users)
            .where(eq(users.id, userId))
            .limit(1);

        const userRow = userRows[0];
        if (!userRow) return null;

        const foldersCountRows = await db
            .select({ count: sql<number>`COUNT(*)::int` })
            .from(folders)
            .where(eq(folders.userId, userId));
        const foldersCount = Number(foldersCountRows[0]?.count ?? 0);

        const cardsTotalRows = await db
            .select({ count: sql<number>`COUNT(${cards.id})::int` })
            .from(folders)
            .leftJoin(cards, eq(cards.folderId, sql`${folders.id}::uuid`))
            .where(eq(folders.userId, userId));
        const cardsCount = Number(cardsTotalRows[0]?.count ?? 0);

        const learnedRows = await db
            .select({ count: sql<number>`COUNT(${cards.id})::int` })
            .from(folders)
            .leftJoin(cards, eq(cards.folderId, sql`${folders.id}::uuid`))
            .where(and(eq(folders.userId, userId), eq(cards.isLearned, true)));
        const learnedCardsCount = Number(learnedRows[0]?.count ?? 0);

        const isAdminFlag = await this.isAdmin(userId);

        return {
            id: userRow.id,
            email: userRow.email,
            name: userRow.name ?? null,
            createdAt: userRow.created_at,
            lastLoginAt: userRow.last_login_at ?? null,
            isGuest: userRow.is_guest ?? false,
            isAdmin: isAdminFlag,
            language: userRow.language ?? null,
            oauthProvider: userRow.oauth_provider ?? null,
            foldersCount,
            cardsCount,
            learnedCardsCount,
        };
    }

    async logAction(
        adminUserId: string,
        action: AdminAuditAction,
        targetUserId: string | null,
        metadata?: Record<string, unknown>
    ): Promise<void> {
        await db.insert(adminAuditLog).values({
            adminUserId,
            action,
            targetUserId: targetUserId ?? null,
            metadata: metadata ?? null,
        });
    }
}
