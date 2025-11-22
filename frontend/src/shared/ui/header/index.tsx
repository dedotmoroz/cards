import {
    Box,
    AppBar,
    Toolbar,
    IconButton,
    useMediaQuery,
    useTheme
} from '@mui/material';
import { Menu as MenuIcon, Pets } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import {useNavigate} from "react-router-dom";
import {useState} from "react";
import {type ReactNode} from "react";
import {UserProfile} from "@/widgets/user-profile";

interface HeaderToolbarProps {
    learnWordsButton: ReactNode;
    learnPhrasesButton: ReactNode;
    learnWordsMoreButton: ReactNode;
    selectSide: ReactNode;
}

export const HeaderToolbar = ({ learnWordsButton, learnPhrasesButton, learnWordsMoreButton, selectSide }: HeaderToolbarProps) => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));


    const [mobileOpen, setMobileOpen] = useState(false);

    const goToHome = () => {
        navigate('/');
    }

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
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
                    {selectSide}
                    {learnWordsButton}
                    {learnPhrasesButton}
                    {learnWordsMoreButton}
                </Box>

                <UserProfile />
            </Toolbar>
        </AppBar>
    )
}