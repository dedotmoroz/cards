import { useEffect, useState } from 'react';
import { Link as RouterLink, Navigate, useParams } from 'react-router-dom';
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    Divider,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LoginIcon from '@mui/icons-material/Login';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { adminApi, type AdminUserStats } from '@/shared/api/adminApi';
import { useAuthStore } from '@/shared/store/authStore';

function formatDate(value: string | null): string {
    if (!value) return '—';
    try {
        return new Date(value).toLocaleString();
    } catch {
        return value;
    }
}

function StatBox({ label, value }: { label: string; value: string | number }) {
    return (
        <Paper variant="outlined" sx={{ p: 2 }}>
            <Typography variant="body2" color="text.secondary">
                {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
        </Paper>
    );
}

export function AdminUserDetailPage() {
    const { id } = useParams<{ id: string }>();
    const { user, isAuthenticated, impersonate } = useAuthStore();
    const [stats, setStats] = useState<AdminUserStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);
    const [impersonating, setImpersonating] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        setLoading(true);
        setError(null);
        adminApi
            .getUserStats(id)
            .then((data) => {
                if (!cancelled) setStats(data);
            })
            .catch((err) => {
                if (!cancelled) {
                    setError(err?.response?.data?.error ?? err?.message ?? 'Failed to load stats');
                }
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [id]);

    if (!isAuthenticated || !user?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    const handleImpersonate = async () => {
        if (!stats) return;
        setImpersonating(true);
        setActionError(null);
        try {
            await impersonate(stats.id);
        } catch (err: any) {
            setActionError(err?.response?.data?.error ?? err?.message ?? 'Impersonation failed');
        } finally {
            setImpersonating(false);
        }
    };

    const handleDelete = async () => {
        if (!stats) return;
        const ok = window.confirm(
            `Удалить пользователя ${stats.email}? Все его папки и карточки будут удалены безвозвратно.`
        );
        if (!ok) return;
        setDeleting(true);
        setActionError(null);
        try {
            await adminApi.deleteUser(stats.id);
            window.location.assign('/admin');
        } catch (err: any) {
            setActionError(err?.response?.data?.error ?? err?.message ?? 'Delete failed');
            setDeleting(false);
        }
    };

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                <Button
                    component={RouterLink}
                    to="/admin"
                    startIcon={<ArrowBackIcon />}
                    size="small"
                >
                    К списку пользователей
                </Button>
            </Stack>

            {loading && (
                <Box display="flex" justifyContent="center" my={4}>
                    <CircularProgress />
                </Box>
            )}

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

            {stats && (
                <>
                    <Paper sx={{ p: 3, mb: 3 }}>
                        <Stack
                            direction={{ xs: 'column', md: 'row' }}
                            justifyContent="space-between"
                            alignItems={{ xs: 'flex-start', md: 'center' }}
                            spacing={2}
                        >
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                    <Typography variant="h5">{stats.email}</Typography>
                                    {stats.isAdmin && <Chip size="small" color="primary" label="admin" />}
                                    {stats.isGuest && <Chip size="small" label="guest" />}
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                    ID: {stats.id}
                                </Typography>
                            </Box>
                            <Stack direction="row" spacing={1}>
                                <Button
                                    variant="outlined"
                                    startIcon={<LoginIcon />}
                                    disabled={stats.isAdmin || stats.id === user?.id || impersonating}
                                    onClick={handleImpersonate}
                                >
                                    Войти под пользователем
                                </Button>
                                <Button
                                    variant="outlined"
                                    color="error"
                                    startIcon={<DeleteOutlineIcon />}
                                    disabled={stats.isAdmin || stats.id === user?.id || deleting}
                                    onClick={handleDelete}
                                >
                                    Удалить
                                </Button>
                            </Stack>
                        </Stack>

                        <Divider sx={{ my: 3 }} />

                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                    md: 'repeat(4, 1fr)',
                                },
                            }}
                        >
                            <StatBox label="Папок" value={stats.foldersCount} />
                            <StatBox label="Карточек" value={stats.cardsCount} />
                            <StatBox label="Выучено карточек" value={stats.learnedCardsCount} />
                            <StatBox label="Язык" value={stats.language ?? '—'} />
                        </Box>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" mb={2}>
                            Информация об аккаунте
                        </Typography>
                        <Box
                            sx={{
                                display: 'grid',
                                gap: 2,
                                gridTemplateColumns: {
                                    xs: '1fr',
                                    sm: 'repeat(2, 1fr)',
                                },
                            }}
                        >
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Имя
                                </Typography>
                                <Typography>{stats.name ?? '—'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    OAuth-провайдер
                                </Typography>
                                <Typography>{stats.oauthProvider ?? '—'}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Дата регистрации
                                </Typography>
                                <Typography>{formatDate(stats.createdAt)}</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" color="text.secondary">
                                    Последний вход
                                </Typography>
                                <Typography>{formatDate(stats.lastLoginAt)}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </>
            )}
        </Container>
    );
}
