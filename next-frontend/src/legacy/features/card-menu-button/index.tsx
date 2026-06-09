import { IconButton } from '@mui/material';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

interface CardMenuButtonProps {
    cardId: string;
    onMenuOpen: (event: React.MouseEvent<HTMLElement>, cardId: string) => void;
}

export const CardMenuButton = ({ cardId, onMenuOpen }: CardMenuButtonProps) => {
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
        onMenuOpen(e, cardId);
    };

    return (
        <IconButton 
            size="small" 
            onClick={handleClick}
            sx={{ marginLeft: '12px' }}
        >
            <MoreHorizIcon/>
        </IconButton>
    );
};

