import {type ReactNode } from "react";
import {useNavigate} from "react-router-dom";
import {Box, AppBar, useMediaQuery, useTheme} from '@mui/material';
import {UserProfile} from "@/widgets/user-profile";
import {Logo, MobileMenuIcon} from "@/shared/ui";
import { StyledNavigationBox, StyledToolbar } from './styled-components.ts'

interface HeaderToolbarProps {
    learnWordsButton: ReactNode;
    learnPhrasesButton: ReactNode;
    learnWordsMoreButton: ReactNode;
    selectSide: ReactNode;
    onDrawerToggle?: () => void;
}

export const HeaderToolbar = ({
                                  learnWordsButton,
                                  learnPhrasesButton,
                                  // learnWordsMoreButton,
                                  // selectSide,
                                  onDrawerToggle
                              }: HeaderToolbarProps) => {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const goToHome = () => {
        navigate('/');
    }

    return (
        <AppBar position={isMobile ? "fixed" : "fixed"}>
            <StyledToolbar>
                {isMobile ? (
                    <MobileMenuIcon handle={onDrawerToggle || (() => {})} />
                ) : (
                    <Logo handle={goToHome}  />
                )}
                <Box sx={{ flexGrow: 1 }} />
                <StyledNavigationBox>
                    {/*{selectSide}*/}
                    {learnWordsButton}
                    {learnPhrasesButton}
                    {/*{learnWordsMoreButton}*/}
                </StyledNavigationBox>
                <UserProfile />
            </StyledToolbar>
        </AppBar>
    )
}