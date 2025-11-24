import {type ReactNode, useState} from "react";
import {useNavigate} from "react-router-dom";
import {Box, AppBar, Toolbar, useMediaQuery, useTheme} from '@mui/material';
import {UserProfile} from "@/widgets/user-profile";
import {Logo, MobileMenuIcon} from "@/shared/ui";

interface HeaderToolbarProps {
    learnWordsButton: ReactNode;
    learnPhrasesButton: ReactNode;
    learnWordsMoreButton: ReactNode;
    selectSide: ReactNode;
}

export const HeaderToolbar = ({
                                  learnWordsButton,
                                  learnPhrasesButton,
                                  // learnWordsMoreButton,
                                  selectSide }: HeaderToolbarProps) => {
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
                    <MobileMenuIcon handle={handleDrawerToggle} />
                ) : (
                    <Logo handle={goToHome}  />
                )}
                <Box sx={{ flexGrow: 1 }} />
                <Box display="flex" mb={4} gap={2} justifyContent="flex-end" alignItems="center">
                    {selectSide}
                    {learnWordsButton}
                    {learnPhrasesButton}
                    {/*{learnWordsMoreButton}*/}
                </Box>
                <UserProfile />
            </Toolbar>
        </AppBar>
    )
}