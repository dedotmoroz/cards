import { Menu as MenuIcon } from '@mui/icons-material';
import { StyledMenuButton } from './styled-components.ts'

interface MobileMenuIconProps {
    handle: () => void;
}

export const MobileMenuIcon = ({ handle }: MobileMenuIconProps) => {
    return (
            <StyledMenuButton
                variant="contained"
                color="inherit"
                onClick={handle}
                aria-label="open drawer"
            >
                <MenuIcon />
            </StyledMenuButton>
    )
}