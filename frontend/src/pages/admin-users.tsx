import { Box, Container, Typography } from '@mui/material';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/shared/store/authStore';
import { AdminUsersTable } from '@/widgets/admin';

export function AdminUsersPage() {
    const { user, isAuthenticated } = useAuthStore();

    if (!isAuthenticated || !user?.isAdmin) {
        return <Navigate to="/" replace />;
    }

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box mb={3}>
                <Typography variant="h4" component="h1">
                    Админка — пользователи
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Список всех пользователей со статистикой по карточкам и папкам.
                </Typography>
            </Box>
            <AdminUsersTable />
        </Container>
    );
}
