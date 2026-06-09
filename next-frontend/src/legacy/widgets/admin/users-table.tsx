import { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LoginIcon from '@mui/icons-material/Login';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { adminApi, type AdminUserListItem } from '@/shared/api/adminApi';
import { useAuthStore } from '@/shared/store/authStore';

function formatDate(value: string | null): string {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

export function AdminUsersTable() {
    const [rows, setRows] = useState<AdminUserListItem[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(25);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [impersonatingId, setImpersonatingId] = useState<string | null>(null);

    const { user, impersonate } = useAuthStore();
    const currentUserId = user?.id;

    const offset = useMemo(() => page * rowsPerPage, [page, rowsPerPage]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        adminApi
            .listUsers({ search: search || undefined, limit: rowsPerPage, offset })
            .then((data) => {
                if (cancelled) return;
                setRows(data.rows);
                setTotal(data.total);
            })
            .catch((err) => {
                if (cancelled) return;
                setError(err?.response?.data?.error ?? err?.message ?? 'Failed to load users');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [rowsPerPage, offset, search]);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(0);
        setSearch(searchInput.trim());
    };

    const handleDelete = async (row: AdminUserListItem) => {
        const confirmed = window.confirm(
            `Удалить пользователя ${row.email}? Все его папки и карточки будут удалены безвозвратно.`
        );
        if (!confirmed) return;

        setDeletingId(row.id);
        setActionError(null);
        try {
            await adminApi.deleteUser(row.id);
            setRows((prev) => prev.filter((r) => r.id !== row.id));
            setTotal((prev) => Math.max(0, prev - 1));
        } catch (err: any) {
            setActionError(err?.response?.data?.error ?? err?.message ?? 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    const handleImpersonate = async (row: AdminUserListItem) => {
        setImpersonatingId(row.id);
        setActionError(null);
        try {
            await impersonate(row.id);
        } catch (err: any) {
            setActionError(err?.response?.data?.error ?? err?.message ?? 'Impersonation failed');
        } finally {
            setImpersonatingId(null);
        }
    };

    return (
        <Paper sx={{ p: 2 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ flexGrow: 1 }}>
                    Пользователи
                </Typography>
                <Box component="form" onSubmit={handleSearchSubmit} sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                        size="small"
                        placeholder="Поиск по email или имени"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                    />
                    <Button type="submit" variant="outlined">
                        Найти
                    </Button>
                </Box>
            </Stack>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}
            {actionError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {actionError}
                </Alert>
            )}

            <TableContainer>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Email</TableCell>
                            <TableCell>Имя</TableCell>
                            <TableCell align="right">Папок</TableCell>
                            <TableCell align="right">Карточек</TableCell>
                            <TableCell>Регистрация</TableCell>
                            <TableCell>Последний вход</TableCell>
                            <TableCell>Тип</TableCell>
                            <TableCell align="right">Действия</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <CircularProgress size={24} />
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading && rows.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={8} align="center">
                                    <Typography color="text.secondary">Нет данных</Typography>
                                </TableCell>
                            </TableRow>
                        )}
                        {!loading &&
                            rows.map((row) => {
                                const isSelf = row.id === currentUserId;
                                const isAdminRow = row.isAdmin;
                                const disableDelete = isSelf || isAdminRow || deletingId === row.id;
                                const disableImpersonate = isSelf || isAdminRow || impersonatingId === row.id;
                                return (
                                    <TableRow key={row.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <span>{row.email}</span>
                                                {row.isAdmin && <Chip size="small" color="primary" label="admin" />}
                                                {row.isGuest && <Chip size="small" label="guest" />}
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{row.name ?? '—'}</TableCell>
                                        <TableCell align="right">{row.foldersCount}</TableCell>
                                        <TableCell align="right">{row.cardsCount}</TableCell>
                                        <TableCell>{formatDate(row.createdAt)}</TableCell>
                                        <TableCell>{formatDate(row.lastLoginAt)}</TableCell>
                                        <TableCell>{row.isGuest ? 'Гость' : 'Пользователь'}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Подробная статистика">
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        component={RouterLink}
                                                        to={`/admin/users/${row.id}`}
                                                    >
                                                        <OpenInNewIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip
                                                title={
                                                    isSelf
                                                        ? 'Нельзя войти под собой'
                                                        : isAdminRow
                                                            ? 'Нельзя войти под другим админом'
                                                            : 'Войти под пользователем'
                                                }
                                            >
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        disabled={disableImpersonate}
                                                        onClick={() => handleImpersonate(row)}
                                                    >
                                                        <LoginIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                            <Tooltip
                                                title={
                                                    isSelf
                                                        ? 'Нельзя удалить себя'
                                                        : isAdminRow
                                                            ? 'Нельзя удалить другого админа'
                                                            : 'Удалить пользователя'
                                                }
                                            >
                                                <span>
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        disabled={disableDelete}
                                                        onClick={() => handleDelete(row)}
                                                    >
                                                        <DeleteOutlineIcon fontSize="small" />
                                                    </IconButton>
                                                </span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                component="div"
                count={total}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={[10, 25, 50, 100]}
            />
        </Paper>
    );
}
