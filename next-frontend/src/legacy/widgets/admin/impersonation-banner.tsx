import { Alert, Button, Stack, Typography } from '@mui/material';
import { useAuthStore } from '@/shared/store/authStore';

export function ImpersonationBanner() {
    const { user, stopImpersonation } = useAuthStore();
    if (!user?.impersonatedBy) {
        return null;
    }

    const handleStop = async () => {
        try {
            await stopImpersonation();
        } catch {
            // ошибка уже сохранена в store
        }
    };

    return (
        <Alert
            severity="warning"
            sx={{
                borderRadius: 0,
                position: 'sticky',
                top: 0,
                zIndex: 1300,
            }}
            action={
                <Button color="inherit" size="small" onClick={handleStop}>
                    Выйти обратно в админа
                </Button>
            }
        >
            <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">
                    Вы вошли под пользователем <strong>{user.email}</strong>.
                </Typography>
            </Stack>
        </Alert>
    );
}
