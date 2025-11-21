import {
    Box,
    Typography,
    Button,
    AppBar,
    Toolbar,
    IconButton,
    useMediaQuery,
    useTheme,
    Tooltip,
    InputLabel, Select, MenuItem, FormControl
} from '@mui/material';
import { Menu as MenuIcon, AccountCircle, Logout, Pets } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {useNavigate} from "react-router-dom";
import {useAuthStore} from "@/shared/store/authStore.ts";
import {useState} from "react";
import {useFoldersStore} from "@/shared/store/foldersStore.ts";
import {useCardsStore} from "@/shared/store/cardsStore.ts";


export const HeaderToolbar = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, logout } = useAuthStore();

    const [initialSide, setInitialSide] = useState<'question' | 'answer'>(() => {
        const saved = localStorage.getItem('cardInitialSide');
        return (saved === 'answer' || saved === 'question') ? saved : 'question';
    });

    const handleInitialSideChange = (side: 'question' | 'answer') => {
        setInitialSide(side);
        localStorage.setItem('cardInitialSide', side);
    };

    const {
        cards,
    } = useCardsStore();
    const { selectedFolderId } = useFoldersStore();

    const [mobileOpen, setMobileOpen] = useState(false);

    const goToHome = () => {
        navigate('/');
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const logoutHandler = async () => {
        await logout();
        navigate('/');
    }

    const handleStartLearning = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?initialSide=${initialSide}`);
        }
    };

    const handleStartLearningUnlearned = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?mode=unlearned&initialSide=${initialSide}`);
        }
    };

    const handleStartLearningPhrases = () => {
        if (selectedFolderId) {
            navigate(`/learn/${selectedFolderId}?mode=phrases&initialSide=${initialSide}`);
        }
    };

    return (
        <AppBar position={isMobile ? "fixed" : "fixed"}>
            <Toolbar>
                {isMobile ? (
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2 }}
                    >
                        <MenuIcon />
                    </IconButton>
                ) : (
                    <IconButton
                        color="inherit"
                        aria-label={t('navigation.home')}
                        edge="start"
                        onClick={goToHome}
                        sx={{mr: 2}}
                    >
                        <Pets/>
                    </IconButton>
                )}
                <Box sx={{ flexGrow: 1 }} />


                <Box display="flex" mb={4} gap={2} justifyContent="flex-end" alignItems="center">
                    <FormControl size="small" sx={{minWidth: 180}}>
                        <InputLabel>{t('learning.initialSide')}</InputLabel>
                        <Select
                            value={initialSide}
                            label={t('learning.initialSide')}
                            onChange={(e) => handleInitialSideChange(e.target.value as 'question' | 'answer')}
                            sx={{borderRadius: 2}}
                        >
                            <MenuItem value="question">{t('learning.showQuestion')}</MenuItem>
                            <MenuItem value="answer">{t('learning.showAnswer')}</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        onClick={handleStartLearning}
                        variant="contained"
                        disabled={!selectedFolderId || cards.length === 0}
                        sx={{borderRadius: 8}}
                    >
                        {t('buttons.startLearning')}
                    </Button>
                    <Button
                        onClick={handleStartLearningPhrases}
                        variant="contained"
                        disabled={!selectedFolderId || cards.length === 0 || !cards.some(card => card.questionSentences && card.answerSentences)}
                        sx={{borderRadius: 8}}
                    >
                        {t('buttons.learnPhrases')}
                    </Button>
                    <Button
                        onClick={handleStartLearningUnlearned}
                        variant="contained"
                        color="secondary"
                        disabled={!selectedFolderId || cards.length === 0}
                        sx={{borderRadius: 8}}
                    >
                        {t('learning.wantToContinue')}
                    </Button>
                </Box>

                {user ? (
                    <Box display="flex" alignItems="center" gap={2}>
                        <Tooltip title={t('profile.openProfile')}>
                            <Box display="flex" alignItems="center">
                                <IconButton color="inherit" size="large" onClick={() => navigate('/profile')}>
                                    <AccountCircle/>
                                </IconButton>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        maxWidth: '50px',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {user.username}
                                </Typography>
                            </Box>
                        </Tooltip>

                        <Tooltip title={t('home.logout')}>
                            <IconButton color="inherit" onClick={logoutHandler} size="large">
                                <Logout />
                            </IconButton>
                        </Tooltip>
                    </Box>
                ) : (
                    <Box display="flex" gap={1}>
                        <Button color="inherit" onClick={() => navigate('/signin')}>
                            {t('auth.login')}
                        </Button>
                        <Button color="inherit" onClick={() => navigate('/signup')}>
                            {t('auth.register')}
                        </Button>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    )
}